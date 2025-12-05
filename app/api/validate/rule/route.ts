import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const rule = await request.json()
  const errors: string[] = []

  if (!rule.name || rule.name.trim().length === 0) {
    errors.push("规则名称不能为空")
  } else if (rule.name.length > 50) {
    errors.push("规则名称不能超过50个字符")
  }

  if (!["sql", "js"].includes(rule.type)) {
    errors.push("规则类型必须是SQL或JS")
  }

  if (rule.type === "sql" && (!rule.sqlScript || rule.sqlScript.trim().length === 0)) {
    errors.push("SQL脚本不能为空")
  }
  if (rule.type === "js" && (!rule.jsScript || rule.jsScript.trim().length === 0)) {
    errors.push("JS脚本不能为空")
  }

  const cronRegex =
    /^(\*|([0-9]|[1-5][0-9])|\*\/([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|[12][0-9]|3[01])|\*\/([1-9]|[12][0-9]|3[01])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|[0-6]|\*\/[0-6])$/
  if (!rule.cronExpression || !cronRegex.test(rule.cronExpression)) {
    errors.push("Cron表达式格式不正确")
  }

  if (typeof rule.threshold !== "number" || isNaN(rule.threshold)) {
    errors.push("阈值必须是有效数字")
  }

  if (!["gt", "lt", "eq", "gte", "lte", "neq"].includes(rule.operator)) {
    errors.push("操作符无效")
  }

  if (!rule.notifyType || rule.notifyType.length === 0) {
    errors.push("至少选择一种通知方式")
  }

  if (!rule.notifyTargets || rule.notifyTargets.trim().length === 0) {
    errors.push("通知目标不能为空")
  }

  await new Promise((resolve) => setTimeout(resolve, 200))

  if (errors.length > 0) {
    return NextResponse.json({ success: false, message: "规则验证失败", errors })
  }

  return NextResponse.json({ success: true, message: "规则验证通过" })
}
