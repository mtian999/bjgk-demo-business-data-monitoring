import { type NextRequest, NextResponse } from "next/server"
import { getAlertRules, createAlertRule } from "@/lib/mock-data"

export async function GET() {
  const rules = getAlertRules()
  return NextResponse.json({ success: true, data: rules })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const newRule = createAlertRule(body)
  return NextResponse.json({ success: true, data: newRule })
}
