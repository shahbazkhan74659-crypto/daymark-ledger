import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-muted)" strokeWidth="2.5" className="h-3 w-3">
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PdfViewer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPdf(null);
    setPageNum(1);
    setError(null);

    import("pdfjs-dist").then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
      return pdfjsLib
        .getDocument({ url })
        .promise.then((doc) => {
          if (cancelled) return;
          setPdf(doc);
        });
    }).catch(() => {
      if (!cancelled) setError("Failed to load this PDF.");
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    if (!pdf || !canvasRef.current || !containerRef.current) return;

    let cancelled = false;
    let renderTask: RenderTask | null = null;

    pdf.getPage(pageNum).then((page) => {
      if (cancelled || !canvasRef.current || !containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / baseViewport.width;
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      renderTask = page.render({ canvasContext: context, viewport, canvas });
      renderTask.promise.catch(() => {});
    });

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pdf, pageNum]);

  if (error) {
    return <p className="p-4 text-[13px] text-ink-faint">{error}</p>;
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-3 p-4">
      <canvas ref={canvasRef} className="max-w-full rounded-lg shadow-[0_1px_2px_rgba(28,25,23,0.1)]" />
      {pdf && pdf.numPages > 1 && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous page"
            disabled={pageNum <= 1}
            onClick={() => setPageNum((p) => p - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white disabled:opacity-40"
          >
            <ChevronIcon direction="left" />
          </button>
          <span className="text-[13px] font-extrabold text-ink">
            Page {pageNum} of {pdf.numPages}
          </span>
          <button
            type="button"
            aria-label="Next page"
            disabled={pageNum >= pdf.numPages}
            onClick={() => setPageNum((p) => p + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white disabled:opacity-40"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      )}
    </div>
  );
}
