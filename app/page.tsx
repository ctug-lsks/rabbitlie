import { CartProvider } from '@/components/cart-context'
import { DiscountBanner } from '@/components/discount-banner'
import { Hero } from '@/components/hero'
import { Products } from '@/components/products'
import { Reviews } from '@/components/reviews'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Story } from '@/components/story'
import { ValueProps } from '@/components/value-props'

export default function Page() {
  return (
    <CartProvider>
      <SiteHeader />
      <main>
        <Hero />
        <ValueProps />
        <Products />
        <Story />
        <DiscountBanner />
        <Reviews />
      </main>
      <SiteFooter />
    </CartProvider>
  )
}
