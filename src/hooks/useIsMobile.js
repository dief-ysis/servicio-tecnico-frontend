import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint = 768) {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return {
    isMobile: width < breakpoint,
    isTablet: width >= breakpoint && width < 1024,
    isSmall: width < 480,
    width
  }
}