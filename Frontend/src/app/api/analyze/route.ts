import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import exifr from "exifr";
import { PDFDocument } from "pdf-lib";
import { CohereClient } from "cohere-ai";

type Metadata = Record<string, string | number | boolean | null>;

type Indicator = {
  title: string;
  level: "normal" | "warning" | "danger";
  description: string;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const type = file.type;

    let kind: "image" | "pdf";
    let metadata: Metadata;

    if (type === "image/jpeg" || type === "image/png") {
      kind = "image";
      metadata = await extractImageMetadata(buffer);
    } else if (type === "application/pdf") {
      kind = "pdf";
      metadata = await extractPdfMetadata(buffer);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Only JPG, PNG and PDF are allowed." },
        { status: 400 }
      );
    }

    metadata.sha256 = createHash("sha256").update(buffer).digest("hex");

    const indicators = detectAnomalies(kind, metadata);
    const overallStatus = indicators.some((item) => item.level === "danger")
      ? "Suspicious signals"
      : indicators.some((item) => item.level === "warning")
        ? "Attention required"
        : "No obvious anomaly";

    const summary = await writeSummary({
      fileName: file.name,
      kind,
      metadata,
      indicators,
      overallStatus,
    });

    return NextResponse.json({
      fileName: file.name,
      fileType: type,
      fileSize: file.size,
      kind,
      metadata,
      indicators,
      overallStatus,
      summary,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to analyze file." }, { status: 500 });
  }
}

async function extractImageMetadata(buffer: Buffer): Promise<Metadata> {
  const data = (await exifr.parse(buffer, { reviveValues: false })) ?? {};

  return {
    dateTimeOriginal: toText(data.DateTimeOriginal),
    dateTimeDigitized: toText(data.DateTimeDigitized),
    modifyDate: toText(data.ModifyDate),
    software: toText(data.Software),
    make: toText(data.Make),
    model: toText(data.Model),
    artist: toText(data.Artist),
    imageWidth: toNumber(data.ImageWidth ?? data.ExifImageWidth),
    imageHeight: toNumber(data.ImageHeight ?? data.ExifImageHeight),
    exifImageWidth: toNumber(data.ExifImageWidth),
    exifImageHeight: toNumber(data.ExifImageHeight),
    hasGps: Boolean(data.latitude && data.longitude),
  };
}

async function extractPdfMetadata(buffer: Buffer): Promise<Metadata> {
  const pdf = await PDFDocument.load(buffer, { updateMetadata: false });

  return {
    title: pdf.getTitle() ?? null,
    subject: pdf.getSubject() ?? null,
    author: pdf.getAuthor() ?? null,
    creator: pdf.getCreator() ?? null,
    producer: pdf.getProducer() ?? null,
    creationDate: pdf.getCreationDate()?.toISOString() ?? null,
    modificationDate: pdf.getModificationDate()?.toISOString() ?? null,
    pageCount: pdf.getPageCount(),
  };
}

function detectAnomalies(kind: "image" | "pdf", metadata: Metadata): Indicator[] {
  const indicators: Indicator[] = [];
  const created = kind === "image" ? metadata.dateTimeOriginal : metadata.creationDate;
  const modified = kind === "image" ? metadata.modifyDate : metadata.modificationDate;
  const software = String(kind === "image" ? metadata.software ?? "" : metadata.creator ?? "");
  const author = String(kind === "image" ? metadata.artist ?? "" : metadata.author ?? "");

  if (created && modified && new Date(String(modified)) < new Date(String(created))) {
    indicators.push({
      title: "Timestamp inconsistency",
      level: "warning",
      description:
        "The modification date is earlier than the creation date. This is technically inconsistent and can indicate edited metadata.",
    });
  } else if (created || modified) {
    indicators.push({
      title: "Timestamps available",
      level: "normal",
      description: "Creation or modification dates are present and do not show an obvious inversion.",
    });
  } else {
    indicators.push({
      title: "Missing timestamps",
      level: "warning",
      description: "No creation or modification date was found in the available metadata.",
    });
  }

  const editingTools = ["photoshop", "gimp", "lightroom", "acrobat", "illustrator", "canva"];
  const matchedTool = editingTools.find((tool) => software.toLowerCase().includes(tool));

  if (matchedTool) {
    indicators.push({
      title: "Editing software detected",
      level: "warning",
      description: `The file metadata mentions "${software}". This shows the file was processed by an editing or production tool.`,
    });
  } else if (software) {
    indicators.push({
      title: "Creator software recorded",
      level: "normal",
      description: `Creator or software metadata is present: ${software}.`,
    });
  }

  const genericAuthors = ["user", "admin", "unknown", "owner"];
  if (!author.trim()) {
    indicators.push({
      title: "Author missing",
      level: "warning",
      description: "No author or artist name was found in the metadata.",
    });
  } else if (genericAuthors.includes(author.trim().toLowerCase())) {
    indicators.push({
      title: "Generic author",
      level: "warning",
      description: `The author name "${author}" is generic and provides little identifying value.`,
    });
  } else {
    indicators.push({
      title: "Author information present",
      level: "normal",
      description: `Author metadata is present: ${author}.`,
    });
  }

  if (kind === "image") {
    indicators.push(...detectImageSignals(metadata));
  } else {
    indicators.push(...detectPdfSignals(metadata));
  }

  return indicators;
}

