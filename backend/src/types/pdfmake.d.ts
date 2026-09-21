// The published @types/pdfmake package targets pdfmake's older browser-bundle API
// (vfs_fonts, PdfPrinter class). This project uses pdfmake 0.3.x's server API, which
// is a single default-exported singleton (`createPdf`/`setFonts`/`addTableLayouts`).
// This is a minimal ambient declaration covering only what this codebase actually calls.
declare module "pdfmake" {
  export interface TableCell {
    text?: string | number;
    style?: string;
    bold?: boolean;
    fontSize?: number;
    alignment?: "left" | "center" | "right";
    colSpan?: number;
    fillColor?: string;
    noWrap?: boolean;
  }

  export type ContentCell = string | number | TableCell;

  export interface TableLayout {
    hLineWidth?: (i: number, node: { table: { body: unknown[]; widths: unknown[] } }) => number;
    vLineWidth?: (i: number, node: { table: { body: unknown[]; widths: unknown[] } }) => number;
    hLineColor?: (i: number, node: unknown) => string;
    vLineColor?: (i: number, node: unknown) => string;
    paddingLeft?: (i: number, node: unknown) => number;
    paddingRight?: (i: number, node: unknown) => number;
    paddingTop?: (i: number, node: unknown) => number;
    paddingBottom?: (i: number, node: unknown) => number;
    fillColor?: (rowIndex: number, node: unknown, columnIndex: number) => string | null;
  }

  export interface TDocumentDefinitions {
    pageSize?: string;
    pageOrientation?: "portrait" | "landscape";
    pageMargins?: [number, number, number, number] | number;
    defaultStyle?: { font?: string; fontSize?: number };
    styles?: Record<string, Record<string, unknown>>;
    content: unknown[];
  }

  export interface PdfOutputDocument {
    getBuffer(): Promise<Buffer>;
  }

  export interface PdfMakeOptions {
    tableLayouts?: Record<string, TableLayout>;
  }

  export interface PdfMakeModule {
    setFonts(fonts: Record<string, Record<string, string>>): void;
    addTableLayouts(layouts: Record<string, TableLayout>): void;
    setUrlAccessPolicy(callback: ((url: string) => boolean) | undefined): void;
    setLocalAccessPolicy(callback: ((path: string) => boolean) | undefined): void;
    createPdf(docDefinition: TDocumentDefinitions, options?: PdfMakeOptions): PdfOutputDocument;
  }

  const pdfMake: PdfMakeModule;
  export default pdfMake;
}

declare module "pdfmake/standard-fonts/Helvetica.js" {
  const fonts: Record<string, Record<string, string>>;
  export default fonts;
}
