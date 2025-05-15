/* Replace with S3, Cloudflare R2, or whatever you prefer */
export async function uploadFile(file: File, userId: string): Promise<string> {
  // NOTE: File is a web-standard File object in Next 13/14 routes.
  // Here we just pretend it uploads and return a fake URL.
  const safeName = encodeURIComponent(file.name);
  return `https://example.com/uploads/${userId}/${Date.now()}_${safeName}`;
}
