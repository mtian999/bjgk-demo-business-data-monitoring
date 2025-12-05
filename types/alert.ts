export interface AlertRule {
  id: string
  name: string
  description: string
  type: "sql" | "js"
  sqlScript?: string
  jsScript?: string
  cronExpression: string
  threshold: number
  operator: "gt" | "lt" | "eq" | "gte" | "lte" | "neq"
  notifyType: ("email" | "sms" | "webhook")[]
  notifyTargets: string
  status: "enabled" | "disabled"
  createdAt: string
  updatedAt: string
  lastExecutedAt?: string
}

export interface ExecutionRecord {
  id: string
  ruleId: string
  ruleName: string
  executeTime: string
  duration: number
  status: "success" | "failed" | "triggered"
  resultValue?: number
  errorMessage?: string
  notified: boolean
}

export interface ValidationResult {
  success: boolean
  message: string
  result?: unknown
  executionTime?: number
}

export type OperatorType = "gt" | "lt" | "eq" | "gte" | "lte" | "neq"

export const OPERATOR_MAP: Record<OperatorType, string> = {
  gt: "大于",
  lt: "小于",
  eq: "等于",
  gte: "大于等于",
  lte: "小于等于",
  neq: "不等于",
}
