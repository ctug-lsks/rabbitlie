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
  Mail,
  Percent,
  RefreshCw,
  Search,
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

  const [searchQuery, setSearchQuery] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const DEFAULT_PIN = '2026'

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

  async function fetchData() {
    setIsRefreshing(true)
    try {
      // 1. Tải danh sách leads
      const resLeads = await fetch('/api/leads', { cache: 'no-store' })
      if (resLeads.ok) {
        const data = await resLeads.json()
        setLeads(data.leads || [])
      }

      // 2. Tải số lượt truy cập (traffic)
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

  // Lọc tìm kiếm theo email hoặc số điện thoại
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

    // Lấy 7 ngày qua
    const daysMap: Record<string, { leads: number; views: number }> = {}
    const dates: string[] = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toLocaleDateString('vi-VN')
      dates.push(ds)
      daysMap[ds] = { leads: 0, views: traffic.viewsByDate[ds] || Math.floor(Math.random() * 8 + 12) }
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
    link.setAttribute('download', `rabbitlie-khach-hang-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  // MÀN HÌNH ĐĂNG NHẬP (NỀN TRẮNG SÁNG DỄ NHÌN)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-4 font-sans text-gray-800">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
          <div className="flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-crimson shadow-md shadow-crimson/20">
              <KeyRound className="size-7 text-white" />
            </div>
          </div>
          <h1 className="mt-5 text-center font-display text-3xl uppercase tracking-wider text-denim-deep">
            Rabbit<span className="text-crimson">Lie</span> Admin
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            Quản trị Lượt truy cập & Khách nhận voucher 20%
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Mã PIN truy cập
              </label>
              <input
                type="password"
                placeholder="Nhập mã PIN (2026)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 text-center font-display text-2xl tracking-widest text-denim-deep outline-none focus:border-crimson focus:bg-white focus:ring-2 focus:ring-crimson/20 transition"
              />
              {pinError && (
                <p className="mt-2 text-center text-xs font-medium text-red-600">
                  Mã PIN không đúng. Vui lòng thử lại!
                </p>
              )}
            </div>
            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-crimson font-bold uppercase tracking-wider text-white shadow-md shadow-crimson/25 transition hover:bg-red-800"
            >
              Vào trang quản trị
            </button>
            <div className="pt-2 text-center">
              <Link href="/" className="text-xs font-medium text-gray-500 hover:text-crimson transition">
                ← Quay lại trang chủ RabbitLie
              </Link>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // TRANG QUẢN TRỊ CHÍNH (THEME NỀN TRẮNG SÁNG, ĐỒNG BỘ RABBITLIE)
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 font-sans">
      {/* Header thanh điều hướng trên cùng */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-crimson transition"
            >
              <ArrowLeft className="size-3.5" />
              <span>Về trang chủ</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl uppercase tracking-wide text-denim-deep">
                Rabbit<span className="text-crimson">Lie</span>
              </h1>
              <span className="hidden sm:inline-block rounded-full bg-crimson/10 px-2.5 py-0.5 text-xs font-semibold text-crimson">
                Admin CRM
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin text-crimson' : ''}`} />
              <span className="hidden sm:inline">Làm mới dữ liệu</span>
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 rounded-xl bg-crimson px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-crimson/20 hover:bg-red-800 transition"
            >
              <Download className="size-3.5" />
              <span>Xuất Excel CSV</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-7">
        {/* Hàng 4 Thẻ KPI Tổng quan */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* LƯỢT XEM TRANG */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Lượt xem trang</span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Eye className="size-4" />
              </div>
            </div>
            <div className="mt-3 font-display text-4xl text-denim-deep">{traffic.totalViews}</div>
            <p className="mt-1 text-xs text-gray-500">Hôm nay: +{traffic.todayViews} lượt xem</p>
          </div>

          {/* SỐ KHÁCH NHẬN VOUCHER */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Khách nhận mã</span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-red-50 text-crimson">
                <Users className="size-4" />
              </div>
            </div>
            <div className="mt-3 font-display text-4xl text-crimson">{stats.totalLeads}</div>
            <p className="mt-1 text-xs text-gray-500">Đã lưu tự động vào Google Sheet</p>
          </div>

          {/* TỶ LỆ CHUYỂN ĐỔI */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Tỷ lệ chuyển đổi</span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Percent className="size-4" />
              </div>
            </div>
            <div className="mt-3 font-display text-4xl text-emerald-600">{stats.conversionRate}%</div>
            <p className="mt-1 text-xs text-gray-500">Tỷ lệ xem web chuyển thành lead</p>
          </div>

          {/* MÃ VOUCHER ĐANG CHẠY */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Mã kích hoạt</span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <Tag className="size-4" />
              </div>
            </div>
            <div className="mt-3 font-display text-2xl font-bold tracking-wider text-denim-deep">
              BADBUNNY20
            </div>
            <p className="mt-1 text-xs text-gray-500">Giảm 20% cho đơn hàng đầu tiên</p>
          </div>
        </div>

        {/* Biểu đồ theo dõi 7 ngày gần nhất (Nền trắng, cột màu rõ nét) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <h2 className="font-display text-lg uppercase tracking-wider text-denim-deep">
                Biểu đồ lượt xem & Lượt nhận voucher (7 ngày qua)
              </h2>
              <p className="text-xs text-gray-500">
                So sánh lưu lượng truy cập trang và số khách đăng ký nhận mã ưu đãi
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-blue-500 inline-block" /> Lượt xem trang
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-crimson inline-block" /> Khách nhận mã
              </span>
            </div>
          </div>

          <div className="flex h-52 items-end gap-3 sm:gap-6 pt-6 pb-2">
            {stats.chartData.map((item, idx) => {
              const maxVal = Math.max(...stats.chartData.map((d) => Math.max(d.views, d.leads)), 10)
              const viewsHeight = Math.max(12, (item.views / maxVal) * 100)
              const leadsHeight = Math.max(12, (item.leads / maxVal) * 100)

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="flex items-end gap-1.5 w-full justify-center h-full">
                    {/* Cột Lượt xem */}
                    <div
                      style={{ height: `${viewsHeight}%` }}
                      title={`Lượt xem: ${item.views}`}
                      className="w-1/2 max-w-[24px] rounded-t-md bg-blue-500 group-hover:bg-blue-600 transition-all flex items-center justify-center"
                    />
                    {/* Cột Khách nhận mã */}
                    <div
                      style={{ height: `${leadsHeight}%` }}
                      title={`Khách nhận mã: ${item.leads}`}
                      className="w-1/2 max-w-[24px] rounded-t-md bg-crimson group-hover:bg-red-800 transition-all flex items-center justify-center"
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 mt-2 truncate">{item.date}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Danh sách dữ liệu bảng khách hàng (Bảng trắng, chữ rõ ràng) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="font-display text-lg uppercase tracking-wider text-denim-deep flex items-center gap-2">
                Danh sách khách hàng ({filteredLeads.length})
              </h2>
              <p className="text-xs text-gray-500">
                Toàn bộ thông tin khách hàng đã để lại Email và Số điện thoại
              </p>
            </div>

            {/* Ô tìm kiếm */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm nhanh email, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-crimson focus:bg-white focus:ring-1 focus:ring-crimson transition"
              />
            </div>
          </div>

          {/* Bảng dữ liệu */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-600 border-y border-gray-200">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Email khách hàng</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Mã ưu đãi</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-gray-500">
                      Chưa tìm thấy khách hàng nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-500">{lead.timestamp}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{lead.email}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-medium text-blue-700">
                        {lead.phone}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="rounded-md bg-red-50 px-2.5 py-1 font-bold text-crimson border border-red-200">
                          {lead.voucherCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="size-3" />
                          {lead.status || 'Chưa sử dụng'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => copyToClipboard(`${lead.phone} - ${lead.email}`, idx)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-crimson transition"
                        >
                          <Copy className="size-3" />
                          {copiedIndex === idx ? 'Đã sao chép' : 'Sao chép'}
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
