import { v2 as cloudinary } from "cloudinary"

import { renderHODMondayReport } from "./templates/HODMondayReport"
import { renderWeeklyReport } from "./templates/WeeklyReport"

type GenerateReportInput = {
  type: "hod_monday" | "weekly_eow" | "custom"
  title: string
  periodStart?: string
  periodEnd?: string
}

export async function generateReport(input: GenerateReportInput) {
  const html =
    input.type === "hod_monday"
      ? renderHODMondayReport(input)
      : input.type === "weekly_eow"
        ? renderWeeklyReport(input)
        : renderWeeklyReport(input)

  // Phase 7 baseline: store HTML payload as a text file in Cloudinary.
  // Can be upgraded to full Puppeteer PDF binary upload.
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) return ""

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })
  const uploaded = await cloudinary.uploader.upload(
    `data:text/html;base64,${Buffer.from(html).toString("base64")}`,
    { folder: "jolene/reports", resource_type: "raw", public_id: `report-${Date.now()}.html` },
  )
  return uploaded.secure_url
}
