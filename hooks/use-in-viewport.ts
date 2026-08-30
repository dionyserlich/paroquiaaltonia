"use client"

import { useEffect, useRef, useState } from "react"

// Usado pra só animar a chama das velas realmente visíveis na tela —
// importante em celulares mais fracos quando a listagem tem várias velas
// ao mesmo tempo.
export function useInViewport<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      rootMargin: "50px",
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, isInView }
}
