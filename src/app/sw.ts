// src/sw.ts (or app/sw.ts for App Router)

import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist } from 'serwist'

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

// Make sure 'ServiceWorkerGlobalScope' is recognized by adding "webworker" to your tsconfig.json lib array
declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST, // This gets injected by Serwist at build time

  // These options were in next.config.js for next-pwa, but now go here:
  skipWaiting: true, // Activates new service worker version immediately
  clientsClaim: true, // Takes control of existing clients immediately
  navigationPreload: true, // Improves navigation performance

  // You can set `disableDevLogs: true` here for Serwist specific logs
  disableDevLogs: process.env.NODE_ENV === 'development' ? false : true, // Set to true for production

  // Define runtime caching strategies. defaultCache provides a good starting point.
  runtimeCaching: defaultCache,

  // You can add more specific runtime caching rules as needed, e.g., for APIs, images, etc.
  // runtimeCaching: [
  //   {
  //     urlPattern: ({ url }) => url.origin === self.location.origin,
  //     handler: 'StaleWhileRevalidate',
  //     options: {
  //       cacheName: 'static-assets-cache',
  //       expiration: {
  //         maxEntries: 50,
  //         maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
  //       },
  //     },
  //   },
  //   // Add more custom rules here
  // ],
})

serwist.addEventListeners() // Important: This line makes the service worker active
