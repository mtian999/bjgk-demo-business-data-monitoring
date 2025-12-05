import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { script } = await request.json()

  if (!script || typeof script !== "string") {
    return NextResponse.json({ success: false, message: "JS脚本不能为空" })
  }

  await new Promise((resolve) => setTimeout(resolve, 300))

  const dangerousPatterns = [
    /eval\s*\(/,
    /Function\s*\(/,
    /require\s*\(/,
    /import\s+/,
    /process\./,
    /child_process/,
    /fs\./,
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(script)) {
      return NextResponse.json({ success: false, message: `JS脚本包含不安全的代码模式` })
    }
  }

  if (!script.includes("return")) {
    return NextResponse.json({ success: false, message: "JS脚本必须包含return语句返回数值结果" })
  }

  const mockResult = Math.floor(Math.random() * 100)

  return NextResponse.json({
    success: true,
    message: "JS脚本验证通过",
    result: mockResult,
    executionTime: Math.floor(Math.random() * 50 + 20),
  })
}
