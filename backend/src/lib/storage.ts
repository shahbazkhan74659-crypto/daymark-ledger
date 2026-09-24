import { randomUUID } from "node:crypto";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const FOLDER_PREFIX = "daymark-ledger";
const RESOURCE_TYPE = "image" as const;
const DELIVERY_TYPE = "authenticated" as const;

export function generateStoredFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  return `${randomUUID()}${ext}`;
}

function publicId(workerId: string, storedName: string): string {
  // Keeping the extension inside the public_id (rather than passing a
  // separate `format`) means the generated delivery URL ends in the same
  // `.../<workerId>/<storedName>` shape uploads are keyed by, with no extra
  // format-matching step needed to fetch it back.
  return `${FOLDER_PREFIX}/${workerId}/${storedName}`;
}

export async function uploadDocumentObject(
  workerId: string,
  storedName: string,
  body: Buffer,
  mimeType: string,
): Promise<void> {
  const dataUri = `data:${mimeType};base64,${body.toString("base64")}`;
  await cloudinary.uploader.upload(dataUri, {
    public_id: publicId(workerId, storedName),
    resource_type: RESOURCE_TYPE,
    type: DELIVERY_TYPE,
    overwrite: true,
  });
}

// Authenticated assets aren't fetchable via a plain CDN URL, and signing one
// directly requires knowing the asset's exact version. private_download_url
// instead hits Cloudinary's API, which resolves the current version itself
// and redirects to the asset — so the (already session-gated) download route
// can redirect the browser straight to it.
export function getDocumentSignedUrl(workerId: string, storedName: string): string {
  return cloudinary.utils.private_download_url(publicId(workerId, storedName), "", {
    resource_type: RESOURCE_TYPE,
    type: DELIVERY_TYPE,
  });
}

export async function deleteDocumentObject(workerId: string, storedName: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId(workerId, storedName), {
    resource_type: RESOURCE_TYPE,
    type: DELIVERY_TYPE,
  });
}

export async function deleteAllWorkerDocumentObjects(workerId: string): Promise<void> {
  await cloudinary.api.delete_resources_by_prefix(`${FOLDER_PREFIX}/${workerId}/`, {
    resource_type: RESOURCE_TYPE,
    type: DELIVERY_TYPE,
  });
}
