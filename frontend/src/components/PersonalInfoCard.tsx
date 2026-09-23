import { formatDayLabel } from "../lib/format";
import type { WorkerDetail, WorkerDocument } from "../types/worker";

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" className="h-3 w-3">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PersonalInfoCard({
  worker,
  documents,
  onDocumentClick,
}: {
  worker: WorkerDetail;
  documents: WorkerDocument[];
  onDocumentClick: (document: WorkerDocument) => void;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]">
      <p className="mb-1 text-[12px] font-extrabold tracking-[0.04em] text-stone-400 uppercase">
        Personal Information
      </p>
      <div className="flex items-center justify-between py-1.5">
        <span className="text-[13px] text-ink-muted">Name</span>
        <span className="text-[13px] font-bold text-ink">{worker.fullName}</span>
      </div>
      <div className="flex items-center justify-between py-1.5">
        <span className="text-[13px] text-ink-muted">Designation</span>
        <span className="text-[13px] font-bold text-ink">{worker.designation}</span>
      </div>
      <div className="flex items-center justify-between py-1.5">
        <span className="text-[13px] text-ink-muted">Contact</span>
        <span className="text-[13px] font-bold text-ink">{worker.contact}</span>
      </div>
      <div className="flex items-center justify-between py-1.5">
        <span className="text-[13px] text-ink-muted">Joining date</span>
        <span className="text-[13px] font-bold text-ink">{formatDayLabel(worker.joiningDate)}</span>
      </div>

      <div className="my-2 h-px bg-[#f0efed]" />

      <p className="mb-2 text-[11px] font-bold text-stone-400">Documents</p>
      <div className="flex flex-wrap gap-1.5">
        {documents.length === 0 ? (
          <p className="text-[12px] text-ink-faint italic">No documents uploaded</p>
        ) : (
          documents.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => onDocumentClick(doc)}
              className="flex items-center gap-1.5 rounded-full bg-brand-tint px-2.5 py-1.5 text-[11px] font-semibold text-brand"
            >
              <DocIcon />
              {doc.originalName}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
