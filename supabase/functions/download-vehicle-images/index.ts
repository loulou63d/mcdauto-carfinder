import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

if (Deno.env.get('ENVIRONMENT') === 'development') {
  console.log('Starting download-vehicle-images function');
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all vehicle images with proxy URLs
    const { data: images, error: queryError } = await supabase
      .from('vehicle_images')
      .select('id, vehicle_id, image_url, position')
      .like('image_url', '%autosphere.fr/_next/image%');

    if (queryError) throw queryError;

    if (!images || images.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No proxy images found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    // Process each image
    for (const image of images) {
      try {
        // Extract the real URL from the proxy URL
        const urlParams = new URL(image.image_url).searchParams;
        const encodedUrl = urlParams.get('url');
        
        if (!encodedUrl) {
          errors.push(`Image ${image.id}: Could not extract URL from proxy`);
          failureCount++;
          continue;
        }

        const realUrl = decodeURIComponent(encodedUrl);

        // Download the image
        const imageResponse = await fetch(realUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (!imageResponse.ok) {
          errors.push(`Image ${image.id}: Failed to download from ${realUrl} (${imageResponse.status})`);
          failureCount++;
          continue;
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

        // Generate a filename
        const extension = contentType.includes('png') ? 'png' : 'jpg';
        const filename = `${image.vehicle_id}/image-${image.position || 1}.${extension}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('vehicle-images')
          .upload(filename, new Uint8Array(imageBuffer), {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          errors.push(`Image ${image.id}: Upload failed - ${uploadError.message}`);
          failureCount++;
          continue;
        }

        // Get the public URL
        const { data } = supabase.storage
          .from('vehicle-images')
          .getPublicUrl(filename);

        // Update the image_url in the database
        const { error: updateError } = await supabase
          .from('vehicle_images')
          .update({ image_url: data.publicUrl })
          .eq('id', image.id);

        if (updateError) {
          errors.push(`Image ${image.id}: Database update failed - ${updateError.message}`);
          failureCount++;
          continue;
        }

        successCount++;
      } catch (error) {
        errors.push(`Image ${image.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        failureCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Image download process completed',
        total: images.length,
        success: successCount,
        failures: failureCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
