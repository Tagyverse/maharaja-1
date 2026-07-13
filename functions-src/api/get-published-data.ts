import type { RequestContext } from '@cloudflare/workers-types';

interface Env {
  R2_BUCKET: R2Bucket;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=60',
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context as RequestContext<Env>;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!env.R2_BUCKET) {
      console.error('[GET-DATA] R2_BUCKET binding not configured');
      return new Response(
        JSON.stringify({ error: 'R2_BUCKET binding not configured. Please add R2 bucket binding in Cloudflare Dashboard.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const fileName = 'site-data.json';
    console.log('[GET-DATA] Fetching file:', fileName);
    
    const fetchStart = Date.now();
    const object = await env.R2_BUCKET.get(fileName);
    const fetchTime = Date.now() - fetchStart;

    if (!object) {
      console.log('[GET-DATA] File not found in R2, returning default structure:', fileName);
      // Return default branding structure when no published data exists
      const defaultData = {
        branding: {
          name: "Sri Maharaja",
          tagline: "Premium Quality Crackers",
          colors: {
            primary: "#11791d",
            primaryLight: "#c4fdc5",
            primaryDark: "#207e67",
            accent: "#6fecb6",
            themeColor: "#11791d"
          },
          updated_at: new Date().toISOString()
        },
        navigation_settings: {
          background: "#F0F5F0",
          text: "#3D4A3D",
          activeTab: "#2D4A3A",
          inactiveButton: "#F0F5F0",
          borderRadius: "full",
          buttonSize: "md",
          themeMode: "default",
          buttonLabels: {
            home: "Home",
            shop: "Shop All",
            search: "Search",
            cart: "Cart",
            myOrders: "Orders",
            login: "Login",
            signOut: "Sign Out",
            admin: "Admin"
          }
        },
        card_design: {
          style: "classic",
          imagePosition: "top",
          textAlignment: "left",
          shadowEffect: "md",
          borderRadius: "lg"
        },
        published_at: new Date().toISOString(),
        version: "1.0.0",
        isDefault: true
      };
      
      return new Response(JSON.stringify(defaultData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parseStart = Date.now();
    const data = await object.text();
    const parseTime = Date.now() - parseStart;
    
    console.log(`[GET-DATA] Successfully fetched data: size=${data.length} bytes, fetchTime=${fetchTime}ms, parseTime=${parseTime}ms`);

    // Verify JSON is valid
    try {
      JSON.parse(data);
      console.log('[GET-DATA] JSON validation passed');
    } catch (parseError) {
      console.error('[GET-DATA] Invalid JSON in R2:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid data format in R2 storage' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(data, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[GET-DATA ERROR]', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to get published data',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};
