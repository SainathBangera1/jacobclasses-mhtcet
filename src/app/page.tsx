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
  const [showSplash, setShowSplash] = useState(true)
  const [typedText, setTypedText] = useState('')
  const [typingComplete, setTypingComplete] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)

  // PWA install prompt state
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  // --- Listen for beforeinstallprompt event ---
  useEffect(() => {
    const handler = (e: Event) => {
      console.log('beforeinstallprompt fired!') // <-- add this
      const promptEvent = e as BeforeInstallPromptEvent
      promptEvent.preventDefault()
      setDeferredPrompt(promptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
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

  // Iframe load handlers
  const handleIframeLoad = () => {
    setIframeLoading(false)
  }

  const handleIframeError = () => {
    setIframeLoading(false)
    console.error('Iframe failed to load')
  }

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
            src='/icons/logo.png'
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

          {/* Iframe container with loading indicator */}
          <div style={{ position: 'relative', flex: 1 }}>
            {iframeLoading && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f0f0f0',
                  zIndex: 10,
                }}
              >
                <div className='spinner'></div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={THIRD_PARTY_URL}
              style={{
                width: '100%',
                flex: 1,
                border: 'none',
              }}
              title='Third-party app'
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </div>
        </div>
      )}

      {/* Spinner styles */}
      <style jsx>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #800000;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}
