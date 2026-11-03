'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Copy,
  Download,
  Filter,
  Flame,
  KeyRound,
  Mail,
  Phone,
  RefreshCw,
  Search,
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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)

  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<string>('local')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const DEFAULT_PIN = '2026'

  // Kiểm tra lưu phiên đăng nhập
  useEffect(() => {
    if (sessionStorage.getItem('rabbitlie_admin_auth') === 'true') {
      setIsAuthenticated(true)
    }
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

  async function fetchLeads() {
    setIsRefreshing(true)
    try {
      const res = await fetch('/api/leads', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads || [])
        setSource(data.source || 'local')
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads()
    }
  }, [isAuthenticated])

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

  // Thống kê KPI
  const stats = useMemo(() => {
    const total = leads.length
    const todayStr = new Date().toLocaleDateString('vi-VN')
    const todayCount = leads.filter((l) => l.timestamp.includes(todayStr) || l.timestamp.includes('03/11/2026')).length
    const gmailCount = leads.filter((l) => l.email.toLowerCase().includes('@gmail.com')).length
    const gmailPercent = total > 0 ? Math.round((gmailCount / total) * 100) : 0

    // Gom dữ liệu theo ngày cho biểu đồ
    const daysMap: Record<string, number> = {}
    leads.forEach((l) => {
      const datePart = l.timestamp.split(',')[0] || l.timestamp.slice(0, 10)
      daysMap[datePart] = (daysMap[datePart] || 0) + 1
    })

    const chartData = Object.entries(daysMap)
      .slice(-7)
      .map(([date, count]) => ({ date, count }))

    return { total, todayCount, gmailPercent, chartData }
  }, [leads])

  // Xuất file CSV
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
    link.setAttribute('download', `rabbitlie-voucher-leads-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  // Màn hình khoá PIN
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
            Trang quản lý khách hàng nhận mã giảm 20%
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
                RabbitLie CRM <span className="rounded-full bg-crimson/30 px-2 py-0.5 text-[10px] text-red-300 border border-crimson/40">Voucher 20%</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchLeads}
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
        {/* Banner nguồn dữ liệu */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="size-3 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-sm">
              <span className="text-gray-400">Nguồn dữ liệu: </span>
              <span className="font-semibold text-emerald-300">
                {source === 'google_sheet' ? 'Đã liên kết Google Sheet trực tiếp' : 'Dữ liệu cục bộ & Sẵn sàng nhận Webhook Google Sheet'}
              </span>
            </div>
          </div>
          <a
            href="https://docs.google.com/spreadsheets/d/1Vlw1q8q3v6b1Y4DduG06O6cmCcqZAhgIn0jF425bOSs/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
          >
            Mở Google Sheet liên kết ↗
          </a>
        </div>

        {/* 4 Thẻ KPI */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Tổng lượt nhận mã</span>
              <Users className="size-4 text-blue-400" />
            </div>
            <div className="mt-3 font-display text-4xl text-white">{stats.total}</div>
            <p className="mt-1 text-xs text-gray-400">Khách hàng để lại thông tin</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Hôm nay</span>
              <Flame className="size-4 text-orange-400" />
            </div>
            <div className="mt-3 font-display text-4xl text-orange-400">+{stats.todayCount}</div>
            <p className="mt-1 text-xs text-gray-400">Lượt đăng ký mới</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Tỷ lệ Gmail</span>
              <Mail className="size-4 text-emerald-400" />
            </div>
            <div className="mt-3 font-display text-4xl text-emerald-400">{stats.gmailPercent}%</div>
            <p className="mt-1 text-xs text-gray-400">Email chuẩn Gmail</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Voucher phát hành</span>
              <Tag className="size-4 text-crimson" />
            </div>
            <div className="mt-3 font-display text-2xl text-crimson font-bold">BADBUNNY20</div>
            <p className="mt-1 text-xs text-gray-400">Giảm 20% đơn đầu tiên</p>
          </div>
        </div>

        {/* Biểu đồ số lượng đăng ký */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-lg uppercase tracking-wider text-white">
                Biểu đồ số lượt nhận mã theo thời gian
              </h2>
              <p className="text-xs text-gray-400">Thống kê lưu lượng quan tâm chiến dịch voucher</p>
            </div>
            <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-gray-400 flex items-center gap-1.5 border border-white/5">
              <Calendar className="size-3.5" /> 7 ngày gần nhất
            </span>
          </div>

          {stats.chartData.length > 0 ? (
            <div className="flex h-44 items-end gap-3 pt-6 border-b border-white/10 pb-4">
              {stats.chartData.map((item, idx) => {
                const max = Math.max(...stats.chartData.map((d) => d.count), 5)
                const heightPercent = Math.max(15, (item.count / max) * 100)
                return (
                  <div key={idx} className="group flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs font-bold text-gray-300 opacity-80 group-hover:opacity-100 group-hover:text-crimson transition">
                      {item.count}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-blue-900 via-denim-deep to-crimson transition-all duration-300 group-hover:brightness-125"
                    />
                    <span className="text-[11px] text-gray-400 truncate max-w-full">{item.date}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex h-36 items-center justify-center text-sm text-gray-500">
              Chưa có đủ dữ liệu theo ngày
            </div>
          )}
        </div>

        {/* Danh sách dữ liệu bảng */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg uppercase tracking-wider text-white flex items-center gap-2">
                Danh sách chi tiết ({filteredLeads.length})
              </h2>
              <p className="text-xs text-gray-400">Toàn bộ khách hàng đã bấm nhận mã voucher 20%</p>
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
                      Không tìm thấy khách hàng nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-400">{lead.timestamp}</td>
                      <td className="py-3.5 px-4 font-medium text-white">{lead.email}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-blue-300">{lead.phone}</td>
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
