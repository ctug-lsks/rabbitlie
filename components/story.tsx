import Image from 'next/image'

const steps = [
  { n: '01', title: 'Giải cứu', body: 'Lục tung các kiện đồ si và thu gom quần jeans cũ từ cộng đồng.' },
  { n: '02', title: 'Tháo rời', body: 'Tháo từng đường may, giữ lại túi quần, phân loại từng mảnh theo màu wash.' },
  { n: '03', title: 'Tái sinh', body: 'May tay thành chiếc túi hoàn toàn mới với đường chỉ đỏ đặc trưng.' },
]

export function Story() {
  return (
    <section id="story" aria-labelledby="story-heading" className="scroll-mt-16 mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
          <Image
            src="/images/story.png"
            alt="Đôi tay đang cắt và may quần jeans cũ tại xưởng RabbitLie"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-crimson">Câu chuyện tái chế</p>
          <h2 id="story-heading" className="font-display text-4xl uppercase leading-[1.15] tracking-wide text-denim-deep md:text-5xl text-balance">
            Chiếc quần jeans có quá khứ. Giờ nó có tương lai.
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            RabbitLie bắt đầu trong một căn phòng nhỏ ở Thủ Đức với chiếc máy may cũ và cả núi quần jeans không ai cần.
            Thỏ có thể &quot;lie&quot;, nhưng túi thì không — từng đường kim đều thật, từng vết sờn đều là một phần cá tính.
          </p>
          <ol className="flex flex-col gap-4">
            {steps.map((step) => (
              <li key={step.n} className="flex gap-4 rounded-md border border-border bg-card p-4">
                <span className="font-display text-3xl text-crimson">{step.n}</span>
                <div>
                  <h3 className="font-display text-xl uppercase leading-snug tracking-wide text-denim-deep">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
