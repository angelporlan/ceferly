import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth.service'

interface GoogleLoginButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const navigate = useNavigate()
  const googleBtnRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [gsiActive, setGsiActive] = useState(false)

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-google-client-id.apps.googleusercontent.com'

  const handleCredentialResponse = async (response: any) => {
    setLoading(true)
    try {
      await authService.googleLogin(response.credential)
      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/learn')
      }
    } catch (err: any) {
      if (onError) {
        onError(err.message || 'Error al autenticar con Google')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initGsi = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id && googleBtnRef.current) {
        try {
          ;(window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
          })

          googleBtnRef.current.innerHTML = ''
          ;(window as any).google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 360,
            shape: 'pill',
            text: 'continue_with',
          })
          setGsiActive(true)
        } catch (err) {
          console.warn('Google GSI initialization error:', err)
          setGsiActive(false)
        }
      }
    }

    if ((window as any).google?.accounts?.id) {
      initGsi()
    } else {
      const timer = setTimeout(initGsi, 400)
      return () => clearTimeout(timer)
    }
  }, [clientId])

  const handleCustomGoogleClick = async () => {
    setLoading(true)
    try {
      const demoToken = `demo_google_credential_${Date.now()}`
      await authService.googleLogin(demoToken, 'google_student@ceferly.com', 'Google Student')
      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/learn')
      }
    } catch (err: any) {
      if (onError) {
        onError(err.message || 'Error en autenticación Google')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Official Google GSI Button Container */}
      <div
        ref={googleBtnRef}
        className={`w-full flex justify-center ${gsiActive ? 'block' : 'hidden'}`}
      />

      {/* Fallback Ceferly 3D Button (only shown if Google GSI is not active) */}
      {!gsiActive && (
        <button
          type="button"
          onClick={handleCustomGoogleClick}
          disabled={loading}
          className="btn-3d-secondary w-full py-3 px-4 flex items-center justify-center gap-3 text-sm font-black border-2 border-ceferlyBorder shadow-btn-secondary"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
        </button>
      )}
    </div>
  )
}
