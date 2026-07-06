import { S3Client, ListBucketsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

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

async function run() {
  try {
    const bucketsResponse = await s3Client.send(new ListBucketsCommand({}));
    console.log("Buckets found:", bucketsResponse.Buckets?.map(b => b.Name));

    if (bucketsResponse.Buckets) {
      for (const bucket of bucketsResponse.Buckets) {
        console.log(`\nListing files in bucket: ${bucket.Name}`);
        const response = await s3Client.send(
          new ListObjectsV2Command({
            Bucket: bucket.Name,
            Prefix: "liturgia-diaria/julho26/",
          })
        );
        console.log(`Files starting with 'liturgia-diaria/julho26/' in ${bucket.Name}:`);
        console.log(JSON.stringify(response.Contents, null, 2));

        // Let's also check without prefix just in case the prefix is slightly different, e.g. "liturgia-diaria"
        const responseAll = await s3Client.send(
          new ListObjectsV2Command({
            Bucket: bucket.Name,
            MaxKeys: 100,
          })
        );
        console.log(`First 100 files in ${bucket.Name}:`, responseAll.Contents?.map(c => c.Key));
      }
    }
  } catch (error) {
    console.error("Error listing:", error);
  }
}

run();
