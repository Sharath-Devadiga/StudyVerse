import { createHash } from "crypto";

function config() {
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = process.env;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("CLOUDINARY_NOT_CONFIGURED");
  return { cloudName, apiKey, apiSecret };
}

export async function uploadDataUri(data: string, folder: string) {
  const { cloudName, apiKey, apiSecret } = config(); const timestamp = Math.floor(Date.now() / 1000); const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest("hex");
  const form = new URLSearchParams({ file: data, folder, timestamp: String(timestamp), api_key: apiKey, signature });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form });
  if (!response.ok) { const detail = await response.text(); console.error("Cloudinary upload failed", { status: response.status, body: detail.slice(0, 1_000) }); throw new Error("CLOUDINARY_UPLOAD_FAILED"); }
  const payload = await response.json() as { secure_url: string; public_id: string; bytes?: number }; return { url: payload.secure_url, publicId: payload.public_id, bytes: payload.bytes ?? null };
}
