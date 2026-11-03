import Image from 'next/image'

export function BrandLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/logo.png"
        alt=""
        width={size * 2}
        height={size * 2}
        className="size-full scale-[1.28] object-cover"
        priority
      />
    </span>
  )
}
