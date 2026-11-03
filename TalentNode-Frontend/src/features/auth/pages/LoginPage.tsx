import { useState, useEffect, useRef, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../../app/store/AuthStore'
import { toast } from '../../../app/ui/toast'
import { authApi } from '../../../services/api/authApi'
import AuthCornerDecorations from '../components/AuthCornerDecorations'

type AuthStep = 'email' | 'password'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const login = useAuthStore((state) => state.login)
  const isAuthLoading = useAuthStore((state) => state.isLoading)
  const authStoreError = useAuthStore((state) => state.error)

  const initialEmail = searchParams.get('email')?.trim() ?? (location.state as { email?: string } | null)?.email ?? ''
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<AuthStep>(initialEmail ? 'password' : 'email')
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const passwordInputRef = useRef<HTMLInputElement>(null)

  const isSessionExpired =
    Boolean((location.state as { sessionExpired?: boolean } | null)?.sessionExpired) ||
    searchParams.get('sessionExpired') === 'true'
  const redirectTarget = searchParams.get('redirect')

  // Auto-focus password input when step changes to 'password'
  useEffect(() => {
    if (step === 'password') {
      passwordInputRef.current?.focus()
    }
  }, [step])

  // Handle Step 1: Check Email
  const handleCheckEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError(null)

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setLocalError('Please enter your email address.')
      return
    }

    setIsCheckingEmail(true)

    try {
      const response = await authApi.checkEmail({ email: normalizedEmail })

      if (response.exists || response.nextStep === 'login') {
        // Email exists -> proceed to password entry on login page
        setStep('password')
        toast.info('Welcome back! Please enter your password.')
      } else {
        // Email does NOT exist -> redirect to sign up page with pre-filled email
        toast.info('No account found for this email. Redirecting to sign up...')
        navigate(`/register?email=${encodeURIComponent(normalizedEmail)}`, {
          state: {
            email: normalizedEmail,
            from: (location.state as { from?: { pathname?: string } } | null)?.from,
          },
        })
      }
    } catch (err: unknown) {
      console.error('Error checking email:', err)
      setLocalError(
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Unable to check email. Please try again.',
      )
    } finally {
      setIsCheckingEmail(false)
    }
  }

  // Handle Step 2: Login with Password
  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError(null)

    try {
      await login(email.trim().toLowerCase(), password)
      toast.success('Logged in successfully')
    } catch {
      toast.error('Login failed')
      return
    }

    const user = useAuthStore.getState().user
    const from = (location.state as { from?: { pathname?: string } } | null)?.from
    navigate(
      redirectTarget ??
      from?.pathname ??
      (user?.organizationId
        ? `/organizations/${user.organizationId}/dashboard`
        : '/organizations/new'),
    )
  }

  const handleBackToEmail = () => {
    setStep('email')
    setPassword('')
    setLocalError(null)
  }

  const displayError = localError || authStoreError

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50/70 px-4 py-12">
      {/* Decorative Top-Right & Bottom-Left Corner Elements */}
      <AuthCornerDecorations />

      {/* Main Auth Card */}
      <section className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200/80 bg-white/95 p-8 shadow-2xl shadow-indigo-500/5 backdrop-blur-sm sm:p-10">
        {/* Brand Header */}
        <div className="text-center">
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900">
            {step === 'email' ? 'Welcome to TalentNode' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {step === 'email'
              ? 'Enter your work email to continue'
              : 'Sign in to access your recruitment workspace'}
          </p>
        </div>

        {isSessionExpired ? (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs font-medium text-amber-800">
            Your session has expired. Please log in again to continue.
          </div>
        ) : null}

        {/* STEP 1: Enter & Verify Email */}
        {step === 'email' && (
          <form onSubmit={handleCheckEmail} className="mt-7 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Email Address
              </label>
              <div className="relative mt-1.5 flex items-center">
                <span className="pointer-events-none absolute left-3.5 text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  autoFocus
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:outline-none"
                  required
                />
              </div>
            </div>

            {displayError ? (
              <div className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-600">
                {displayError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isCheckingEmail}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white shadow-md shadow-gray-900/10 transition-all hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCheckingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Checking account...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Password Entry (when email exists) */}
        {step === 'password' && (
          <form onSubmit={handlePasswordLogin} className="mt-7 space-y-4">
            {/* Display Active Email with Change Option */}
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-3.5 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="h-4 w-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-medium text-gray-900 truncate">{email}</span>
              </div>
              <button
                type="button"
                onClick={handleBackToEmail}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors ml-2 shrink-0"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Change</span>
              </button>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Password
              </label>
              <div className="relative mt-1.5 flex items-center">
                <span className="pointer-events-none absolute left-3.5 text-gray-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pr-11 pl-10 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 text-gray-400 transition hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {displayError ? (
              <div className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-600">
                {displayError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isAuthLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white shadow-md shadow-gray-900/10 transition-all hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAuthLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in to TalentNode</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Card Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          New to TalentNode?{' '}
          <Link
            to={`/register${email ? `?email=${encodeURIComponent(email)}` : ''}`}
            state={location.state}
            className="font-semibold text-indigo-600 underline-offset-4 hover:underline hover:text-indigo-700"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
