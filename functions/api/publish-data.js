const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
const onRequest = async (context) => {
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (context.request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  try {
    if (!context.env.R2_BUCKET) {
      return new Response(
        JSON.stringify({ error: "R2_BUCKET binding not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const body = await context.request.json();
    const { data } = body;
    if (!data) {
      return new Response(JSON.stringify({ error: "No data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    let existingData = {};
    try {
      const existingObject = await context.env.R2_BUCKET.get("site-data.json");
      if (existingObject) {
        const existingContent = await existingObject.text();
        existingData = JSON.parse(existingContent);
        console.log("[PUBLISH] Successfully merged with existing R2 data");
      }
    } catch (readError) {
      console.log("[PUBLISH] No existing data in R2 or read error (this is OK on first publish):", readError);
    }
    const mergedData = {
      ...existingData,
      ...data,
      // New data takes precedence for sections being updated
      published_at: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0.0",
      last_updated_sections: Object.keys(data).filter((k) => k !== "published_at" && k !== "version")
    };
    if (!mergedData.navigation_settings || Object.keys(mergedData.navigation_settings).length === 0) {
      mergedData.navigation_settings = {
        background: "#ffffff",
        text: "#111827",
        activeTab: "#14b8a6",
        inactiveButton: "#f3f4f6",
        borderRadius: "full",
        buttonSize: "md",
        themeMode: "default",
        buttonLabels: { home: "Home", shop: "Shop All", search: "Search", cart: "Cart", myOrders: "My Orders", login: "Login", signOut: "Sign Out", admin: "Admin" }
      };
    }
    const jsonContent = JSON.stringify(mergedData);
    await context.env.R2_BUCKET.put("site-data.json", jsonContent, {
      httpMetadata: { contentType: "application/json", cacheControl: "max-age=300" }
    });
    console.log("[PUBLISH] Successfully published merged data to R2");
    return new Response(
      JSON.stringify({
        success: true,
        published_at: mergedData.published_at,
        size: jsonContent.length,
        productCount: Object.keys(mergedData.products || {}).length,
        categoryCount: Object.keys(mergedData.categories || {}).length,
        updatedSections: mergedData.last_updated_sections,
        mergedWithExisting: Object.keys(existingData).length > 0
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Publish failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};
export {
  onRequest
};
