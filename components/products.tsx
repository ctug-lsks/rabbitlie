'use client'

import Image from 'next/image'
import { Check, Recycle, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { useCart } from './cart-context'

type Category = 'all' | 'shoulder' | 'crossbody' | 'tote'

const categories: { id: Category; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'shoulder', label: 'Túi đeo vai' },
  { id: 'crossbody', label: 'Túi đeo chéo' },
  { id: 'tote', label: 'Túi tote' },
]

const products = [
  {
    id: 'hobo',
    name: 'Túi Hobo Denim Nhiều Ngăn',
    description: 'Dáng hobo rộng rãi, 2 túi hộp hai bên, ngăn khoá kéo bên trong. Vừa ví, điện thoại, bình nước.',
    price: 529000,
    image: '/images/bag-hobo.jpg',
    category: 'shoulder',
    tag: 'Bán chạy',
  },
  {
    id: 'bucket',
    name: 'Túi Bucket Dây Rút',
    description: 'Dáng bucket xinh xắn với dây rút điều chỉnh, quai đeo vai dài, logo thêu RabbitLie.',
    price: 399000,
    image: '/images/bag-bucket.png',
    category: 'shoulder',
    tag: 'Mới',
  },
  {
    id: 'messenger',
    name: 'Túi Messenger Patchwork',
    description: 'Ghép từ nhiều mảnh denim khác màu wash, nắp gập vuông vức, quai bản to đeo chéo.',
    price: 489000,
    image: '/images/bag-messenger.jpg',
    category: 'crossbody',
    tag: 'Độc bản',
  },
  {
    id: 'tote',
    name: 'Túi Tote Túi Quần Jeans',
    description: 'Giữ nguyên túi sau quần jeans làm ngăn ngoài, chỉ đỏ nổi bật. Vừa laptop 14 inch.',
    price: 459000,
    image: '/images/bag-tote.png',
    category: 'tote',
    tag: null,
  },
  {
    id: 'mini',
    name: 'Túi Mini Đeo Chéo',
    description: 'Nhỏ gọn đựng điện thoại, son, chìa khoá. Màu indigo đậm, viền tua rua cá tính.',
    price: 299000,
    image: '/images/bag-mini.png',
    category: 'crossbody',
    tag: null,
  },
  {
    id: 'baguette',
    name: 'Túi Baguette Y2K',
    description: 'Dáng baguette kẹp nách phong cách Y2K, giữ nguyên cạp quần và nút jeans kim loại.',
    price: 359000,
    image: '/images/bag-baguette.png',
    category: 'shoulder',
    tag: null,
  },
] satisfies {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: Exclude<Category, 'all'>
  tag: string | null
}[]

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

export function Products() {
  const { addItem } = useCart()
  const [added, setAdded] = useState<string | null>(null)
  const [filter, setFilter] = useState<Category>('all')

  const visible = filter === 'all' ? products : products.filter((p) => p.category === filter)

  function handleQuickBuy(id: string, name: string) {
    addItem(name)
    setAdded(id)
    window.setTimeout(() => setAdded((current) => (current === id ? null : current)), 1800)
  }

  return (
    <section id="collection" aria-labelledby="collection-heading" className="scroll-mt-16 bg-denim-deep py-20 text-background md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-background/70">Drop 07 — Số lượng có hạn</p>
            <h2 id="collection-heading" className="font-display text-4xl uppercase leading-[1.15] tracking-wide md:text-6xl">
              Bộ sưu tập túi
            </h2>
          </div>
          <p className="max-w-sm text-background/70">
            Mỗi dáng túi một cá tính. Mỗi chiếc chỉ có một — hết là hết, không sản xuất lại.
          </p>
        </div>

        <div role="group" aria-label="Lọc theo kiểu túi" className="mb-8 flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = filter === c.id
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(c.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                  active
                    ? 'border-crimson bg-crimson text-primary-foreground'
                    : 'border-background/25 text-background/80 hover:border-background hover:text-background'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => {
            const isAdded = added === product.id
            return (
              <li
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-lg bg-background text-foreground transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={`object-cover transition-transform duration-500 ${
                      product.id === 'hobo'
                        ? 'origin-top-left scale-[2.02] group-hover:scale-[2.1]'
                        : 'group-hover:scale-105'
                    }`}
                  />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-denim-deep px-3 py-1 text-xs font-semibold uppercase tracking-wide text-background">
                    <Recycle className="size-3.5" aria-hidden="true" />
                    Denim tái chế
                  </span>
                  {product.tag && (
                    <span className="absolute right-3 top-3 rounded-full bg-crimson px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                      {product.tag}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="font-display text-2xl uppercase leading-snug tracking-wide text-denim-deep">{product.name}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-border pt-4">
                    <div className="flex flex-col">
                      <span className="font-display text-2xl text-crimson">{vnd.format(product.price)}</span>
                      <span className="text-xs text-muted-foreground">
                        {vnd.format(Math.round(product.price * 0.8))} với mã đơn đầu
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickBuy(product.id, product.name)}
                      aria-label={`Mua nhanh ${product.name}`}
                      className="inline-flex shrink-0 items-center gap-2 rounded-md bg-denim-deep px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-background transition-all hover:bg-crimson hover:shadow-[0_0_20px_rgba(153,0,0,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
                    >
                      {isAdded ? <Check className="size-4" aria-hidden="true" /> : <ShoppingBag className="size-4" aria-hidden="true" />}
                      {isAdded ? 'Đã thêm' : 'Mua ngay'}
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        <p className="sr-only" aria-live="polite">
          {added ? 'Đã thêm sản phẩm vào giỏ hàng' : ''}
        </p>
      </div>
    </section>
  )
}
