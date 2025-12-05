import { type NextRequest, NextResponse } from "next/server"
import { getAlertRuleById, updateAlertRule, deleteAlertRule } from "@/lib/mock-data"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rule = getAlertRuleById(id)
  if (rule) {
    return NextResponse.json({ success: true, data: rule })
  }
  return NextResponse.json({ success: false, message: "规则不存在" }, { status: 404 })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const updated = updateAlertRule(id, body)
  if (updated) {
    return NextResponse.json({ success: true, data: updated })
  }
  return NextResponse.json({ success: false, message: "规则不存在" }, { status: 404 })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = deleteAlertRule(id)
  if (deleted) {
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ success: false, message: "规则不存在" }, { status: 404 })
}
