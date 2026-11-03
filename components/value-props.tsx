import { Leaf, Recycle, Scissors } from 'lucide-react'

const values = [
  {
    icon: Recycle,
    title: '100% Denim tái chế',
    body: 'Mỗi chiếc túi được cắt từ quần jeans cũ được giải cứu khỏi đống đồ si và bãi rác. Không dùng một mét vải mới nào.',
  },
  {
    icon: Scissors,
    title: 'Thủ công & độc bản 1-of-1',
    body: 'Màu wash, vết rách, túi quần khác nhau nên không có hai chiếc túi nào giống hệt. Chiếc của bạn là duy nhất.',
  },
  {
    icon: Leaf,
    title: 'Thời trang xanh & bền vững',
    body: 'Cứu một chiếc quần jeans giúp tiết kiệm ~7.500 lít nước. Mặc đẹp, sống xanh, flex mạnh hơn.',
  },
]

export function ValueProps() {
  return (
    <section aria-labelledby="values-heading" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 id="values-heading" className="font-display text-4xl uppercase leading-[1.15] tracking-wide text-denim-deep md:text-5xl text-balance">
          Vì sao đồ <span className="text-crimson">tái chế</span> lại chất hơn
        </h2>
        <p className="max-w-sm text-muted-foreground">
          Fast fashion đã lỗi thời. Chiếc quần jeans cũ biến thành món phụ kiện chất lừ? Quá hợp lý.
        </p>
      </div>

      <ul className="grid gap-5 md:grid-cols-3">
        {values.map(({ icon: Icon, title, body }, i) => (
          <li
            key={title}
            className="group relative flex flex-col gap-4 rounded-lg border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-denim-deep hover:shadow-[6px_6px_0_0_var(--denim-deep)]"
          >
            <span className="absolute right-6 top-6 font-display text-5xl text-muted" aria-hidden="true">
              0{i + 1}
            </span>
            <span className="flex size-12 items-center justify-center rounded-md bg-crimson text-primary-foreground transition-transform group-hover:rotate-6">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <h3 className="font-display text-2xl uppercase leading-snug tracking-wide text-denim-deep">{title}</h3>
            <p className="leading-relaxed text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
