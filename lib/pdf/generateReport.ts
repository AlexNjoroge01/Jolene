import fs from "fs"
import path from "path"

import { v2 as cloudinary } from "cloudinary"
import puppeteer from "puppeteer"

import { getReportData } from "@/lib/queries/reports"

import { renderHODMondayReport } from "./templates/HODMondayReport"
import { renderWeeklyReport } from "./templates/WeeklyReport"

export type GenerateReportInput = {
  type: "hod_monday" | "weekly_eow" | "custom"
  title: string
  periodStart?: string
  periodEnd?: string
  nextWeekPlan?: string
  customNotes?: string
  projectIds?: number[]
}

function getLogoBase64(): string {
  try {
    const logoPath = path.join(process.cwd(), "public", "goip_logo.png")
    const buf = fs.readFileSync(logoPath)
    return buf.toString("base64")
  } catch {
    return ""
  }
}

async function htmlToPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 })

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `
        <div style="
          font-size: 8pt;
          color: #555F70;
          width: 100%;
          padding: 4px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 2px solid #6DBE45;
          font-family: Arial, sans-serif;
        ">
          <span>GoExperience (GOIP) &nbsp;|&nbsp; Confidential &nbsp;|&nbsp; Internal Use Only</span>
          <span><span class="pageNumber"></span></span>
        </div>
      `,
      margin: {
        top: "14mm",
        bottom: "22mm",
        left: "0",
        right: "0",
      },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

async function uploadPdfToCloudinary(pdfBuffer: Buffer, filename: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials not configured")
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })

  console.log(`[Cloudinary] Starting upload for ${filename}. Buffer size: ${pdfBuffer.length} bytes`)

  try {
    const base64Pdf = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`
    const result = await cloudinary.uploader.upload(base64Pdf, {
      folder: "jolene/reports",
      resource_type: "raw",
      public_id: `${filename}.pdf`,
    })

    console.log(`[Cloudinary] Upload successful: ${result.secure_url}`)
    return result.secure_url
  } catch (error) {
    console.error("[Cloudinary] Upload failed:", error)
    throw error
  }
}

export async function generateReport(input: GenerateReportInput): Promise<string> {
  const logoBase64 = getLogoBase64()

  // Fetch live data from DB
  const data = await getReportData(input.periodStart, input.periodEnd, input.projectIds)

  // Render HTML template
  let html: string
  if (input.type === "hod_monday") {
    html = renderHODMondayReport({
      title: input.title,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      customNotes: input.customNotes,
      data,
      logoBase64,
    })
  } else {
    html = renderWeeklyReport({
      title: input.title,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      nextWeekPlan: input.nextWeekPlan,
      customNotes: input.customNotes,
      data,
      logoBase64,
    })
  }

  // Convert HTML → PDF via Puppeteer
  const pdfBuffer = await htmlToPdf(html)

  // Upload PDF to Cloudinary
  const filename = `report-${input.type}-${Date.now()}`
  const pdfUrl = await uploadPdfToCloudinary(pdfBuffer, filename)

  return pdfUrl
}
