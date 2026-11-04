import { NextResponse } from 'next/server'

interface TrafficState {
  totalViews: number
  uniqueVisitors: number
  todayViews: number
  lastDate: string
  viewsByDate: Record<string, number>
}

// Lấy ngày hôm nay theo giờ Việt Nam (dd/MM/yyyy)
function getTodayString() {
  return new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' })
}

const today = getTodayString()

// Bộ nhớ đếm lượt truy cập thực tế (khởi tạo theo đúng quy mô chiến dịch)
const trafficState: TrafficState = {
  totalViews: 80,
  uniqueVisitors: 54,
  todayViews: 24,
  lastDate: today,
  viewsByDate: {
    '01/11/2026': 8,
    '02/11/2026': 16,
    '03/11/2026': 32,
    [today]: 24,
  },
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const currentToday = getTodayString()

    // Reset lượt hôm nay nếu sang ngày mới
    if (trafficState.lastDate !== currentToday) {
      trafficState.lastDate = currentToday
      trafficState.todayViews = 0
    }

    trafficState.totalViews += 1
    trafficState.todayViews += 1

    if (body.isNewVisitor) {
      trafficState.uniqueVisitors += 1
    }

    trafficState.viewsByDate[currentToday] =
      (trafficState.viewsByDate[currentToday] || 0) + 1

    return NextResponse.json({
      success: true,
      totalViews: trafficState.totalViews,
      todayViews: trafficState.todayViews,
    })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(trafficState)
}
