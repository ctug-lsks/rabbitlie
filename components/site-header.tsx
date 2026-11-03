'use client'

import { useState } from 'react'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { BrandLogo } from './brand-logo'
import { useCart } from './cart-context'

const links = [
  { href: '#home', label: 'Trang chủ' },
  { href: '#collection', label: 'Bộ sưu tập' },
  { href: '#story', label: 'Câu chuyện' },
  { href: '#feedback', label: 'Đánh giá' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { count } = useCart()

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <a href="#home" className="group flex items-center gap-2" aria-label="RabbitLie - Trang chủ">
          <BrandLogo size={40} className="transition-transform group-hover:-rotate-12" />
          <span className="font-display text-2xl uppercase tracking-wide text-denim-deep">
            Rabbit<span className="text-crimson">Lie</span>
          </span>
        </a>

        <nav aria-label="Điều hướng chính" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative text-sm font-medium uppercase tracking-wider text-denim transition-colors hover:text-crimson after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-crimson after:transition-all hover:after:w-full"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#offer"
            className="relative flex items-center gap-2 rounded-full border border-denim-deep/15 bg-card py-1.5 pl-2 pr-3 transition-colors hover:border-crimson"
            aria-label={`Giỏ hàng, ${count} sản phẩm. Nhận ưu đãi 20%`}
          >
            <span className="relative">
              <ShoppingBag className="size-5 text-denim-deep" aria-hidden="true" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-denim-deep text-[10px] font-bold text-background">
                  {count}
                </span>
              )}
            </span>
            <span className="rounded-full bg-crimson px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
              Giảm 20%
            </span>
          </a>

          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-md text-denim-deep md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border bg-background md:hidden">
          <ul className="flex flex-col px-4 py-2">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-display text-xl uppercase tracking-wide text-denim-deep hover:text-crimson"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
