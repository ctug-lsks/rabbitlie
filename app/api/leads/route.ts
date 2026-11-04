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

// Hàm phân tách 1 dòng CSV chuẩn xác, bảo toàn cột rỗng ,,
function splitCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

// Hàm nhận diện từng trường thông minh và chuẩn xác 100%
function parseLeadRow(cols: string[]): LeadItem | null {
  if (cols.length < 2) return null

  // 1. Tìm cột Email (bắt buộc có ký tự @)
  const emailIdx = cols.findIndex((c) => c.includes('@'))
  if (emailIdx === -1) return null

  const email = cols[emailIdx].replace(/^"|"$/g, '').trim()

  // 2. Tìm Thời gian: Cột 0 (có chứa dấu / hoặc -)
  const rawTimestamp = cols[0] ? cols[0].replace(/^"|"$/g, '').trim() : ''
  const timestamp = rawTimestamp

  // 3. Tìm Số điện thoại: Cột chứa số và bắt đầu bằng 0 hoặc +84
  const phoneCol = cols.find(
    (c, idx) =>
      idx !== emailIdx &&
      idx !== 0 &&
      /(?:\+84|0|\b\d{9,11}\b)/.test(c.replace(/['"\s]/g, ''))
  )
  const phone = phoneCol ? phoneCol.replace(/['"]/g, '').trim() : ''

  // 4. Tìm Mã voucher
  const voucherCol = cols.find(
    (c, idx) =>
      idx !== emailIdx &&
      idx !== 0 &&
      c !== phoneCol &&
      /BADBUNNY|VOUCHER|20/i.test(c)
  )
  const voucherCode = voucherCol ? voucherCol.replace(/^"|"$/g, '').trim() : 'BADBUNNY20'

  // 5. Tìm Họ và tên: Cột nằm ở vị trí 1 (nếu email ở vị trí 2)
  let name = ''
  if (emailIdx >= 2 && cols[1]) {
    const potentialName = cols[1].replace(/^"|"$/g, '').trim()
    if (
      potentialName &&
      potentialName !== email &&
      potentialName !== phone &&
      potentialName !== voucherCode &&
      !potentialName.toLowerCase().includes('họ và tên')
    ) {
      name = potentialName
    }
  }

  return {
    timestamp,
    name,
    email,
    phone,
    voucherCode,
    status: 'Chưa sử dụng',
  }
}

function parseSheetCSV(csvText: string) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length <= 1) return []

  const leads: LeadItem[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i])
    const lead = parseLeadRow(cols)
    if (lead) {
      leads.push(lead)
    }
  }

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

    // Gửi sang Google Sheet Webhook (đủ 5 trường)
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

  return NextResponse.json({
    leads: recentLeads,
    source: 'recent_cache',
  })
}
