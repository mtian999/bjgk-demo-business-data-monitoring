"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Form, Input, Select, InputNumber, Checkbox, Button, message, Spin, Radio, Tooltip } from "antd"
import { SaveOutlined, CloseOutlined, CheckCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons"
import ScriptEditor from "./script-editor"
import type { OperatorType } from "@/types/alert"
import { OPERATOR_MAP } from "@/types/alert"
import styles from "@/styles/alert.module.css"

interface AlertFormProps {
  id?: string
}

const notifyOptions = [
  { label: "邮件通知", value: "email" },
  { label: "短信通知", value: "sms" },
  { label: "Webhook", value: "webhook" },
]

const cronPresets = [
  { label: "每分钟", value: "* * * * *" },
  { label: "每5分钟", value: "*/5 * * * *" },
  { label: "每30分钟", value: "*/30 * * * *" },
  { label: "每小时", value: "0 * * * *" },
  { label: "每天0点", value: "0 0 * * *" },
  { label: "每周一0点", value: "0 0 * * 1" },
]

export default function AlertForm({ id }: AlertFormProps) {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState(false)
  const [scriptType, setScriptType] = useState<"sql" | "js">("sql")
  const [sqlScript, setSqlScript] = useState("")
  const [jsScript, setJsScript] = useState("")

  const isEdit = !!id

  useEffect(() => {
    if (id) {
      loadRule(id)
    }
  }, [id])

  const loadRule = async (ruleId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/alert-rules/${ruleId}`)
      const { data } = await res.json()

      form.setFieldsValue({
        name: data.name,
        description: data.description,
        cronExpression: data.cronExpression,
        threshold: data.threshold,
        operator: data.operator,
        notifyType: data.notifyType,
        notifyTargets: data.notifyTargets,
      })

      setScriptType(data.type)
      setSqlScript(data.sqlScript || "")
      setJsScript(data.jsScript || "")
    } catch {
      message.error("加载规则失败")
    } finally {
      setLoading(false)
    }
  }

  const handleValidateRule = async () => {
    try {
      const values = await form.validateFields()
      setValidating(true)

      const ruleData = {
        ...values,
        type: scriptType,
        sqlScript: scriptType === "sql" ? sqlScript : undefined,
        jsScript: scriptType === "js" ? jsScript : undefined,
      }

      const res = await fetch("/api/validate/rule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleData),
      })

      const result = await res.json()

      if (result.success) {
        message.success("规则验证通过")
      } else {
        message.error(`验证失败: ${result.errors?.join(", ")}`)
      }
    } catch {
      message.warning("请先完成表单填写")
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const ruleData = {
        ...values,
        type: scriptType,
        sqlScript: scriptType === "sql" ? sqlScript : undefined,
        jsScript: scriptType === "js" ? jsScript : undefined,
        status: "disabled" as const,
      }

      const url = isEdit ? `/api/alert-rules/${id}` : "/api/alert-rules"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleData),
      })

      if (res.ok) {
        message.success(isEdit ? "规则更新成功" : "规则创建成功")
        router.push("/")
      } else {
        message.error("保存失败")
      }
    } catch {
      message.warning("请完成必填项")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h1 className={styles.formTitle}>{isEdit ? "编辑告警规则" : "新建告警规则"}</h1>
        </div>

        <Spin spinning={loading}>
          <div className={styles.formBody}>
            <Form form={form} layout="vertical" initialValues={{ operator: "gt", notifyType: ["email"] }}>
              <div className={styles.sectionTitle}>基本信息</div>

              <Form.Item
                name="name"
                label="规则名称"
                rules={[
                  { required: true, message: "请输入规则名称" },
                  { max: 50, message: "规则名称不超过50字符" },
                ]}
              >
                <Input placeholder="请输入规则名称" maxLength={50} />
              </Form.Item>

              <Form.Item name="description" label="规则描述">
                <Input.TextArea placeholder="请输入规则描述" rows={2} maxLength={200} showCount />
              </Form.Item>

              <div className={styles.sectionTitle}>脚本配置</div>

              <Form.Item label="脚本类型" required>
                <Radio.Group value={scriptType} onChange={(e) => setScriptType(e.target.value)}>
                  <Radio.Button value="sql">SQL 脚本</Radio.Button>
                  <Radio.Button value="js">JavaScript 脚本</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    {scriptType === "sql" ? "SQL 查询脚本" : "JavaScript 脚本"}
                    <Tooltip
                      title={
                        scriptType === "sql"
                          ? "编写SELECT语句，返回单个数值用于告警判断"
                          : "编写JS代码，必须包含return语句返回数值"
                      }
                    >
                      <QuestionCircleOutlined style={{ marginLeft: 4, color: "#8c8c8c" }} />
                    </Tooltip>
                  </span>
                }
                required
              >
                {scriptType === "sql" ? (
                  <ScriptEditor type="sql" value={sqlScript} onChange={setSqlScript} />
                ) : (
                  <ScriptEditor type="js" value={jsScript} onChange={setJsScript} />
                )}
              </Form.Item>

              <div className={styles.sectionTitle}>调度配置</div>

              <Form.Item
                name="cronExpression"
                label={
                  <span>
                    Cron 表达式
                    <Tooltip title="格式: 分 时 日 月 周">
                      <QuestionCircleOutlined style={{ marginLeft: 4, color: "#8c8c8c" }} />
                    </Tooltip>
                  </span>
                }
                rules={[{ required: true, message: "请输入Cron表达式" }]}
              >
                <Select placeholder="选择或输入Cron表达式" allowClear showSearch>
                  {cronPresets.map((preset) => (
                    <Select.Option key={preset.value} value={preset.value}>
                      {preset.label} ({preset.value})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <div className={styles.sectionTitle}>告警条件</div>

              <div style={{ display: "flex", gap: 16 }}>
                <Form.Item name="operator" label="比较运算符" rules={[{ required: true }]} style={{ width: 200 }}>
                  <Select>
                    {(Object.keys(OPERATOR_MAP) as OperatorType[]).map((op) => (
                      <Select.Option key={op} value={op}>
                        {OPERATOR_MAP[op]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="threshold"
                  label="阈值"
                  rules={[{ required: true, message: "请输入阈值" }]}
                  style={{ width: 200 }}
                >
                  <InputNumber placeholder="请输入阈值" style={{ width: "100%" }} precision={2} />
                </Form.Item>
              </div>

              <div className={styles.sectionTitle}>通知配置</div>

              <Form.Item
                name="notifyType"
                label="通知方式"
                rules={[{ required: true, message: "请选择至少一种通知方式" }]}
              >
                <Checkbox.Group options={notifyOptions} />
              </Form.Item>

              <Form.Item
                name="notifyTargets"
                label="通知目标"
                rules={[{ required: true, message: "请输入通知目标" }]}
                extra="多个目标用英文逗号分隔"
              >
                <Input.TextArea placeholder="请输入通知目标" rows={2} />
              </Form.Item>
            </Form>
          </div>

          <div className={styles.formActions}>
            <Button icon={<CloseOutlined />} onClick={() => router.push("/")}>
              取消
            </Button>
            <Button icon={<CheckCircleOutlined />} onClick={handleValidateRule} loading={validating}>
              验证规则
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit} loading={saving}>
              {isEdit ? "更新规则" : "创建规则"}
            </Button>
          </div>
        </Spin>
      </div>
    </div>
  )
}
