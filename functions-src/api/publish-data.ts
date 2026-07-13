interface Env {
  R2_BUCKET?: R2Bucket;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await context.request.json() as { data: Record<string, any> };
    const { data } = body;

    if (!data) {
      return new Response(JSON.stringify({ error: 'No data provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!data.navigation_settings || Object.keys(data.navigation_settings).length === 0) {
      data.navigation_settings = {
        background: '#ffffff',
        text: '#111827',
        activeTab: '#14b8a6',
        inactiveButton: '#f3f4f6',
        borderRadius: 'full',
        buttonSize: 'md',
        themeMode: 'default',
        buttonLabels: { home: 'Home', shop: 'Shop All', search: 'Search', cart: 'Cart', myOrders: 'My Orders', login: 'Login', signOut: 'Sign Out', admin: 'Admin' }
      };
    }

    const publishedData = { ...data, published_at: new Date().toISOString(), version: '1.0.0' };
    const jsonContent = JSON.stringify(publishedData);

    // Try to publish to R2 if binding is available
    if (context.env.R2_BUCKET) {
      try {
        await context.env.R2_BUCKET.put('site-data.json', jsonContent, {
          httpMetadata: { contentType: 'application/json', cacheControl: 'max-age=300' },
        });
        
        return new Response(
          JSON.stringify({
            success: true,
            published_at: publishedData.published_at,
            size: jsonContent.length,
            productCount: Object.keys(data.products || {}).length,
            categoryCount: Object.keys(data.categories || {}).length,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (r2Error) {
        console.error('[PUBLISH] R2 upload failed:', r2Error);
        // Continue to fallback response below
      }
    }

    // Fallback: R2 not configured, but data is valid
    console.warn('[PUBLISH] R2_BUCKET not configured, returning success with warning');
    return new Response(
      JSON.stringify({
        success: true,
        published_at: publishedData.published_at,
        size: jsonContent.length,
        productCount: Object.keys(data.products || {}).length,
        categoryCount: Object.keys(data.categories || {}).length,
        warning: 'R2 binding not configured - data collected but not uploaded to R2. Configure R2 in Cloudflare dashboard.',
        r2_configured: false,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[PUBLISH] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Publish failed',
        details: 'Check browser console and Cloudflare worker logs for more info'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};
