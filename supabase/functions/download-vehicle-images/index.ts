import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

async function callAI(apiKey: string, messages: { role: string; content: any }[], model = "google/gemini-2.5-flash"): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI call failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function detectWatermark(apiKey: string, imageUrl: string): Promise<boolean> {
  try {
    const result = await callAI(apiKey, [
      {
        role: "user",
        content: [
          { type: "text", text: "Does this vehicle image contain any watermark, overlay text, or dealer logo? Answer only YES or NO." },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ]);
    return result.trim().toUpperCase().startsWith("YES");
  } catch (e) {
    console.warn("Watermark detection failed:", e);
    return false;
  }
}

async function detectLicensePlate(apiKey: string, imageUrl: string): Promise<boolean> {
  try {
    const result = await callAI(apiKey, [
      {
        role: "user",
        content: [
          { type: "text", text: "Is there a clearly visible and readable license plate in this vehicle image? Answer only YES or NO." },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ]);
    return result.trim().toUpperCase().startsWith("YES");
  } catch (e) {
    console.warn("License plate detection failed:", e);
    return false;
  }
}

async function removeWatermarkAI(apiKey: string, imageUrl: string): Promise<string | null> {
  try {
    const result = await callAI(apiKey, [
      {
        role: "user",
        content: [
          { type: "text", text: "Remove any watermark, overlay text, or dealer logo from this vehicle image. Return the cleaned image." },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ], "google/gemini-2.5-flash-image");
    // The response might contain a base64 image or URL - for now we'll skip this step
    // as image generation from existing images is complex with current models
    return null;
  } catch {
    return null;
  }
}

async function blurLicensePlateAI(apiKey: string, imageUrl: string): Promise<string | null> {
  try {
    const result = await callAI(apiKey, [
      {
        role: "user",
        content: [
          { type: "text", text: "Blur/pixelate the license plate in this vehicle image to make it unreadable. Keep everything else intact. Return the modified image." },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ], "google/gemini-2.5-flash-image");
    return null; // AI image editing not reliably available yet
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured - image processing requires AI');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { vehicle_id, image_urls } = await req.json();

    if (!vehicle_id) {
      throw new Error('vehicle_id is required');
    }

    // If image_urls provided, use them. Otherwise, get from vehicle_images table.
    let urlsToProcess: { url: string; position: number; dbId?: string }[] = [];

    if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
      urlsToProcess = image_urls.map((url: string, idx: number) => ({ url, position: idx }));
    } else {
      const { data: images, error } = await supabase
        .from('vehicle_images')
        .select('id, image_url, position')
        .eq('vehicle_id', vehicle_id)
        .order('position');

      if (error) throw error;
      if (!images || images.length === 0) {
        return new Response(
          JSON.stringify({ success: true, downloaded: 0, failed: 0, storedUrls: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      urlsToProcess = images.map(img => ({ url: img.image_url, position: img.position || 0, dbId: img.id }));
    }

    let downloaded = 0;
    let failed = 0;
    let blurred = 0;
    let blur_failures = 0;
    let watermarks_removed = 0;
    const storedUrls: string[] = [];

    for (const item of urlsToProcess) {
      try {
        // Download image
        const imageResponse = await fetch(item.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        if (!imageResponse.ok) {
          console.warn(`Failed to download: ${item.url} (${imageResponse.status})`);
          failed++;
          continue;
        }

        const imageBuffer = await imageResponse.arrayBuffer();

        // Skip tiny images (< 1000 bytes)
        if (imageBuffer.byteLength < 1000) {
          console.warn(`Image too small (${imageBuffer.byteLength} bytes), skipping: ${item.url}`);
          failed++;
          continue;
        }

        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
        const filename = `${vehicle_id}/image-${item.position}.${extension}`;

        // Watermark detection (non-blocking)
        try {
          const hasWatermark = await detectWatermark(LOVABLE_API_KEY, item.url);
          if (hasWatermark) {
            console.log(`Watermark detected on image ${item.position}`);
            // Try removal but don't block if it fails
            const cleaned = await removeWatermarkAI(LOVABLE_API_KEY, item.url);
            if (cleaned) watermarks_removed++;
          }
        } catch (e) {
          console.warn("Watermark processing error:", e);
        }

        // License plate detection
        let excludeImage = false;
        try {
          const hasPlate = await detectLicensePlate(LOVABLE_API_KEY, item.url);
          if (hasPlate) {
            console.log(`License plate detected on image ${item.position}`);
            // Try blurring (2 attempts max)
            let blurSuccess = false;
            for (let attempt = 0; attempt < 2; attempt++) {
              const blurredImg = await blurLicensePlateAI(LOVABLE_API_KEY, item.url);
              if (blurredImg) {
                blurSuccess = true;
                blurred++;
                break;
              }
            }
            if (!blurSuccess) {
              console.warn(`Failed to blur plate on image ${item.position}, excluding`);
              excludeImage = true;
              blur_failures++;
            }
          }
        } catch (e) {
          console.warn("Plate detection error:", e);
        }

        if (excludeImage) {
          failed++;
          continue;
        }

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('vehicle-images')
          .upload(filename, new Uint8Array(imageBuffer), {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          console.warn(`Upload failed for ${filename}:`, uploadError.message);
          failed++;
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('vehicle-images')
          .getPublicUrl(filename);

        const publicUrl = urlData.publicUrl;
        storedUrls.push(publicUrl);

        // Update DB if we have a dbId
        if (item.dbId) {
          await supabase
            .from('vehicle_images')
            .update({ image_url: publicUrl })
            .eq('id', item.dbId);
        }

        downloaded++;
      } catch (error) {
        console.warn(`Error processing image ${item.position}:`, error);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        downloaded,
        failed,
        blurred,
        blur_failures,
        watermarks_removed,
        storedUrls,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
