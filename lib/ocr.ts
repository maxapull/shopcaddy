import { createWorker } from "tesseract.js";

// Runs entirely in the browser (WASM) — no server, no API key, no per-scan
// cost. This is OCR (reading printed text off a photo), not true visual
// item recognition: it can't identify an item that has no legible text in
// frame, and it may misread messy or angled receipts. The first scan in a
// session downloads Tesseract's language data (a few MB, cached after that).
export async function scanImageText(file: File): Promise<string> {
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(file);
    return text;
  } finally {
    await worker.terminate();
  }
}

export interface ReceiptGuess {
  name: string;
  price: number | null;
}

const PRICE_PATTERN = /[£$]?\s?(\d{1,4}[.,]\d{2})\b/;
const PURE_NUMBER_LINE = /^\W*[£$]?\s?\d[\d.,\s]*\W*$/;

function titleCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .slice(0, 80);
}

// Best-effort: find the first price-shaped number, and guess a name from
// the longest line that looks like words rather than a barcode/price/SKU.
// Either can come back empty — the user reviews and fills in the rest.
export function parseReceiptText(rawText: string): ReceiptGuess {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let price: number | null = null;
  for (const line of lines) {
    const match = line.match(PRICE_PATTERN);
    if (match) {
      const n = Number(match[1].replace(",", "."));
      if (Number.isFinite(n) && n > 0) {
        price = n;
        break;
      }
    }
  }

  const nameCandidate = lines
    .filter((l) => !PURE_NUMBER_LINE.test(l))
    .filter((l) => /[a-zA-Z]{3,}/.test(l))
    .sort((a, b) => b.length - a.length)[0];

  return { name: nameCandidate ? titleCase(nameCandidate) : "", price };
}
