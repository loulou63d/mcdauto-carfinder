import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BLOCKED_IMAGE_HINTS = [
  '404-not-found', 'not-found', 'placeholder', 'no-image',
  'default-image', 'default_car', 'logo', 'favicon', 'icon',
  'ecoprogram', 'freedom-mobility',
];

function isBlockedImageUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return BLOCKED_IMAGE_HINTS.some((hint) => lower.includes(hint));
}

function looksLikePlaceholder(bytes: Uint8Array): boolean {
  // Placeholder icons from ArielCar are typically 1-15KB black/white icons
  return bytes.byteLength > 500 && bytes.byteLength < 15000;
}

async function fetchSourceImageUrls(sourceUrl: string): Promise<string[]> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) return [];

  try {
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

    if (!response.ok) {
      const text = await response.text();
      console.warn('Firecrawl error:', response.status, text);
      return [];
    }
    const data = await response.json();
    const markdown = data.data?.markdown || data.markdown || '';
    const html = data.data?.html || data.html || '';
    const allText = `${markdown} ${html}`;

    // ArielCar specific image URLs
    const regex = /https?:\/\/imgservice\.arielcar\.it\/rest\/v1\/gateway\/image\/[^\s)"'\]&]+/g;
    const urls = new Set<string>();
    for (const match of allText.match(regex) || []) {
      const cleaned = match.replace(/&amp;/g, '&');
      if (!isBlockedImageUrl(cleaned)) urls.add(cleaned);
    }

    // Fallback: any jpg/jpeg/png/webp image URLs
    if (urls.size === 0) {
      const imgRegex = /https?:\/\/[^\s)"'\]]+\.(jpg|jpeg|png|webp)(?:\?[^\s)"'\]]*)?/gi;
      for (const match of allText.match(imgRegex) || []) {
        if (!isBlockedImageUrl(match) && !match.includes('wp-content')) urls.add(match);
      }
    }

    return [...urls].slice(0, 20);
  } catch (e) {
    console.error('fetchSourceImageUrls error:', e);
    return [];
  }
}

async function checkStoredImageIsPlaceholder(supabase: any, imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { headers: { 'Accept': 'image/*' } });
    if (!response.ok) return true;
    const buffer = await response.arrayBuffer();
    return looksLikePlaceholder(new Uint8Array(buffer));
  } catch {
    return true;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase configuration');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { vehicle_id, image_urls } = await req.json();
    if (!vehicle_id) throw new Error('vehicle_id is required');

    let urlsToProcess: { url: string; position: number; dbId?: string }[] = [];

    if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
      // Fresh URLs provided directly
      urlsToProcess = image_urls
        .filter((url: string) => !isBlockedImageUrl(url))
        .map((url: string, idx: number) => ({ url, position: idx }));
    } else {
      // No URLs provided — check existing images and source
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

      // Case 1: External URLs not yet downloaded
      const externalImages = (images || []).filter(
        (img) => !img.image_url.includes('supabase.co/storage') && !isBlockedImageUrl(img.image_url)
      );

      if (externalImages.length > 0) {
        urlsToProcess = externalImages.map(img => ({
          url: img.image_url, position: img.position || 0, dbId: img.id
        }));
      } else {
        // Case 2: All images are stored locally — check if first image is a placeholder
        const storedImages = (images || []).filter(img => img.image_url.includes('supabase.co/storage'));
        let needsRescrape = false;

        if (storedImages.length > 0) {
          needsRescrape = await checkStoredImageIsPlaceholder(supabase, storedImages[0].image_url);
          if (needsRescrape) {
            console.log(`Placeholder detected in stored images for ${vehicle_id}, will re-scrape from source`);
          }
        }

        if ((storedImages.length === 0 || needsRescrape) && vehicle?.source_url) {
          console.log(`Re-scraping source: ${vehicle.source_url}`);
          const sourceImageUrls = await fetchSourceImageUrls(vehicle.source_url);
          console.log(`Found ${sourceImageUrls.length} images from source`);

          if (sourceImageUrls.length > 0) {
            // Delete old placeholder image records if re-scraping
            if (needsRescrape && storedImages.length > 0) {
              const oldIds = storedImages.map(img => img.id);
              await supabase.from('vehicle_images').delete().in('id', oldIds);
              console.log(`Deleted ${oldIds.length} placeholder image records`);
            }
            urlsToProcess = sourceImageUrls.map((url, idx) => ({ url, position: idx }));
          }
        }
      }

      if (urlsToProcess.length === 0) {
        return new Response(
          JSON.stringify({ success: true, downloaded: 0, failed: 0, storedUrls: [], message: 'No images to process' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    let downloaded = 0;
    let failed = 0;
    const storedUrls: string[] = [];

    for (const item of urlsToProcess) {
      try {
        const imageResponse = await fetch(item.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
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

        if (imageBuffer.byteLength < 1000) {
          console.warn(`Image too small (${imageBuffer.byteLength} bytes), skipping`);
          failed++;
          continue;
        }

        if (looksLikePlaceholder(imageBytes)) {
          console.warn(`Placeholder detected (${imageBytes.byteLength} bytes) for ${item.url}`);
          failed++;
          continue;
        }

        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
        const filename = `${vehicle_id}/${Date.now()}_${item.position}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from('vehicle-images')
          .upload(filename, imageBytes, { contentType, upsert: true });

        if (uploadError) {
          console.warn(`Upload failed for ${filename}:`, uploadError.message);
          failed++;
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('vehicle-images')
          .getPublicUrl(filename);
        const publicUrl = urlData.publicUrl;
        storedUrls.push(publicUrl);

        if (item.dbId) {
          await supabase.from('vehicle_images').update({ image_url: publicUrl }).eq('id', item.dbId);
        } else {
          await supabase.from('vehicle_images').insert({
            vehicle_id, image_url: publicUrl, position: item.position,
          });
        }

        downloaded++;
      } catch (error) {
        console.warn(`Error processing image ${item.position}:`, error);
        failed++;
      }
    }

    console.log(`Done: ${downloaded} downloaded, ${failed} failed for ${vehicle_id}`);
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
