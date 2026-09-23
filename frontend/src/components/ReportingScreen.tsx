import { Link, useNavigate } from "react-router-dom";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2.5" className="h-4 w-4">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-status-neutral-fg)" strokeWidth="2.5" className="h-3.5 w-3.5 shrink-0">
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" className="h-5 w-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function ExcelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" className="h-5 w-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

const FORMAT_OPTIONS = [
  {
    format: "pdf",
    label: "PDF",
    description: "Formatted document, ready to print",
    iconBg: "bg-red-100",
    icon: <PdfIcon />,
  },
  {
    format: "excel",
    label: "Excel",
    description: "Spreadsheet with raw data columns",
    iconBg: "bg-green-100",
    icon: <ExcelIcon />,
  },
] as const;

export function ReportingScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex h-dvh w-full justify-center bg-stone-200 font-sans sm:items-center sm:py-8">
      <div className="flex h-dvh w-full max-w-md flex-col overflow-hidden bg-page sm:h-[min(844px,calc(100dvh-4rem))] sm:rounded-2xl sm:shadow-lg">
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-white px-4 py-4">
          <Link
            to="/"
            aria-label="Back to home"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-page"
          >
            <BackIcon />
          </Link>
          <span className="text-base font-extrabold text-ink">Reporting</span>
        </header>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          <p className="text-[11px] font-bold tracking-[0.06em] text-stone-400 uppercase">Choose a format</p>
          {FORMAT_OPTIONS.map((option) => (
            <button
              key={option.format}
              type="button"
              onClick={() => navigate(`/reports/${option.format}`)}
              className="flex w-full items-center gap-3.5 rounded-2xl border-[1.5px] border-border bg-white p-4 text-left shadow-[0_2px_8px_rgba(28,25,23,0.12),0_0_24px_rgba(15,118,110,0.18)]"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${option.iconBg}`}>
                {option.icon}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-[14px] font-extrabold text-ink">{option.label}</span>
                <span className="text-[11px] text-ink-faint">{option.description}</span>
              </div>
              <ChevronIcon />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
