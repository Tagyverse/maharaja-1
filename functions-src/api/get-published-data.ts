import type { RequestContext } from '@cloudflare/workers-types';

interface Env {
  R2_BUCKET?: R2Bucket;
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
    // Return default data structure (always succeeds)
    const getDefaultData = () => ({
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
    });

    // Try to fetch from R2 if available
    if (env.R2_BUCKET) {
      const fileName = 'site-data.json';
      console.log('[GET-DATA] Fetching from R2:', fileName);
      
      const fetchStart = Date.now();
      const object = await env.R2_BUCKET.get(fileName);
      const fetchTime = Date.now() - fetchStart;

      if (!object) {
        console.log('[GET-DATA] File not found in R2, returning default structure:', fileName);
        return new Response(JSON.stringify(getDefaultData()), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const parseStart = Date.now();
      const data = await object.text();
      const parseTime = Date.now() - parseStart;
      
      console.log(`[GET-DATA] Successfully fetched from R2: size=${data.length} bytes, fetchTime=${fetchTime}ms, parseTime=${parseTime}ms`);

      // Verify JSON is valid
      try {
        const parsed = JSON.parse(data);
        return new Response(JSON.stringify(parsed), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('[GET-DATA] Invalid JSON in R2:', parseError);
        // Return default if JSON is corrupted
        return new Response(JSON.stringify(getDefaultData()), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // R2 not configured, return defaults
    console.warn('[GET-DATA] R2_BUCKET not configured, returning default data');
    return new Response(JSON.stringify(getDefaultData()), {
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
