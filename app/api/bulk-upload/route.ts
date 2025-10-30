// app/api/bulk-upload/route.ts
import { NextRequest } from "next/server";
import { pubSubClient } from "@/lib/pubsub-client";
import { randomUUID } from "crypto";
import { redisClient } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return new Response(JSON.stringify({ error: "No files uploaded" }), {
        status: 400,
      });
    }

    // Create a unique job for each file (similar to screen-all route)
    const jobs = files.map((file) => ({
      jobId: randomUUID(),
      fileName: file.name,
    }));

    // Seed Redis so clients can track status immediately
    await Promise.allSettled(
      jobs.map(async ({ jobId, fileName }) => {
        await redisClient.hset(`job:${jobId}`, {
          status: "queued",
          fileName,
          createdAt: Date.now().toString(),
        });
        await redisClient.expire(`job:${jobId}`, 3600 * 24);
      }),
    );

    // Fire-and-forget async processing per-file
    (async () => {
      const topicName = `projects/${process.env.GCLOUD_PROJECT_ID}/topics/file-upload`;
      console.log(`[bulk-upload] Starting publish for batch`, {
        total: files.length,
      });

      const publishPromises = files.map(async (file, index) => {
        const { jobId } = jobs[index];
        console.log(`[bulk-upload] Queueing publish`, {
          jobId,
          index,
          name: file.name,
          size: file.size,
        });
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const data = {
          jobType: "file-upload",
          fileName: file.name,
          fileBuffer: buffer.toString("base64"),
          jobId,
        };

        return pubSubClient
          .topic(topicName)
          .publishMessage({
            data: Buffer.from(JSON.stringify(data)),
            attributes: { jobType: "file-upload" },
          })
          .then((messageId) => {
            console.log(`[bulk-upload] Published message`, {
              jobId,
              index,
              name: file.name,
              messageId,
            });
            return messageId;
          })
          .catch((err) => {
            console.error(`[bulk-upload] Failed to publish`, {
              jobId,
              index,
              name: file.name,
              err,
            });
            throw err;
          });
      });

      await Promise.all(publishPromises);
      console.log(`[bulk-upload] All messages published successfully`, {
        count: publishPromises.length,
      });
    })();

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Bulk upload queued",
        jobs: jobs.map((j) => ({ jobId: j.jobId, fileName: j.fileName })),
      }),
      { status: 202 },
    );
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
    });
  }
}
