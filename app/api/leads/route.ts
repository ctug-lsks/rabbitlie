import { NextResponse } from 'next/server'

// Bộ nhớ đệm tạm thời (lưu trữ cục bộ cho bản thử nghiệm hoặc khi chưa có mạng)
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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, phone, voucherCode = 'BADBUNNY20' } = body

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

    // Nếu đã cấu hình link Webhook Google Sheet
    const googleSheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL

    if (googleSheetUrl) {
      try {
        await fetch(googleSheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLead),
        })
      } catch (err) {
        console.error('Lỗi khi gửi sang Google Sheet:', err)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Lưu thông tin thành công',
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

export async function GET() {
  const googleSheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL

  if (googleSheetUrl) {
    try {
      const res = await fetch(googleSheetUrl, { method: 'GET', cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.leads)) {
          return NextResponse.json({ leads: data.leads, source: 'google_sheet' })
        }
      }
    } catch (err) {
      console.warn('Không thể kéo dữ liệu từ Google Sheet, dùng bộ nhớ cục bộ:', err)
    }
  }

  return NextResponse.json({ leads: memoryLeads, source: 'local' })
}
