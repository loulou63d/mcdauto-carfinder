import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BLOCKED_IMAGE_HINTS = [
  '404-not-found',
  'not-found',
  'placeholder',
  'no-image',
  'default-image',
  'default_car',
  'logo',
  'favicon',
  'icon',
  'ecoprogram',
  'freedom-mobility',
];

function isBlockedImageUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return BLOCKED_IMAGE_HINTS.some((hint) => lower.includes(hint));
}

function looksLikePlaceholder(bytes: Uint8Array): boolean {
  return bytes.byteLength > 1000 && bytes.byteLength < 15000;
}

async function fetchSourceImageUrls(sourceUrl: string): Promise<string[]> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) return [];

  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: sourceUrl,
      formats: ['markdown', 'html'],
      onlyMainContent: false,
      waitFor: 5000,
    }),
  });

  if (!response.ok) return [];
  const data = await response.json();
  const markdown = data.data?.markdown || data.markdown || '';
  const html = data.data?.html || data.html || '';
  const allText = `${markdown} ${html}`;
  const regex = /https?:\/\/imgservice\.arielcar\.it\/rest\/v1\/gateway\/image\/[^\s)"'\]&]+/g;
  const urls = new Set<string>();

  for (const match of allText.match(regex) || []) {
    const cleaned = match.replace(/&amp;/g, '&');
    if (!isBlockedImageUrl(cleaned)) urls.add(cleaned);
  }

  return [...urls].slice(0, 20);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { vehicle_id, image_urls } = await req.json();

    if (!vehicle_id) {
      throw new Error('vehicle_id is required');
    }

    // If image_urls provided, use them. Otherwise, get from vehicle_images table.
    let urlsToProcess: { url: string; position: number; dbId?: string }[] = [];

    if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
      urlsToProcess = image_urls
        .filter((url: string) => !isBlockedImageUrl(url))
        .map((url: string, idx: number) => ({ url, position: idx }));
    } else {
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('source_url')
        .eq('id', vehicle_id)
        .maybeSingle();

      const { data: images, error } = await supabase
        .from('vehicle_images')
        .select('id, image_url, position')
        .eq('vehicle_id', vehicle_id)
        .order('position');

      if (error) throw error;
      urlsToProcess = (images || [])
        .filter((img) => !img.image_url.includes('supabase.co/storage') && !isBlockedImageUrl(img.image_url))
        .map(img => ({ url: img.image_url, position: img.position || 0, dbId: img.id }));

      if (urlsToProcess.length === 0 && vehicle?.source_url) {
        const sourceImageUrls = await fetchSourceImageUrls(vehicle.source_url);
        urlsToProcess = sourceImageUrls.map((url, idx) => ({ url, position: idx }));
      }

      if (urlsToProcess.length === 0) {
        return new Response(
          JSON.stringify({ success: true, downloaded: 0, failed: 0, storedUrls: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    let downloaded = 0;
    let failed = 0;
    const storedUrls: string[] = [];

    for (const item of urlsToProcess) {
      try {
        // Download image
        const imageResponse = await fetch(item.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Referer': 'https://arielcar.it/',
          },
        });

        if (!imageResponse.ok) {
          console.warn(`Failed to download: ${item.url} (${imageResponse.status})`);
          failed++;
          continue;
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBytes = new Uint8Array(imageBuffer);

        // Skip tiny images (< 1000 bytes)
        if (imageBuffer.byteLength < 1000) {
          console.warn(`Image too small (${imageBuffer.byteLength} bytes), skipping`);
          failed++;
          continue;
        }

        if (looksLikePlaceholder(imageBytes)) {
          console.warn(`Placeholder detected for ${item.url}`);
          failed++;
          continue;
        }

        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
        const filename = `${vehicle_id}/image-${item.position}.${extension}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('vehicle-images')
          .upload(filename, imageBytes, {
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
        } else {
          await supabase
            .from('vehicle_images')
            .upsert({
              vehicle_id,
              image_url: publicUrl,
              position: item.position,
            }, { onConflict: 'vehicle_id,position' as never });
        }

        downloaded++;
      } catch (error) {
        console.warn(`Error processing image ${item.position}:`, error);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, downloaded, failed, storedUrls }),
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
