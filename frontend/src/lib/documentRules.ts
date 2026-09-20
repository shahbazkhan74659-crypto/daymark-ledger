export const ALLOWED_DOCUMENT_EXTENSIONS = [".jpg", ".jpeg"];
export const ALLOWED_DOCUMENT_MIME_TYPES = ["image/jpeg"];
export const MAX_DOCUMENT_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
export const MAX_DOCUMENTS_PER_WORKER = 2;

export function validateDocumentBatch(files: File[], existingCount: number): string | null {
  if (existingCount + files.length > MAX_DOCUMENTS_PER_WORKER) {
    return `Maximum of ${MAX_DOCUMENTS_PER_WORKER} documents allowed per employee`;
  }

  for (const file of files) {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const validExtension = ALLOWED_DOCUMENT_EXTENSIONS.includes(ext);
    const validMimeType = ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type);
    if (!validExtension || !validMimeType) {
      return "File type must be jpg or jpeg";
    }
  }

  for (const file of files) {
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      return "File exceeds the 2MB size limit";
    }
  }

  return null;
}
