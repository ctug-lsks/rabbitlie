'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Gift } from 'lucide-react'

const VOUCHER_CODE = 'BADBUNNY20'

function getTimeLeft() {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  const diff = Math.max(0, end.getTime() - now.getTime())
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function useCountdown() {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null)
  useEffect(() => {
    setTime(getTimeLeft())
    const id = window.setInterval(() => setTime(getTimeLeft()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

const pad = (n: number | undefined) => (n === undefined ? '--' : String(n).padStart(2, '0'))

export function DiscountBanner() {
  const time = useCountdown()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [claimed, setClaimed] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Vui lòng nhập email hợp lệ.')
      return
    }
    if (!/^(0|\+84)\d{9,10}$/.test(phone.replace(/\s/g, ''))) {
      setError('Vui lòng nhập số điện thoại Việt Nam hợp lệ.')
      return
    }
    setError(null)
    setClaimed(true)
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(VOUCHER_CODE)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const units = [
    { label: 'Giờ', value: pad(time?.hours) },
    { label: 'Phút', value: pad(time?.minutes) },
    { label: 'Giây', value: pad(time?.seconds) },
  ]

  return (
    <section id="offer" aria-labelledby="offer-heading" className="scroll-mt-16 px-4 py-6 md:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-xl bg-crimson text-primary-foreground">
        <div className="pointer-events-none absolute inset-3 rounded-lg border-2 border-dashed border-primary-foreground/30" aria-hidden="true" />
        <div className="relative grid gap-10 p-8 md:grid-cols-2 md:p-14">
          <div className="flex flex-col gap-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-denim-deep px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              <Gift className="size-3.5" aria-hidden="true" />
              Chỉ cho khách mới
            </span>
            <h2 id="offer-heading" className="font-display text-5xl uppercase leading-[1.15] tracking-wide md:text-7xl">
              Giảm 20%
              <br />
              Đơn đầu tiên
            </h2>
            <p className="max-w-sm text-primary-foreground/85">
              Để lại email & số điện thoại, RabbitLie gửi bạn voucher ngay trước khi hết giờ.
            </p>
            <div className="flex gap-3" role="timer" aria-label="Ưu đãi kết thúc lúc nửa đêm nay">
              {units.map((u) => (
                <div key={u.label} className="flex w-20 flex-col items-center rounded-md bg-denim-deep py-3">
                  <span className="font-display text-4xl tabular-nums">{u.value}</span>
                  <span className="text-[10px] uppercase tracking-widest text-primary-foreground/70">{u.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            {claimed ? (
              <div className="w-full rounded-lg bg-background p-6 text-foreground md:p-8" role="status">
                <p className="text-sm font-semibold uppercase tracking-widest text-crimson">Thành công</p>
                <p className="mt-2 font-display text-3xl uppercase text-denim-deep">Mã voucher của bạn</p>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-md border-2 border-dashed border-crimson bg-card px-4 py-3">
                  <span className="font-display text-3xl tracking-widest text-crimson">{VOUCHER_CODE}</span>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="inline-flex items-center gap-1.5 rounded-md bg-denim-deep px-3 py-2 text-xs font-bold uppercase text-background hover:bg-crimson"
                  >
                    {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                    {copied ? 'Đã chép' : 'Sao chép'}
                  </button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Nhập mã khi thanh toán. Chỉ áp dụng cho đơn hàng đầu tiên.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-4 rounded-lg bg-background p-6 text-foreground md:p-8">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="offer-email" className="text-sm font-semibold uppercase tracking-wide text-denim-deep">
                    Email
                  </label>
                  <input
                    id="offer-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="h-12 rounded-md border border-input bg-card px-4 outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-crimson focus:ring-2 focus:ring-crimson/20"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="offer-phone" className="text-sm font-semibold uppercase tracking-wide text-denim-deep">
                    Số điện thoại
                  </label>
                  <input
                    id="offer-phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09xx xxx xxx"
                    className="h-12 rounded-md border border-input bg-card px-4 outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-crimson focus:ring-2 focus:ring-crimson/20"
                  />
                </div>
                {error && (
                  <p className="text-sm font-medium text-destructive" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="mt-1 h-12 rounded-md bg-denim-deep text-sm font-bold uppercase tracking-wide text-background transition-all hover:bg-crimson hover:shadow-[0_0_28px_rgba(153,0,0,0.45)]"
                >
                  Nhận voucher 20%
                </button>
                <p className="text-xs text-muted-foreground">Không spam. Chỉ có drop mới, deal hời & bad attitude.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
