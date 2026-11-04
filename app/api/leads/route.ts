import { NextResponse } from 'next/server'

const GOOGLE_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1Vlw1q8q3v6b1Y4DduG06O6cmCcqZAhgIn0jF425bOSs/export?format=csv'

const DEFAULT_GOOGLE_SHEET_URL =
  'https://script.google.com/macros/s/AKfycbzjt-PZKWK-JyILyILUaPInDGOgI8fNzW3ckjLpTGxmhpeKau8Exu4GgD0yzzBsndNicw/exec'

interface LeadItem {
  timestamp: string
  name: string
  email: string
  phone: string
  voucherCode: string
  status: string
}

// Bộ nhớ tạm cục bộ
let recentLeads: Array<LeadItem> = []

// Hàm phân tích dữ liệu CSV lấy trực tiếp từ Google Sheet của bạn (tự động thích ứng cả 4 cột cũ và 5 cột mới)
function parseSheetCSV(csvText: string) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length <= 1) return []

  const leads: LeadItem[] = []
  // Bỏ qua dòng tiêu đề (i = 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    // Tách cột CSV hỗ trợ dấu ngoặc kép
    const regex = /(?:^|,)(?:"([^"]*)"|([^",]*))/g
    const cols: string[] = []
    let match
    while ((match = regex.exec(line)) !== null) {
      cols.push(match[1] !== undefined ? match[1] : match[2])
    }

    const timestamp = cols[0] ? cols[0].trim() : ''
    let name = ''
    let email = ''
    let phone = ''
    let voucherCode = 'BADBUNNY20'

    // Nhận diện tự động: Nếu cột 2 chứa @ thì là định dạng 4 cột cũ (không có Tên), nếu không thì là định dạng 5 cột mới
    if (cols.length >= 5 && cols[1] && !cols[1].includes('@')) {
      name = cols[1].trim()
      email = cols[2] ? cols[2].trim() : ''
      phone = cols[3] ? cols[3].trim() : ''
      voucherCode = cols[4] ? cols[4].trim() : 'BADBUNNY20'
    } else {
      // 4 cột cũ
      email = cols[1] ? cols[1].trim() : ''
      phone = cols[2] ? cols[2].trim() : ''
      voucherCode = cols[3] ? cols[3].trim() : 'BADBUNNY20'
    }

    // Chỉ lấy dòng có email hoặc số điện thoại hợp lệ
    if (email || phone) {
      leads.push({
        timestamp,
        name,
        email,
        phone,
        voucherCode,
        status: 'Chưa sử dụng',
      })
    }
  }

  // Đảo ngược để khách hàng mới nhất lên đầu danh sách
  return leads.reverse()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name = '', email, phone, voucherCode = 'BADBUNNY20' } = body

    if (!email || !phone) {
      return NextResponse.json(
        { error: 'Email và số điện thoại là bắt buộc.' },
        { status: 400 }
      )
    }

    const cleanName = (name || '').trim()
    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = phone.trim()

    // Chặn gửi trùng lặp nếu khách bấm đúp
    const isDuplicate = recentLeads.slice(0, 5).some(
      (l) => l.email.toLowerCase() === cleanEmail && l.phone === cleanPhone
    )

    if (isDuplicate) {
      return NextResponse.json({
        success: true,
        message: 'Thông tin đã được ghi nhận',
        sheetStatus: 'skipped_duplicate',
      })
    }

    const timestamp = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    })

    const newLead: LeadItem = {
      timestamp,
      name: cleanName,
      email: email.trim(),
      phone: cleanPhone,
      voucherCode,
      status: 'Chưa sử dụng',
    }

    recentLeads.unshift(newLead)

    // Gửi thẳng vào Google Sheet Webhook (đủ 5 trường: timestamp, name, email, phone, voucherCode)
    const googleSheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL || DEFAULT_GOOGLE_SHEET_URL

    let sheetStatus = 'no_url'
    if (googleSheetUrl) {
      try {
        const res = await fetch(googleSheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            timestamp,
            name: cleanName,
            email: email.trim(),
            phone: cleanPhone,
            voucherCode,
          }),
          redirect: 'follow',
        })
        sheetStatus = res.ok ? 'success' : `status_${res.status}`
      } catch (err: any) {
        console.error('Lỗi gửi sang Google Sheet:', err)
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

export async function GET() {
  try {
    // 1. KÉO DỮ LIỆU THỰC TẾ TRỰC TIẾP TỪ GOOGLE SHEET CỦA BẠN
    const res = await fetch(GOOGLE_SHEET_CSV_URL, {
      method: 'GET',
      cache: 'no-store',
    })

    if (res.ok) {
      const csvText = await res.text()
      const sheetLeads = parseSheetCSV(csvText)

      if (sheetLeads.length > 0) {
        return NextResponse.json({
          leads: sheetLeads,
          source: 'google_sheet_realtime',
        })
      }
    }
  } catch (err) {
    console.warn('Không thể đọc CSV Google Sheet, dùng bản tạm gần nhất:', err)
  }

  // 2. Dự phòng: Nếu Google Sheet tạm thời không kết nối được
  return NextResponse.json({
    leads: recentLeads,
    source: 'recent_cache',
  })
}
