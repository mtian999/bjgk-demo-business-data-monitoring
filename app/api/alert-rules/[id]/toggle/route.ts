import { type NextRequest, NextResponse } from "next/server"
import { getAlertRuleById, updateAlertRule } from "@/lib/mock-data"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rule = getAlertRuleById(id)
  if (!rule) {
    return NextResponse.json({ success: false, message: "规则不存在" }, { status: 404 })
  }

  const newStatus = rule.status === "enabled" ? "disabled" : "enabled"
  const updated = updateAlertRule(id, { status: newStatus })

  return NextResponse.json({ success: true, data: updated })
}
