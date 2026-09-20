import { useRef, useState } from "react";
import { ApiError, postForm, postJson } from "../lib/api";
import { validateDocumentBatch } from "../lib/documentRules";
import { formatFileSize } from "../lib/format";
import type { WorkerDocument } from "../types/worker";

export function ManageDocumentsCard({
  workerId,
  documents,
  onChange,
}: {
  workerId: string;
  documents: WorkerDocument[];
  onChange: React.Dispatch<React.SetStateAction<WorkerDocument[]>>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const validationError = validateDocumentBatch(files, documents.length);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const { document } = await postForm<{ document: WorkerDocument }>(
          `/api/workers/${workerId}/documents`,
          formData,
        );
        onChange((current) => [document, ...current]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove(documentId: string) {
    try {
      await postJson(`/api/workers/${workerId}/documents/${documentId}/remove`);
      onChange(documents.filter((d) => d.id !== documentId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to remove document.");
    }
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(28,25,23,0.06)]">
      <p className="mb-3 text-[12px] font-extrabold tracking-[0.04em] text-stone-400 uppercase">Documents</p>

      <div className="mb-2.5 flex flex-col gap-2">
        {documents.length === 0 ? (
          <p className="text-[12px] text-ink-faint italic">No documents uploaded</p>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-2 rounded-[10px] bg-page px-2.5 py-2">
              <a
                href={`/api/workers/${workerId}/documents/${doc.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-ink-faint)"
                  strokeWidth="2"
                  className="h-3.5 w-3.5 shrink-0"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="truncate text-[12px] font-semibold text-ink">{doc.originalName}</span>
                <span className="shrink-0 text-[11px] text-ink-faint">{formatFileSize(doc.sizeBytes)}</span>
              </a>
              <button
                type="button"
                aria-label="Remove document"
                onClick={() => handleRemove(doc.id)}
                className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-border"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-ink-muted)"
                  strokeWidth="2.4"
                  className="h-2.5 w-2.5"
                >
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {error && <p className="mb-2 text-xs font-semibold text-red-600">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-border py-2.5 text-[12px] font-bold text-brand disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.4" className="h-3.5 w-3.5">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        {uploading ? "Uploading…" : "Add document"}
      </button>
    </div>
  );
}
