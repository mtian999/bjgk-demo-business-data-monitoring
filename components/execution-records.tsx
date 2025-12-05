"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, Button, Tag, Select, DatePicker, Space, Tooltip } from "antd"
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import type { ExecutionRecord } from "@/types/alert"
import styles from "@/styles/alert.module.css"

const { RangePicker } = DatePicker

export default function ExecutionRecords() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ruleIdParam = searchParams.get("ruleId")

  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<ExecutionRecord[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [ruleFilter, setRuleFilter] = useState<string>(ruleIdParam || "all")

  const loadRecords = useCallback(async () => {
    setLoading(true)
    try {
      const url = ruleIdParam ? `/api/execution-records?ruleId=${ruleIdParam}` : "/api/execution-records"
      const res = await fetch(url)
      const { data } = await res.json()
      setRecords(data)
    } catch {
      console.error("加载记录失败")
    } finally {
      setLoading(false)
    }
  }, [ruleIdParam])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const filteredRecords = records.filter((record) => {
    const matchStatus = statusFilter === "all" || record.status === statusFilter
    const matchRule = ruleFilter === "all" || record.ruleId === ruleFilter
    return matchStatus && matchRule
  })

  const stats = {
    total: records.length,
    success: records.filter((r) => r.status === "success").length,
    failed: records.filter((r) => r.status === "failed").length,
    triggered: records.filter((r) => r.status === "triggered").length,
  }

  const uniqueRules = Array.from(new Set(records.map((r) => r.ruleId))).map((id) => ({
    id,
    name: records.find((r) => r.ruleId === id)?.ruleName || id,
  }))

  const columns: ColumnsType<ExecutionRecord> = [
    {
      title: "执行时间",
      dataIndex: "executeTime",
      key: "executeTime",
      width: 180,
      sorter: (a, b) => new Date(a.executeTime).getTime() - new Date(b.executeTime).getTime(),
      defaultSortOrder: "descend",
    },
    { title: "规则名称", dataIndex: "ruleName", key: "ruleName", width: 200 },
    {
      title: "执行状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const config = {
          success: { color: "success", text: "执行成功" },
          failed: { color: "error", text: "执行失败" },
          triggered: { color: "warning", text: "触发告警" },
        }
        const { color, text } = config[status as keyof typeof config] || { color: "default", text: status }
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: "返回值",
      dataIndex: "resultValue",
      key: "resultValue",
      width: 100,
      render: (value) => (value !== undefined ? <strong>{value}</strong> : "-"),
    },
    { title: "执行耗时", dataIndex: "duration", key: "duration", width: 100, render: (duration) => `${duration}ms` },
    {
      title: "已通知",
      dataIndex: "notified",
      key: "notified",
      width: 80,
      render: (notified) => <Tag color={notified ? "blue" : "default"}>{notified ? "是" : "否"}</Tag>,
    },
    {
      title: "错误信息",
      dataIndex: "errorMessage",
      key: "errorMessage",
      width: 200,
      render: (msg) =>
        msg ? (
          <Tooltip title={msg}>
            <span className={styles.errorMessage}>{msg}</span>
          </Tooltip>
        ) : (
          "-"
        ),
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>执行记录</h1>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/")}>
          返回规则列表
        </Button>
      </div>

      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>总执行次数</div>
          <div className={`${styles.statValue} ${styles.statTotal}`}>{stats.total}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>执行成功</div>
          <div className={`${styles.statValue} ${styles.statSuccess}`}>{stats.success}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>触发告警</div>
          <div className={`${styles.statValue} ${styles.statTriggered}`}>{stats.triggered}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>执行失败</div>
          <div className={`${styles.statValue} ${styles.statFailed}`}>{stats.failed}</div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.filterBar}>
          <Select
            value={ruleFilter}
            onChange={setRuleFilter}
            style={{ width: 200 }}
            placeholder="筛选规则"
            options={[{ label: "全部规则", value: "all" }, ...uniqueRules.map((r) => ({ label: r.name, value: r.id }))]}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            options={[
              { label: "全部状态", value: "all" },
              { label: "执行成功", value: "success" },
              { label: "触发告警", value: "triggered" },
              { label: "执行失败", value: "failed" },
            ]}
          />
          <RangePicker placeholder={["开始时间", "结束时间"]} />
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadRecords}>
              刷新
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSize: 10,
          }}
        />
      </div>
    </div>
  )
}
