import { NextResponse } from 'next/server'

// Bộ nhớ đệm tạm thời
let memoryLeads: Array<{
  timestamp: string
  email: string
  phone: string
  voucherCode: string
  status: string
}> = [
  {
    timestamp: '03/11/2026, 09:15:30',
    email: 'khachhang.demo@gmail.com',
    phone: '0901234567',
    voucherCode: 'BADBUNNY20',
    status: 'Chưa sử dụng',
  },
  {
    timestamp: '03/11/2026, 11:42:10',
    email: 'denimlover@yahoo.com',
    phone: '0987654321',
    voucherCode: 'BADBUNNY20',
    status: 'Đã sử dụng',
  },
  {
    timestamp: '03/11/2026, 13:05:45',
    email: 'rabbitlie.fan@gmail.com',
    phone: '0912345678',
    voucherCode: 'BADBUNNY20',
    status: 'Chưa sử dụng',
  },
]

const DEFAULT_GOOGLE_SHEET_URL =
  'https://script.google.com/macros/s/AKfycbzjt-PZKWK-JyILyILUaPInDGOgI8fNzW3ckjLpTGxmhpeKau8Exu4GgD0yzzBsndNicw/exec'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, phone, voucherCode = 'BADBUNNY20', customWebhookUrl } = body

    if (!email || !phone) {
      return NextResponse.json(
        { error: 'Email và số điện thoại là bắt buộc.' },
        { status: 400 }
      )
    }

    const timestamp = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    })

    const newLead = {
      timestamp,
      email: email.trim(),
      phone: phone.trim(),
      voucherCode,
      status: 'Chưa sử dụng',
    }

    memoryLeads.unshift(newLead)

    // Ưu tiên link truyền vào, sau đó đến env, và mặc định là Web App URL chính thức của bạn
    const googleSheetUrl =
      customWebhookUrl ||
      process.env.GOOGLE_SHEET_WEBAPP_URL ||
      DEFAULT_GOOGLE_SHEET_URL

    let sheetStatus = 'no_url'
    if (googleSheetUrl) {
      try {
        // Gửi sang Google Apps Script với redirect: follow và text/plain
        const res = await fetch(googleSheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(newLead),
          redirect: 'follow',
        })
        sheetStatus = res.ok ? 'success' : `status_${res.status}`
      } catch (err: any) {
        console.error('Lỗi kết nối Google Sheet:', err)
        sheetStatus = `error: ${err?.message || 'unknown'}`
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Lưu thông tin thành công',
      sheetStatus,
      lead: newLead,
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Không thể xử lý yêu cầu' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const customUrl = searchParams.get('url')
  const googleSheetUrl =
    customUrl || process.env.GOOGLE_SHEET_WEBAPP_URL || DEFAULT_GOOGLE_SHEET_URL

  if (googleSheetUrl) {
    try {
      const res = await fetch(googleSheetUrl, {
        method: 'GET',
        cache: 'no-store',
        redirect: 'follow',
      })
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.leads)) {
          return NextResponse.json({
            leads: data.leads,
            totalViews: data.totalViews || 0,
            source: 'google_sheet',
          })
        }
      }
    } catch (err) {
      console.warn('Không thể kéo trực tiếp từ Google Sheet, dùng bộ nhớ cục bộ:', err)
    }
  }

  return NextResponse.json({ leads: memoryLeads, source: 'local' })
}
