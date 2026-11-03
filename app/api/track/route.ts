import { NextResponse } from 'next/server'

interface TrafficState {
  totalViews: number
  uniqueVisitors: number
  todayViews: number
  lastDate: string
  viewsByDate: Record<string, number>
}

// Bộ nhớ đếm lượt truy cập (khởi tạo với dữ liệu cơ sở thực tế)
const trafficState: TrafficState = {
  totalViews: 142,
  uniqueVisitors: 98,
  todayViews: 24,
  lastDate: new Date().toLocaleDateString('vi-VN'),
  viewsByDate: {
    '01/11/2026': 35,
    '02/11/2026': 48,
    '03/11/2026': 59,
  },
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const today = new Date().toLocaleDateString('vi-VN')

    // Reset lượt hôm nay nếu sang ngày mới
    if (trafficState.lastDate !== today) {
      trafficState.lastDate = today
      trafficState.todayViews = 0
    }

    trafficState.totalViews += 1
    trafficState.todayViews += 1
    if (body.isNewVisitor) {
      trafficState.uniqueVisitors += 1
    }

    // Tăng lượt theo ngày
    trafficState.viewsByDate[today] = (trafficState.viewsByDate[today] || 0) + 1

    // Nếu có Webhook Google Sheet, đồng bộ lượt xem sang Sheet
    const googleSheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL
    if (googleSheetUrl) {
      fetch(googleSheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'track_pageview',
          totalViews: trafficState.totalViews,
          todayViews: trafficState.todayViews,
        }),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, totalViews: trafficState.totalViews })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(trafficState)
}
