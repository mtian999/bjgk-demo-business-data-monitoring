"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Table, Button, Space, Tag, Popconfirm, message, Input, Select, Tooltip, Modal } from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CaretRightOutlined,
  HistoryOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import type { AlertRule } from "@/types/alert"
import { OPERATOR_MAP } from "@/types/alert"
import styles from "@/styles/alert.module.css"

export default function AlertList() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [rules, setRules] = useState<AlertRule[]>([])
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [executing, setExecuting] = useState<string | null>(null)

  const loadRules = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/alert-rules")
      const { data } = await res.json()
      setRules(data)
    } catch {
      message.error("加载规则列表失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRules()
  }, [loadRules])

  const handleToggleStatus = async (record: AlertRule) => {
    try {
      const res = await fetch(`/api/alert-rules/${record.id}/toggle`, { method: "POST" })
      if (res.ok) {
        message.success(record.status === "enabled" ? "已停用" : "已启用")
        loadRules()
      }
    } catch {
      message.error("操作失败")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/alert-rules/${id}`, { method: "DELETE" })
      if (res.ok) {
        message.success("删除成功")
        loadRules()
      }
    } catch {
      message.error("删除失败")
    }
  }

  const handleExecute = async (record: AlertRule) => {
    setExecuting(record.id)
    try {
      const res = await fetch(`/api/alert-rules/${record.id}/execute`, { method: "POST" })
      const result = await res.json()

      if (result.success) {
        Modal.info({
          title: "执行结果",
          content: (
            <div>
              <p>
                <strong>状态:</strong> {result.data.status === "triggered" ? "已触发告警" : "执行成功"}
              </p>
              <p>
                <strong>返回值:</strong> {result.data.resultValue}
              </p>
              <p>
                <strong>耗时:</strong> {result.data.duration}ms
              </p>
              <p>
                <strong>通知:</strong> {result.data.notified ? "已发送" : "未发送"}
              </p>
            </div>
          ),
        })
        loadRules()
      } else {
        message.error(result.message)
      }
    } catch {
      message.error("执行失败")
    } finally {
      setExecuting(null)
    }
  }

  const filteredRules = rules.filter((rule) => {
    const matchSearch =
      rule.name.toLowerCase().includes(searchText.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchText.toLowerCase())
    const matchStatus = statusFilter === "all" || rule.status === statusFilter
    const matchType = typeFilter === "all" || rule.type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const columns: ColumnsType<AlertRule> = [
    {
      title: "规则名称",
      dataIndex: "name",
      key: "name",
      width: 180,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>
              {record.description.length > 30 ? record.description.slice(0, 30) + "..." : record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 80,
      render: (type) => <Tag color={type === "sql" ? "blue" : "orange"}>{type.toUpperCase()}</Tag>,
    },
    {
      title: "脚本预览",
      key: "script",
      width: 200,
      render: (_, record) => (
        <Tooltip title={record.type === "sql" ? record.sqlScript : record.jsScript}>
          <div className={styles.scriptPreview}>{record.type === "sql" ? record.sqlScript : record.jsScript}</div>
        </Tooltip>
      ),
    },
    {
      title: "告警条件",
      key: "condition",
      width: 140,
      render: (_, record) => (
        <span>
          结果 {OPERATOR_MAP[record.operator]} <strong>{record.threshold}</strong>
        </span>
      ),
    },
    {
      title: "调度周期",
      dataIndex: "cronExpression",
      key: "cronExpression",
      width: 120,
      render: (cron) => <code style={{ fontSize: 12 }}>{cron}</code>,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status) => (
        <Tag color={status === "enabled" ? "success" : "default"}>{status === "enabled" ? "运行中" : "已停用"}</Tag>
      ),
    },
    {
      title: "最后执行",
      dataIndex: "lastExecutedAt",
      key: "lastExecutedAt",
      width: 160,
      render: (time) => time || "-",
    },
    {
      title: "操作",
      key: "action",
      width: 280,
      fixed: "right",
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => router.push(`/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title={record.status === "enabled" ? "停用" : "启用"}>
            <Button
              type="text"
              size="small"
              icon={record.status === "enabled" ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Tooltip title="立即执行">
            <Button
              type="text"
              size="small"
              icon={<CaretRightOutlined />}
              loading={executing === record.id}
              onClick={() => handleExecute(record)}
            />
          </Tooltip>
          <Tooltip title="执行记录">
            <Button
              type="text"
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => router.push(`/records?ruleId=${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除此规则?"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>告警规则管理</h1>
        <Space>
          <Button icon={<HistoryOutlined />} onClick={() => router.push("/records")}>
            执行记录
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push("/create")}>
            新建规则
          </Button>
        </Space>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.filterBar}>
          <Input
            placeholder="搜索规则名称或描述"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            options={[
              { label: "全部状态", value: "all" },
              { label: "运行中", value: "enabled" },
              { label: "已停用", value: "disabled" },
            ]}
          />
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 120 }}
            options={[
              { label: "全部类型", value: "all" },
              { label: "SQL", value: "sql" },
              { label: "JavaScript", value: "js" },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={loadRules}>
            刷新
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredRules}
          rowKey="id"
          loading={loading}
          pagination={{ showSizeChanger: true, showQuickJumper: true, showTotal: (total) => `共 ${total} 条规则` }}
          scroll={{ x: 1200 }}
        />
      </div>
    </div>
  )
}