function detectImageSignals(metadata: Metadata): Indicator[] {
  const indicators: Indicator[] = [];
  const usefulFields = [
    metadata.dateTimeOriginal,
    metadata.modifyDate,
    metadata.software,
    metadata.make,
    metadata.model,
    metadata.artist,
  ].filter(Boolean);

  if (usefulFields.length < 2) {
    indicators.push({
      title: "Sparse image metadata",
      level: "warning",
      description:
        "Very little EXIF information is available. The image may have been re-exported or had its metadata removed.",
    });
  }

  const device = `${metadata.make ?? ""} ${metadata.model ?? ""}`.toLowerCase();
  const looksLikePhone = ["iphone", "samsung", "pixel", "huawei", "xiaomi", "oneplus"].some((name) =>
    device.includes(name)
  );

  if (metadata.hasGps) {
    indicators.push({
      title: "GPS coordinates present",
      level: "normal",
      description: "Location metadata is still attached to this image.",
    });
  } else if (looksLikePhone) {
    indicators.push({
      title: "Phone image without GPS",
      level: "warning",
      description:
        "The device looks like a phone, but no GPS coordinates were found. Location data may have been removed.",
    });
  }

  if (metadata.dateTimeOriginal && metadata.dateTimeDigitized) {
    const gap = Math.abs(
      new Date(String(metadata.dateTimeDigitized)).getTime() -
        new Date(String(metadata.dateTimeOriginal)).getTime()
    );
    if (gap > 24 * 60 * 60 * 1000) {
      indicators.push({
        title: "Capture and digitization dates differ",
        level: "warning",
        description: "The original capture date and the digitized date are more than 24 hours apart.",
      });
    }
  }

  if (
    metadata.imageWidth &&
    metadata.exifImageWidth &&
    metadata.imageWidth !== metadata.exifImageWidth
  ) {
    indicators.push({
      title: "Dimension mismatch",
      level: "warning",
      description:
        "The stored image width does not match the EXIF image width. The file may have been cropped or re-saved.",
    });
  }

  return indicators;
}

function detectPdfSignals(metadata: Metadata): Indicator[] {
  const indicators: Indicator[] = [];
  const creator = String(metadata.creator ?? "").toLowerCase();
  const producer = String(metadata.producer ?? "").toLowerCase();

  if (creator && producer && !creator.includes(producer) && !producer.includes(creator)) {
    indicators.push({
      title: "Creator and producer differ",
      level: "warning",
      description: `The PDF was created by "${metadata.creator}" but produced by "${metadata.producer}". It may have been converted or processed again.`,
    });
  }

  if (!metadata.title && !metadata.subject) {
    indicators.push({
      title: "Document identity incomplete",
      level: "warning",
      description: "The PDF has neither a title nor a subject in its metadata.",
    });
  } else {
    indicators.push({
      title: "Document identity present",
      level: "normal",
      description: "A title or subject is recorded in the PDF metadata.",
    });
  }

  return indicators;
}

function toText(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

async function writeSummary(input: {
  fileName: string;
  kind: string;
  metadata: Metadata;
  indicators: Indicator[];
  overallStatus: string;
}) {
  const fallback =
    "Technical metadata was extracted and checked with fixed rules. These indicators support human review and do not decide whether the file is authentic.";

  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) return fallback;

  try {
    const cohere = new CohereClient({
      token: apiKey,
    });

    const prompt = `You write a short Verification Profile summary for legal professionals.
Use only the facts below. Do not invent anomalies.
Write 3 or 4 sentences in English.
Mention the overall status, the main warnings if any, and that this is decision support, not proof.

File: ${input.fileName}
Kind: ${input.kind}
Status: ${input.overallStatus}
Metadata: ${JSON.stringify(input.metadata)}
Indicators: ${JSON.stringify(input.indicators)}`;

    // Remplacement du modèle obsolète par 'command-r-plus-08-2024' ou 'command-r'
    const response = await cohere.chat({
      model: "command-r-plus-08-2024",
      message: prompt,
    });

    const text = response.text?.trim();

    if (!text) {
      console.error("Cohere empty response");
      return fallback;
    }

    return text;
  } catch (error) {
    console.error("Cohere request failed", error);
    return fallback;
  }
}