"use client"

import { useState } from "react"
import { Button, Spin, message } from "antd"
import { PlayCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"
import Editor from "@monaco-editor/react"
import type { ValidationResult } from "@/types/alert"
import styles from "@/styles/alert.module.css"

interface ScriptEditorProps {
  type: "sql" | "js"
  value: string
  onChange: (value: string) => void
  height?: number
}

export default function ScriptEditor({ type, value, onChange, height = 250 }: ScriptEditorProps) {
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const handleValidate = async () => {
    if (!value.trim()) {
      message.warning("请先输入脚本内容")
      return
    }

    setValidating(true)
    setValidationResult(null)

    try {
      const response = await fetch(`/api/validate/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: value }),
      })

      const result = await response.json()
      setValidationResult(result)

      if (result.success) {
        message.success("脚本验证通过")
      } else {
        message.error(result.message)
      }
    } catch {
      message.error("验证请求失败")
    } finally {
      setValidating(false)
    }
  }

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.editorHeader}>
        <span className={styles.editorTitle}>{type === "sql" ? "SQL 脚本" : "JavaScript 脚本"}</span>
        <Button type="primary" size="small" icon={<PlayCircleOutlined />} onClick={handleValidate} loading={validating}>
          验证脚本
        </Button>
      </div>

      <Spin spinning={validating}>
        <Editor
          height={height}
          language={type === "sql" ? "sql" : "javascript"}
          value={value}
          onChange={(v) => onChange(v || "")}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
          }}
        />
      </Spin>

      {validationResult && (
        <div
          className={`${styles.validationResult} ${validationResult.success ? styles.validationSuccess : styles.validationError}`}
        >
          {validationResult.success ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              <span>{validationResult.message}</span>
              {validationResult.result !== undefined && (
                <span style={{ marginLeft: 16, color: "#595959" }}>
                  返回值: <strong>{String(validationResult.result)}</strong>
                  {validationResult.executionTime && (
                    <span style={{ marginLeft: 8 }}>({validationResult.executionTime}ms)</span>
                  )}
                </span>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
              <span>{validationResult.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
