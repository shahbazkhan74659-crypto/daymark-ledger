import { apiUrl } from "../lib/api";
import type { WorkerDocument } from "../types/worker";
import { PdfViewer } from "./PdfViewer";

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-muted)" strokeWidth="2.2" className="h-4 w-4">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

export function DocumentPreviewModal({
  workerId,
  document,
  onClose,
}: {
  workerId: string;
  document: WorkerDocument;
  onClose: () => void;
}) {
  const fileUrl = apiUrl(`/api/workers/${workerId}/documents/${document.id}/download`);
  const isImage = document.mimeType.startsWith("image/");

  return (
    <>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 z-10 cursor-default bg-black/40"
      />
      <div className="absolute inset-x-0 top-10 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-[20px] bg-white">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3.5">
          <span className="truncate text-[14px] font-bold text-ink">{document.originalName}</span>
          <button
            type="button"
            aria-label="Close preview"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-page"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-stone-100">
          {isImage ? (
            <img src={fileUrl} alt={document.originalName} className="mx-auto max-w-full" />
          ) : (
            <PdfViewer url={fileUrl} />
          )}
        </div>
      </div>
    </>
  );
}
