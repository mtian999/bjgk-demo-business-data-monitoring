import type { AlertRule, ExecutionRecord } from "@/types/alert"

export const mockAlertRules: AlertRule[] = [
  {
    id: "1",
    name: "订单量异常监控",
    description: "监控每小时订单量，低于阈值时告警",
    type: "sql",
    sqlScript: `SELECT COUNT(*) as order_count 
FROM orders 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
    cronExpression: "0 * * * *",
    threshold: 100,
    operator: "lt",
    notifyType: ["email", "sms"],
    notifyTargets: "admin@example.com,13800138000",
    status: "enabled",
    createdAt: "2024-01-15 10:30:00",
    updatedAt: "2024-01-20 14:20:00",
    lastExecutedAt: "2024-01-21 09:00:00",
  },
  {
    id: "2",
    name: "用户注册量监控",
    description: "监控每日新用户注册量",
    type: "sql",
    sqlScript: `SELECT COUNT(*) as user_count 
FROM users 
WHERE DATE(created_at) = CURDATE()`,
    cronExpression: "0 0 * * *",
    threshold: 50,
    operator: "lt",
    notifyType: ["email"],
    notifyTargets: "ops@example.com",
    status: "enabled",
    createdAt: "2024-01-10 08:00:00",
    updatedAt: "2024-01-18 16:45:00",
    lastExecutedAt: "2024-01-21 00:00:00",
  },
  {
    id: "3",
    name: "支付成功率监控",
    description: "通过JS脚本计算支付成功率",
    type: "js",
    jsScript: `// 模拟获取支付数据
const totalPayments = 1000;
const successPayments = 920;
const successRate = (successPayments / totalPayments) * 100;
return successRate;`,
    cronExpression: "*/30 * * * *",
    threshold: 95,
    operator: "lt",
    notifyType: ["email", "webhook"],
    notifyTargets: "payment@example.com,https://webhook.example.com/alert",
    status: "disabled",
    createdAt: "2024-01-12 11:20:00",
    updatedAt: "2024-01-19 09:30:00",
  },
  {
    id: "4",
    name: "API响应时间监控",
    description: "监控API平均响应时间",
    type: "js",
    jsScript: `// 计算API平均响应时间
const responseTimes = [120, 150, 200, 180, 160, 140];
const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
return avgTime;`,
    cronExpression: "*/5 * * * *",
    threshold: 200,
    operator: "gt",
    notifyType: ["sms"],
    notifyTargets: "13900139000",
    status: "enabled",
    createdAt: "2024-01-08 14:00:00",
    updatedAt: "2024-01-21 08:00:00",
    lastExecutedAt: "2024-01-21 09:05:00",
  },
]

export const mockExecutionRecords: ExecutionRecord[] = [
  {
    id: "exec-1",
    ruleId: "1",
    ruleName: "订单量异常监控",
    executeTime: "2024-01-21 09:00:00",
    duration: 156,
    status: "success",
    resultValue: 158,
    notified: false,
  },
  {
    id: "exec-2",
    ruleId: "1",
    ruleName: "订单量异常监控",
    executeTime: "2024-01-21 08:00:00",
    duration: 142,
    status: "triggered",
    resultValue: 85,
    notified: true,
  },
  {
    id: "exec-3",
    ruleId: "2",
    ruleName: "用户注册量监控",
    executeTime: "2024-01-21 00:00:00",
    duration: 89,
    status: "success",
    resultValue: 127,
    notified: false,
  },
  {
    id: "exec-4",
    ruleId: "4",
    ruleName: "API响应时间监控",
    executeTime: "2024-01-21 09:05:00",
    duration: 45,
    status: "triggered",
    resultValue: 245,
    notified: true,
  },
  {
    id: "exec-5",
    ruleId: "1",
    ruleName: "订单量异常监控",
    executeTime: "2024-01-21 07:00:00",
    duration: 0,
    status: "failed",
    errorMessage: "数据库连接超时",
    notified: false,
  },
  {
    id: "exec-6",
    ruleId: "4",
    ruleName: "API响应时间监控",
    executeTime: "2024-01-21 09:00:00",
    duration: 52,
    status: "success",
    resultValue: 165,
    notified: false,
  },
]

// 内存数据存储
const alertRules = [...mockAlertRules]
const executionRecords = [...mockExecutionRecords]

export const getAlertRules = () => [...alertRules]

export const getAlertRuleById = (id: string) => alertRules.find((r) => r.id === id)

export const createAlertRule = (rule: Omit<AlertRule, "id" | "createdAt" | "updatedAt">) => {
  const newRule: AlertRule = {
    ...rule,
    id: `rule-${Date.now()}`,
    createdAt: new Date().toLocaleString("zh-CN"),
    updatedAt: new Date().toLocaleString("zh-CN"),
  }
  alertRules.unshift(newRule)
  return newRule
}

export const updateAlertRule = (id: string, updates: Partial<AlertRule>) => {
  const index = alertRules.findIndex((r) => r.id === id)
  if (index !== -1) {
    alertRules[index] = {
      ...alertRules[index],
      ...updates,
      updatedAt: new Date().toLocaleString("zh-CN"),
    }
    return alertRules[index]
  }
  return null
}

export const deleteAlertRule = (id: string) => {
  const index = alertRules.findIndex((r) => r.id === id)
  if (index !== -1) {
    alertRules.splice(index, 1)
    return true
  }
  return false
}

export const getExecutionRecords = (ruleId?: string) => {
  if (ruleId) {
    return executionRecords.filter((r) => r.ruleId === ruleId)
  }
  return [...executionRecords]
}

export const addExecutionRecord = (record: Omit<ExecutionRecord, "id">) => {
  const newRecord: ExecutionRecord = {
    ...record,
    id: `exec-${Date.now()}`,
  }
  executionRecords.unshift(newRecord)
  return newRecord
}
