'use client'

import { useEffect } from 'react'

export default function ViewportMeta() {
  useEffect(() => {
    // Set viewport meta tag to prevent zoom on input focus
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'viewport'
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      document.getElementsByTagName('head')[0].appendChild(meta)
    }
  }, [])

  return null
}

