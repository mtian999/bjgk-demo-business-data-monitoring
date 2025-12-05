import { type NextRequest, NextResponse } from "next/server"
import { getAlertRuleById, updateAlertRule, addExecutionRecord } from "@/lib/mock-data"
import type { ExecutionRecord } from "@/types/alert"

function evaluateCondition(value: number, operator: string, threshold: number): boolean {
  switch (operator) {
    case "gt":
      return value > threshold
    case "lt":
      return value < threshold
    case "eq":
      return value === threshold
    case "gte":
      return value >= threshold
    case "lte":
      return value <= threshold
    case "neq":
      return value !== threshold
    default:
      return false
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rule = getAlertRuleById(id)

  if (!rule) {
    return NextResponse.json({ success: false, message: "规则不存在" }, { status: 404 })
  }

  const startTime = Date.now()

  try {
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200))

    const resultValue = Math.floor(Math.random() * 300)
    const duration = Date.now() - startTime
    const triggered = evaluateCondition(resultValue, rule.operator, rule.threshold)

    const record: Omit<ExecutionRecord, "id"> = {
      ruleId: rule.id,
      ruleName: rule.name,
      executeTime: new Date().toLocaleString("zh-CN"),
      duration,
      status: triggered ? "triggered" : "success",
      resultValue,
      notified: triggered,
    }

    const newRecord = addExecutionRecord(record)
    updateAlertRule(id, { lastExecutedAt: record.executeTime })

    return NextResponse.json({
      success: true,
      data: newRecord,
      message: triggered ? "触发告警条件，已发送通知" : "执行成功，未触发告警",
    })
  } catch (error) {
    const duration = Date.now() - startTime
    const record: Omit<ExecutionRecord, "id"> = {
      ruleId: rule.id,
      ruleName: rule.name,
      executeTime: new Date().toLocaleString("zh-CN"),
      duration,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "执行失败",
      notified: false,
    }

    addExecutionRecord(record)

    return NextResponse.json({
      success: false,
      message: "执行失败",
      error: error instanceof Error ? error.message : "未知错误",
    })
  }
}
