'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'

const reviews = [
  {
    quote: 'Túi messenger patchwork quá cháy luôn. Đi phố Nguyễn Huệ bị hỏi mua ở đâu 3 lần.',
    name: 'Minh Anh',
    handle: '@minhanh.fits',
    platform: 'TikTok',
    product: 'Túi Messenger Patchwork',
  },
  {
    quote: 'Đựng vừa ví, bình nước và cả cá tính của mình. Hai túi hông tiện cực kỳ.',
    name: 'Khoa Trần',
    handle: '@khoa.thrifts',
    platform: 'Instagram',
    product: 'Túi Hobo Nhiều Ngăn',
  },
  {
    quote: 'Không ai có cái túi giống mình. 1-of-1 là thật chứ không lie nha. Đúng vibe nhân vật chính.',
    name: 'Linh Phạm',
    handle: '@linhlinh.y2k',
    platform: 'TikTok',
    product: 'Túi Bucket Dây Rút',
  },
  {
    quote: 'Vừa sống xanh vừa phối đồ nào cũng hợp? Chốt đơn. Đường chỉ đỏ là điểm cộng lớn.',
    name: 'Bảo Ngọc',
    handle: '@baongoc.ootd',
    platform: 'Instagram',
    product: 'Túi Messenger Patchwork',
  },
]

export function Reviews() {
  const trackRef = useRef<HTMLUListElement>(null)
  const [index, setIndex] = useState(0)
  const total = reviews.length

  function scrollToIndex(i: number) {
    const track = trackRef.current
    const slide = track?.children[i] as HTMLElement | undefined
    if (track && slide) track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' })
  }

  function go(dir: number) {
    const track = trackRef.current
    if (!track) return
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4
    const atStart = track.scrollLeft <= 4
    if (dir > 0 && atEnd) return scrollToIndex(0)
    if (dir < 0 && atStart) return scrollToIndex(total - 1)
    const slideWidth = (track.children[0] as HTMLElement | undefined)?.offsetWidth ?? track.clientWidth
    track.scrollBy({ left: dir * slideWidth, behavior: 'smooth' })
  }

  function handleScroll() {
    const track = trackRef.current
    const slideWidth = (track?.children[0] as HTMLElement | undefined)?.offsetWidth
    if (track && slideWidth) setIndex(Math.round(track.scrollLeft / slideWidth))
  }

  return (
    <section id="feedback" aria-labelledby="feedback-heading" className="scroll-mt-16 mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-crimson">Khách thật, review thật</p>
          <h2 id="feedback-heading" className="font-display text-4xl uppercase leading-[1.15] tracking-wide text-denim-deep md:text-6xl">
            Khách hàng nói gì
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tag RabbitLie <span className="font-semibold text-denim-deep">@rabbitliekhongbietlie</span> để được lên sóng nhé.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Đánh giá trước"
            className="flex size-12 items-center justify-center rounded-full border-2 border-denim-deep text-denim-deep transition-colors hover:bg-denim-deep hover:text-background"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Đánh giá tiếp theo"
            className="flex size-12 items-center justify-center rounded-full bg-crimson text-primary-foreground transition-all hover:bg-crimson-deep hover:shadow-[0_0_20px_rgba(153,0,0,0.45)]"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <div aria-roledescription="carousel" aria-label="Đánh giá của khách hàng">
        <ul
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reviews.map((r, i) => (
            <li
              key={r.handle}
              className="w-[88%] shrink-0 snap-start md:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
              aria-roledescription="slide"
              aria-label={`${i + 1} trên ${total}`}
            >
              <figure className="flex h-full flex-col gap-5 rounded-lg border border-border bg-card p-7">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5 text-crimson" aria-label="5 trên 5 sao">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="size-4 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                  <Quote className="size-8 text-muted" aria-hidden="true" />
                </div>
                <blockquote className="flex-1 text-lg font-medium leading-relaxed text-denim-deep text-pretty">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3 border-t border-dashed border-border pt-4">
                  <span className="flex size-10 items-center justify-center rounded-full bg-denim-deep font-display text-lg text-background">
                    {r.name.charAt(0)}
                  </span>
                  <div className="flex flex-1 flex-col">
                    <span className="font-semibold text-denim-deep">{r.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {r.handle} · {r.platform}
                    </span>
                  </div>
                  <span className="hidden rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-denim sm:inline">
                    {r.product}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex justify-center gap-2 md:hidden">
        {reviews.map((r, i) => (
          <button
            key={r.handle}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={`Xem đánh giá ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-crimson' : 'w-2 bg-border'}`}
          />
        ))}
      </div>
    </section>
  )
}
