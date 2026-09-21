import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { BlobServiceClient } from "@azure/storage-blob";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const containerName = process.env.AZURE_STORAGE_CONTAINER ?? "uploads";

/**
 * Saves an uploaded file buffer and returns its public URL. Uses Azure Blob
 * Storage when AZURE_STORAGE_CONNECTION_STRING is set (production); falls
 * back to the local public/uploads folder for local development.
 */
export async function saveUpload(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (connectionString) {
    const blobService = BlobServiceClient.fromConnectionString(connectionString);
    const container = blobService.getContainerClient(containerName);
    const blockBlob = container.getBlockBlobClient(filename);
    await blockBlob.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });
    return blockBlob.url;
  }

  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}
