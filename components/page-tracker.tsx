'use client'

import { useEffect } from 'react'

export function PageTracker() {
  useEffect(() => {
    // Tránh track nhiều lần trong cùng 1 lần render hoặc khi ở trang admin
    if (typeof window === 'undefined' || window.location.pathname.startsWith('/admin')) {
      return
    }

    // Tạo mã visitor ID nếu chưa có
    let visitorId = localStorage.getItem('rabbitlie_vid')
    let isNewVisitor = false
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
      localStorage.setItem('rabbitlie_vid', visitorId)
      isNewVisitor = true
    }

    // Gửi tín hiệu truy cập về server
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        isNewVisitor,
        path: window.location.pathname,
        referrer: document.referrer || 'direct',
      }),
    }).catch(() => {
      // Bỏ qua lỗi ngầm
    })
  }, [])

  return null
}
