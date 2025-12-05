import { type NextRequest, NextResponse } from "next/server"
import { getExecutionRecords } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ruleId = searchParams.get("ruleId")

  const records = getExecutionRecords(ruleId || undefined)
  return NextResponse.json({ success: true, data: records })
}
