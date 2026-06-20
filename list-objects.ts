import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || "musica-sacra";

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error("Missing R2 credentials in .env");
  process.exit(1);
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function list() {
  try {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
      })
    );
    console.log("FILES_LIST_START");
    console.log(JSON.stringify(response.Contents, null, 2));
    console.log("FILES_LIST_END");
  } catch (error) {
    console.error("Error listing files:", error);
  }
}

list();
