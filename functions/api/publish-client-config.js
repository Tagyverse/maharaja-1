async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { clientId, data } = req.body;
    if (!clientId || !data) {
      res.status(400).json({ error: "Missing required fields: clientId, data" });
      return;
    }
    const url = await publishToStorage(clientId, data);
    res.status(200).json({
      success: true,
      url,
      message: "Configuration published successfully",
      publishedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Publishing error:", error);
    res.status(500).json({
      error: "Failed to publish configuration",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
async function publishToStorage(clientId, data) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return publishToVercelBlob(clientId, data);
  }
  if (process.env.CLOUDFLARE_R2_ACCOUNT_ID && process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) {
    return publishToCloudflareR2(clientId, data);
  }
  return publishToLocalStorage(clientId, data);
}
async function publishToVercelBlob(clientId, data) {
  try {
    const filename = `clients/${clientId}/config-${Date.now()}.json`;
    const response = await fetch("https://blob.vercel-storage.com/put", {
      method: "PUT",
      headers: {
        authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`Vercel Blob upload failed: ${response.statusText}`);
    }
    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error("Vercel Blob error:", error);
    throw error;
  }
}
async function publishToCloudflareR2(clientId, data) {
  try {
    const bucketName = process.env.R2_BUCKET_NAME || "client-configs";
    const key = `clients/${clientId}/config-${Date.now()}.json`;
    const endpoint = `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const url = new URL(`${endpoint}/${bucketName}/${key}`);
    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getS3AuthHeader(
          "PUT",
          bucketName,
          key,
          JSON.stringify(data)
        )
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`R2 upload failed: ${response.statusText}`);
    }
    const publicUrl = `https://${process.env.R2_PUBLIC_DOMAIN || `${bucketName}.${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error("Cloudflare R2 error:", error);
    throw error;
  }
}
async function publishToLocalStorage(clientId, data) {
  const timestamp = Date.now();
  const mockUrl = `https://storage.example.com/clients/${clientId}/config-${timestamp}.json`;
  console.warn("Using mock storage URL:", mockUrl);
  return mockUrl;
}
function getS3AuthHeader(method, bucket, key, body) {
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "";
  return `AWS4-HMAC-SHA256 Credential=${accessKeyId}, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=placeholder`;
}
export {
  handler as default
};
