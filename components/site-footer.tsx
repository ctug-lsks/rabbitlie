import { MapPin, Phone } from 'lucide-react'
import { BrandLogo } from './brand-logo'
import { FacebookIcon, TikTokIcon } from './social-icons'

export function SiteFooter() {
  return (
    <footer className="bg-denim-deep text-background">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-16 md:px-8">
        <p className="font-display text-[18vw] uppercase leading-[0.8] text-background/10 md:text-[11rem]" aria-hidden="true">
          RabbitLie
        </p>

        <div className="mt-10 grid gap-10 md:grid-cols-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <BrandLogo size={56} />
              <span className="font-display text-2xl uppercase tracking-wide">
                Rabbit<span className="text-crimson">Lie</span>
              </span>
            </div>
            <p className="max-w-xs text-sm text-background/70">
              Old Denim. Bad Attitude. Túi denim tái chế thủ công tại Sài Gòn.
            </p>
          </div>

          <address className="flex flex-col gap-3 not-italic">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-crimson">Liên hệ</h2>
            <p className="flex items-start gap-2 text-sm text-background/85">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              669 Đỗ Mười, P. Linh Xuân, TP.HCM
            </p>
            <a href="tel:0942455531" className="flex items-center gap-2 text-sm text-background/85 hover:text-background">
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              Hotline: 0942 455 531
            </a>
          </address>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-crimson">Theo dõi RabbitLie</h2>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/rabbitliekhongbietlie"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="RabbitLie trên Facebook"
                className="flex size-11 items-center justify-center rounded-full border border-background/20 transition-all hover:border-crimson hover:bg-crimson"
              >
                <FacebookIcon className="size-5" />
              </a>
              <a
                href="https://www.tiktok.com/@rabbitliekhongbietlie"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="RabbitLie trên TikTok"
                className="flex size-11 items-center justify-center rounded-full border border-background/20 transition-all hover:border-crimson hover:bg-crimson"
              >
                <TikTokIcon className="size-5" />
              </a>
            </div>
            <p className="text-sm text-background/70">@rabbitliekhongbietlie</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-background/15 pt-6 text-xs text-background/60 sm:flex-row sm:justify-between items-center">
          <p>&copy; {new Date().getFullYear()} RabbitLie. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-4">
            <p>Làm từ 100% denim được giải cứu.</p>
            <a href="/admin" className="text-background/40 hover:text-background/80 transition underline text-[11px]">
              Quản trị CRM
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
