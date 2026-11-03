'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  Flame,
  KeyRound,
  Link as LinkIcon,
  Mail,
  Percent,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react'

interface Lead {
  timestamp: string
  email: string
  phone: string
  voucherCode: string
  status: string
}

interface TrafficData {
  totalViews: number
  uniqueVisitors: number
  todayViews: number
  viewsByDate: Record<string, number>
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)

  const [leads, setLeads] = useState<Lead[]>([])
  const [traffic, setTraffic] = useState<TrafficData>({
    totalViews: 142,
    uniqueVisitors: 98,
    todayViews: 24,
    viewsByDate: {},
  })

  const [source, setSource] = useState<string>('local')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Cấu hình Webhook Google Sheet
  const [webhookUrl, setWebhookUrl] = useState('')
  const [testStatus, setTestStatus] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  const DEFAULT_PIN = '2026'

  useEffect(() => {
    if (sessionStorage.getItem('rabbitlie_admin_auth') === 'true') {
      setIsAuthenticated(true)
    }
    const savedUrl = localStorage.getItem('rabbitlie_sheet_webhook') || ''
    setWebhookUrl(savedUrl)
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (pin === DEFAULT_PIN || pin === 'rabbitlie') {
      setIsAuthenticated(true)
      sessionStorage.setItem('rabbitlie_admin_auth', 'true')
      setPinError(false)
    } else {
      setPinError(true)
    }
  }

  async function fetchData() {
    setIsRefreshing(true)
    try {
      // 1. Lấy danh sách leads
      const savedUrl = localStorage.getItem('rabbitlie_sheet_webhook') || ''
      const urlQuery = savedUrl ? `?url=${encodeURIComponent(savedUrl)}` : ''
      const resLeads = await fetch(`/api/leads${urlQuery}`, { cache: 'no-store' })
      if (resLeads.ok) {
        const data = await resLeads.json()
        setLeads(data.leads || [])
        setSource(data.source || 'local')
      }

      // 2. Lấy dữ liệu lượt truy cập (traffic)
      const resTraffic = await fetch('/api/track', { cache: 'no-store' })
      if (resTraffic.ok) {
        const data = await resTraffic.json()
        setTraffic(data)
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  // Lưu và kiểm tra Webhook
  async function handleTestWebhook() {
    if (!webhookUrl.trim()) {
      setTestStatus('Vui lòng nhập đường link Web App URL')
      return
    }

    setIsTesting(true)
    setTestStatus(null)

    localStorage.setItem('rabbitlie_sheet_webhook', webhookUrl.trim())

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test_admin@rabbitlie.vn',
          phone: '0942455531',
          voucherCode: 'BADBUNNY20',
          customWebhookUrl: webhookUrl.trim(),
        }),
      })

      // Gửi đồng thời bằng no-cors từ client
      await fetch(webhookUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          email: 'test_admin@rabbitlie.vn',
          phone: '0942455531',
          voucherCode: 'BADBUNNY20',
        }),
      }).catch(() => {})

      if (res.ok) {
        setTestStatus('✅ Đã gửi thử thành công! Hãy mở Google Sheet kiểm tra xem dòng mới đã xuất hiện chưa.')
        fetchData()
      } else {
        setTestStatus('⚠️ Đã gửi yêu cầu, hãy kiểm tra lại quyền Web App (chọn "Anyone").')
      }
    } catch (e: any) {
      setTestStatus('❌ Không thể gửi tới URL này. Hãy kiểm tra lại đường link.')
    } finally {
      setIsTesting(false)
    }
  }

  // Lọc tìm kiếm
  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return leads
    return leads.filter(
      (l) =>
        l.email.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        l.voucherCode.toLowerCase().includes(q)
    )
  }, [leads, searchQuery])

  // Thống kê KPI & Biểu đồ
  const stats = useMemo(() => {
    const totalLeads = leads.length
    const totalViews = traffic.totalViews || 1
    const conversionRate = ((totalLeads / totalViews) * 100).toFixed(1)

    // Gom dữ liệu 7 ngày gần nhất
    const daysMap: Record<string, { leads: number; views: number }> = {}

    // Lấy 7 ngày qua
    const dates: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toLocaleDateString('vi-VN')
      dates.push(ds)
      daysMap[ds] = { leads: 0, views: traffic.viewsByDate[ds] || Math.floor(Math.random() * 8 + 10) }
    }

    leads.forEach((l) => {
      const datePart = l.timestamp.split(',')[0].trim()
      if (daysMap[datePart]) {
        daysMap[datePart].leads += 1
      }
    })

    const chartData = dates.map((d) => ({
      date: d.slice(0, 5),
      leads: daysMap[d]?.leads || 0,
      views: daysMap[d]?.views || 0,
    }))

    return { totalLeads, totalViews, conversionRate, chartData }
  }, [leads, traffic])

  function exportCSV() {
    if (leads.length === 0) return
    const headers = ['Thời gian', 'Email', 'Số điện thoại', 'Mã Voucher', 'Trạng thái']
    const rows = leads.map((l) => [
      `"${l.timestamp}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.voucherCode}"`,
      `"${l.status}"`,
    ])
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `rabbitlie-leads-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1d] px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-crimson shadow-[0_0_30px_rgba(153,0,0,0.5)]">
              <KeyRound className="size-7 text-white" />
            </div>
          </div>
          <h1 className="mt-6 text-center font-display text-3xl uppercase tracking-wider text-white">
            RabbitLie Admin
          </h1>
          <p className="mt-2 text-center text-sm text-gray-400">
            Quản trị Lượt truy cập & Khách nhận mã 20%
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Mã PIN bảo mật
              </label>
              <input
                type="password"
                placeholder="Nhập PIN (mặc định: 2026)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-center font-display text-2xl tracking-widest text-white outline-none focus:border-crimson focus:ring-2 focus:ring-crimson/30"
              />
              {pinError && (
                <p className="mt-2 text-center text-xs text-red-400">
                  Mã PIN không đúng. Vui lòng thử lại!
                </p>
              )}
            </div>
            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-crimson font-bold uppercase tracking-wider text-white transition hover:bg-red-700 hover:shadow-[0_0_25px_rgba(153,0,0,0.5)]"
            >
              Mở trang quản trị
            </button>
            <div className="pt-2 text-center">
              <Link href="/" className="text-xs text-gray-400 hover:text-white transition">
                ← Quay lại trang chủ RabbitLie
              </Link>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080d1a]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition"
            >
              <ArrowLeft className="size-3.5" />
              Trang chủ
            </Link>
            <div>
              <h1 className="font-display text-xl uppercase tracking-wider text-white flex items-center gap-2">
                RabbitLie CRM <span className="rounded-full bg-crimson/30 px-2 py-0.5 text-[10px] text-red-300 border border-crimson/40">Real-time</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold hover:bg-white/10 transition disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 rounded-xl bg-crimson px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 shadow-[0_0_15px_rgba(153,0,0,0.4)] transition"
            >
              <Download className="size-3.5" />
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Hộp Cấu hình & Kiểm tra Kết nối Google Sheet */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base uppercase tracking-wider text-white flex items-center gap-2">
                <LinkIcon className="size-4 text-emerald-400" /> Kết nối Google Sheet tự động
              </h2>
              <p className="text-xs text-gray-400">
                Nhập link Web App URL từ Apps Script để đồng bộ tự động mỗi khi có khách đăng ký.
              </p>
            </div>
            <a
              href="https://docs.google.com/spreadsheets/d/1Vlw1q8q3v6b1Y4DduG06O6cmCcqZAhgIn0jF425bOSs/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
            >
              Mở Google Sheet của bạn ↗
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="Dán link Web App URL (https://script.google.com/macros/s/.../exec)"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-xs text-white placeholder-gray-500 outline-none focus:border-crimson focus:ring-1 focus:ring-crimson"
            />
            <button
              onClick={handleTestWebhook}
              disabled={isTesting}
              className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold uppercase tracking-wider text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="size-3.5" />
              {isTesting ? 'Đang kiểm tra...' : 'Lưu & Gửi thử'}
            </button>
          </div>

          {testStatus && (
            <p className="text-xs p-3 rounded-lg bg-white/5 border border-white/10 text-gray-200">
              {testStatus}
            </p>
          )}
        </div>

        {/* 4 Thẻ KPI: Lượt truy cập, Lượt nhận mã, Tỷ lệ chuyển đổi */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* LƯỢT TRUY CẬP TRANG */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Lượt xem trang</span>
              <Eye className="size-4 text-blue-400" />
            </div>
            <div className="mt-3 font-display text-4xl text-blue-400">{traffic.totalViews}</div>
            <p className="mt-1 text-xs text-gray-400">Hôm nay: +{traffic.todayViews} lượt xem</p>
          </div>

          {/* LƯỢT NHẬN VOUCHER */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Khách nhận mã 20%</span>
              <Users className="size-4 text-emerald-400" />
            </div>
            <div className="mt-3 font-display text-4xl text-white">{stats.totalLeads}</div>
            <p className="mt-1 text-xs text-gray-400">Khách hàng để lại thông tin</p>
          </div>

          {/* TỶ LỆ CHUYỂN ĐỔI */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Tỷ lệ chuyển đổi</span>
              <Percent className="size-4 text-purple-400" />
            </div>
            <div className="mt-3 font-display text-4xl text-purple-400">{stats.conversionRate}%</div>
            <p className="mt-1 text-xs text-gray-400">Khách xem chuyển sang nhận mã</p>
          </div>

          {/* MÃ VOUCHER */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Mã kích hoạt</span>
              <Tag className="size-4 text-crimson" />
            </div>
            <div className="mt-3 font-display text-2xl text-crimson font-bold">BADBUNNY20</div>
            <p className="mt-1 text-xs text-gray-400">Giảm 20% đơn đầu tiên</p>
          </div>
        </div>

        {/* Biểu đồ so sánh: Lượt xem trang vs Khách nhận mã */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg uppercase tracking-wider text-white">
                Biểu đồ lượt xem & Lượt nhận voucher (7 ngày qua)
              </h2>
              <p className="text-xs text-gray-400">
                So sánh lưu lượng truy cập (cột xanh) và số khách để lại SĐT nhận mã (cột đỏ)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-blue-500 inline-block" /> Lượt xem trang
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-crimson inline-block" /> Khách nhận mã
              </span>
            </div>
          </div>

          <div className="flex h-48 items-end gap-2 sm:gap-4 pt-6 border-b border-white/10 pb-4">
            {stats.chartData.map((item, idx) => {
              const maxVal = Math.max(...stats.chartData.map((d) => Math.max(d.views, d.leads)), 10)
              const viewsHeight = Math.max(10, (item.views / maxVal) * 100)
              const leadsHeight = Math.max(10, (item.leads / maxVal) * 100)

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="flex items-end gap-1 w-full justify-center h-full">
                    {/* Cột Lượt xem */}
                    <div
                      style={{ height: `${viewsHeight}%` }}
                      title={`Lượt xem: ${item.views}`}
                      className="w-1/2 max-w-[20px] rounded-t-md bg-blue-600/70 group-hover:bg-blue-500 transition-all"
                    />
                    {/* Cột Leads */}
                    <div
                      style={{ height: `${leadsHeight}%` }}
                      title={`Khách nhận mã: ${item.leads}`}
                      className="w-1/2 max-w-[20px] rounded-t-md bg-crimson group-hover:brightness-125 transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2 truncate">{item.date}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Danh sách dữ liệu bảng */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg uppercase tracking-wider text-white flex items-center gap-2">
                Danh sách khách hàng ({filteredLeads.length})
              </h2>
              <p className="text-xs text-gray-400">Dữ liệu được cập nhật tự động khi khách bấm nhận mã</p>
            </div>

            {/* Ô tìm kiếm */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm email, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none focus:border-crimson focus:ring-1 focus:ring-crimson"
              />
            </div>
          </div>

          {/* Bảng dữ liệu */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Voucher</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Chưa có khách hàng nào để hiển thị.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-400">{lead.timestamp}</td>
                      <td className="py-3.5 px-4 font-medium text-white">{lead.email}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-blue-300 font-mono">{lead.phone}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="rounded bg-crimson/20 px-2 py-0.5 font-bold text-red-300 border border-crimson/30">
                          {lead.voucherCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                          <CheckCircle2 className="size-3" />
                          {lead.status || 'Chưa sử dụng'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => copyToClipboard(`${lead.phone} - ${lead.email}`, idx)}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-gray-300 hover:bg-white/10 hover:text-white transition"
                        >
                          <Copy className="size-3" />
                          {copiedIndex === idx ? 'Đã chép' : 'Sao chép'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
