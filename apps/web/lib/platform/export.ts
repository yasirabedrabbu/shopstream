"use client";
import { csvString } from "./data";
import { platformDesignSpec } from "./design";
export function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadCSV(filename: string, rows: (string | number)[][]) { downloadFile(filename, `\uFEFF${csvString(rows)}`, "text/csv;charset=utf-8"); }
export function downloadDesignSpec() { downloadFile("shopstream-platform-design.json", JSON.stringify(platformDesignSpec, null, 2), "application/json"); }
