'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const THIRD_PARTY_URL = 'https://app.quillplus.in/login?ref=jacobclasess' // <-- YOUR URL
const TAGLINE = 'Your perfection is our priority'

// Define the BeforeInstallPromptEvent type
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  prompt(): Promise<void>
}

export default function Home() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [wasHidden, setWasHidden] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [typedText, setTypedText] = useState('')
  const [typingComplete, setTypingComplete] = useState(false)

  // PWA install prompt state
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  // --- Listen for beforeinstallprompt event ---
  useEffect(() => {
    const handler = (e: Event) => {
      // Cast to our custom type
      const promptEvent = e as BeforeInstallPromptEvent
      // Prevent the mini-infobar from appearing on mobile
      promptEvent.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(promptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      setDeferredPrompt(null)
      setIsInstallable(false)
    })
  }

  // --- Typing animation for splash screen ---
  useEffect(() => {
    let i = 0
    const typingInterval = setInterval(() => {
      if (i < TAGLINE.length) {
        setTypedText(TAGLINE.substring(0, i + 1))
        i++
      } else {
        clearInterval(typingInterval)
        setTypingComplete(true)
        setTimeout(() => {
          setShowSplash(false)
        }, 1000)
      }
    }, 100)
    return () => clearInterval(typingInterval)
  }, [])

  // --- Visibility detection (minimize / tab switch) ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWasHidden(true)
      } else {
        if (wasHidden && iframeRef.current) {
          iframeRef.current.src = THIRD_PARTY_URL
          setWasHidden(false)
        }
      }
    }

    const handleBlur = () => setWasHidden(true)
    const handleFocus = () => {
      if (wasHidden && iframeRef.current) {
        iframeRef.current.src = THIRD_PARTY_URL
        setWasHidden(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [wasHidden])

  return (
    <>
      {/* Splash Screen Overlay */}
      {showSplash && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#800000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            color: 'white',
            fontFamily: 'sans-serif',
          }}
        >
          <Image
            src='/icons/logo.png' // Make sure your logo is at public/logo.png
            alt='Jacob Classes Logo'
            width={150}
            height={150}
          />
          <div style={{ fontSize: '1.5rem', fontWeight: '300' }}>
            {typedText}
            {!typingComplete && <span style={{ opacity: 0.7 }}>|</span>}
          </div>
        </div>
      )}

      {/* Main App (visible after splash) */}
      {!showSplash && (
        <div
          style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
        >
          <header
            style={{
              backgroundColor: '#800000',
              color: 'white',
              padding: '0 20px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'sans-serif',
            }}
          >
            {/* Avatar with "JC" */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#a52a2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
                marginRight: '12px',
              }}
            >
              JC
            </div>
            <span style={{ fontSize: '20px', fontWeight: '500' }}>
              Jacob Classes
            </span>

            {/* Install button (only shown when installable) */}
            {isInstallable && (
              <button
                onClick={handleInstallClick}
                style={{
                  marginLeft: 'auto',
                  backgroundColor: '#a52a2a',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Install App
              </button>
            )}
          </header>

          <iframe
            ref={iframeRef}
            src={THIRD_PARTY_URL}
            style={{
              width: '100%',
              flex: 1,
              border: 'none',
            }}
            title='Third-party app'
            sandbox='allow-same-origin allow-scripts allow-forms allow-popups allow-modals'
          />
        </div>
      )}
    </>
  )
}
