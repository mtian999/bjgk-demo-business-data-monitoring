import { Suspense } from "react"
import { Spin } from "antd"
import ExecutionRecords from "@/components/execution-records"

export default function RecordsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 100, textAlign: "center" }}>
          <Spin size="large" />
        </div>
      }
    >
      <ExecutionRecords />
    </Suspense>
  )
}
