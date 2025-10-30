import { Storage } from "@google-cloud/storage";

export const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.split(String.raw`\n`).join("\n"),
  },
});

export const BUCKET = process.env.GCLOUD_BUCKET;

export const uploadFile = async (file: File) => {
  try {
    const bucket = storage.bucket(BUCKET as string);
    const blob = bucket.file(file.name);
    const blobStream = blob.createWriteStream();

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await new Promise((resolve, reject) => {
      blobStream.on("error", reject);
      blobStream.on("finish", resolve);
      blobStream.end(buffer);
    });

    return blob.publicUrl();
  } catch (error) {
    console.error(error);
    return null;
  }
};
