import { useEffect } from 'react'

import { useRouter } from 'next/router'

declare global {
  interface Window {
    _paq?: unknown[]
  }
}

const useMatomoTracker = () => {
  const router = useRouter()

  useEffect(() => {
    router.events.on('routeChangeComplete', () => {
      console.log(`useMatomoTracker router.pathname: ${router.pathname}`)
      // const shortPath = router.pathname.split('/').slice(0, 3).join('/')
      const shortLocation = window.location.pathname
        .split('/')
        .slice(0, 3)
        .join('/')
      console.log(`useMatomoTracker router.pathname: ${router.pathname}`)
      console.log(`useMatomoTracker shortLocation: ${shortLocation}`)
      // console.log(`useMatomoTracker: `, router.pathname /* router.events */)

      if (window._paq) {
        // window._paq.push(['setCustomUrl', window.location.pathname.substr(1)])
        // window._paq.push(['trackPageView'])
        // window._paq.push(['setCustomUrl', 'shortLocation'])
        // window._paq.push(['trackPageView'])
      }
    })
  }, [router.events])
}

export default useMatomoTracker
