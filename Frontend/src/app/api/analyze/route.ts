import { NextRequest, NextResponse } from "next/server";
import exifr from "exifr";
import { PDFDocument } from "pdf-lib";



export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const type = file.type;

    if (type === "image/jpeg" || type === "image/png") {
      const metadata = await extractImageMetadata(buffer);
      return NextResponse.json({
        fileName: file.name,
        fileType: type,
        fileSize: file.size,
        kind: "image",
        metadata,
      });
    }

    if (type === "application/pdf") {
      const metadata = await extractPdfMetadata(buffer);
      return NextResponse.json({
        fileName: file.name,
        fileType: type,
        fileSize: file.size,
        kind: "pdf",
        metadata,
      });
    }

    return NextResponse.json(
      { error: "Unsupported file type. Only JPG, PNG and PDF are allowed." },
      { status: 400 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to analyze file." }, { status: 500 });
  }
}

async function extractImageMetadata(buffer: Buffer) {
  const data = (await exifr.parse(buffer, { reviveValues: false })) ?? {};

  return {
    dateTimeOriginal: data.DateTimeOriginal ?? null,
    modifyDate: data.ModifyDate ?? null,
    software: data.Software ?? null,
    make: data.Make ?? null,
    model: data.Model ?? null,
    artist: data.Artist ?? null,
    hasGps: Boolean(data.latitude && data.longitude),
  };
}

async function extractPdfMetadata(buffer: Buffer) {
  const pdf = await PDFDocument.load(buffer, { updateMetadata: false });

  return {
    title: pdf.getTitle() ?? null,
    author: pdf.getAuthor() ?? null,
    creator: pdf.getCreator() ?? null,
    producer: pdf.getProducer() ?? null,
    creationDate: pdf.getCreationDate()?.toISOString() ?? null,
    modificationDate: pdf.getModificationDate()?.toISOString() ?? null,
    pageCount: pdf.getPageCount(),
  };
}