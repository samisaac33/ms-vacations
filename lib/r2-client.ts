import { S3Client } from "@aws-sdk/client-s3";
import { getR2AccountId, getR2BucketName } from "@/lib/r2-config";

let client: S3Client | null = null;

export function getR2Client(): S3Client {
  const accountId = getR2AccountId();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 no configurado. Defina R2_ACCOUNT_ID, R2_ACCESS_KEY_ID y R2_SECRET_ACCESS_KEY.",
    );
  }

  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  return client;
}

export { getR2BucketName };
