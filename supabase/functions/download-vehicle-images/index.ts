import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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
      urlsToProcess = image_urls.map((url: string, idx: number) => ({ url, position: idx }));
    } else {
      const { data: images, error } = await supabase
        .from('vehicle_images')
        .select('id, image_url, position')
        .eq('vehicle_id', vehicle_id)
        .not('image_url', 'like', '%supabase%')
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
          console.warn(`Image too small (${imageBuffer.byteLength} bytes), skipping`);
          failed++;
          continue;
        }

        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
        const filename = `${vehicle_id}/image-${item.position}.${extension}`;

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
