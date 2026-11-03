import Image from 'next/image'
import { ArrowRight, Sparkles, Star, X } from 'lucide-react'

const marqueeWords = ['Old denim', 'Bad attitude', '100% denim tái chế', 'Thủ công 1-of-1', 'Không cái nào giống cái nào', 'Không dùng vải mới']

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden grain">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-2 md:gap-12 md:px-8 md:pb-24 md:pt-16">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-denim-deep px-3 py-1 text-xs font-semibold uppercase tracking-widest text-background">
            <Sparkles className="size-3.5 text-crimson" aria-hidden="true" />
            Tái chế tại Sài Gòn
          </span>

          <h1 className="font-display text-6xl uppercase leading-[1.15] tracking-wide text-denim-deep text-balance sm:text-7xl lg:text-8xl">
            Old Denim.
            <br />
            <span className="text-crimson">Bad Attitude.</span>
          </h1>

          <p className="max-w-md text-lg leading-relaxed text-muted-foreground text-pretty">
            Túi denim thủ công độc bản, tái chế từ những chiếc quần jeans cũ. Thời trang bền vững, chất riêng không đụng hàng.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#offer"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-crimson px-6 py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-[0_0_0_0_rgba(153,0,0,0)] transition-all duration-300 hover:bg-crimson-deep hover:shadow-[0_0_32px_4px_rgba(153,0,0,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
            >
              Nhận ưu đãi 20% cho lần đầu
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>
            <a
              href="#collection"
              className="inline-flex items-center justify-center rounded-md border-2 border-denim-deep px-6 py-[14px] text-sm font-bold uppercase tracking-wide text-denim-deep transition-colors hover:bg-denim-deep hover:text-background"
            >
              Xem bộ sưu tập
            </a>
          </div>

          <dl className="mt-4 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Quần jeans cứu</dt>
              <dd className="font-display text-3xl text-denim-deep">2.400+</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Thiết kế</dt>
              <dd className="font-display text-3xl text-denim-deep">1-of-1</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Đánh giá</dt>
              <dd className="flex items-center gap-1 font-display text-3xl text-denim-deep">
                4.9
                <Star className="size-5 fill-crimson text-crimson" aria-label="sao" />
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          <div className="absolute -left-3 -top-3 h-full w-full rounded-lg stitch-border" aria-hidden="true" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-denim">
            <Image
              src="/images/hero.png"
              alt="Người mẫu đeo túi denim patchwork RabbitLie bên bức tường bê tông"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 right-4 rotate-[-4deg] rounded-md bg-crimson px-4 py-2 font-display text-xl uppercase tracking-wide text-primary-foreground shadow-lg md:-right-4">
            -20% đơn đầu tiên
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-y-2 border-denim-deep bg-denim-deep py-3 text-background" aria-hidden="true">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap font-display text-lg uppercase tracking-widest">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-8">
              {marqueeWords.map((word) => (
                <span key={word} className="flex items-center gap-8">
                  {word}
                  <X className="size-5 text-crimson" strokeWidth={3} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
