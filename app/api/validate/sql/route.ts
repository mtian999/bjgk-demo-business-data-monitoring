import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { script } = await request.json()

  if (!script || typeof script !== "string") {
    return NextResponse.json({ success: false, message: "SQL脚本不能为空" })
  }

  await new Promise((resolve) => setTimeout(resolve, 500))

  const upperScript = script.toUpperCase().trim()

  if (!upperScript.startsWith("SELECT")) {
    return NextResponse.json({ success: false, message: "SQL脚本必须以SELECT语句开始" })
  }

  if (!upperScript.includes("FROM")) {
    return NextResponse.json({ success: false, message: "SQL脚本缺少FROM子句" })
  }

  const dangerousKeywords = ["DROP", "DELETE", "UPDATE", "INSERT", "TRUNCATE", "ALTER"]
  for (const keyword of dangerousKeywords) {
    if (upperScript.includes(keyword)) {
      return NextResponse.json({ success: false, message: `SQL脚本不允许包含${keyword}语句` })
    }
  }

  const mockResult = Math.floor(Math.random() * 200)

  return NextResponse.json({
    success: true,
    message: "SQL语法验证通过",
    result: mockResult,
    executionTime: Math.floor(Math.random() * 100 + 50),
  })
}
