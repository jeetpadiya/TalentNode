import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react'
import { useAuthStore } from '../../../app/store/AuthStore'
import { toast } from '../../../app/ui/toast'
import { authApi } from '../../../services/api/authApi'
import AuthCornerDecorations from '../components/AuthCornerDecorations'

const RegisterPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const register = useAuthStore((state) => state.register)
  const isAuthLoading = useAuthStore((state) => state.isLoading)
  const authStoreError = useAuthStore((state) => state.error)

  const initialEmail = searchParams.get('email')?.trim() ?? (location.state as { email?: string } | null)?.email ?? ''
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError(null)

    const normalizedEmail = email.trim().toLowerCase()
    setIsCheckingEmail(true)

    try {
      // Check if email already exists before registration
      const checkRes = await authApi.checkEmail({ email: normalizedEmail })

      if (checkRes.exists || checkRes.nextStep === 'login') {
        toast.info('An account with this email already exists. Redirecting to sign in...')
        navigate(`/login?email=${encodeURIComponent(normalizedEmail)}`, {
          state: {
            email: normalizedEmail,
            from: (location.state as { from?: { pathname?: string } } | null)?.from,
          },
        })
        return
      }

      // Email is free -> proceed to register
      await register(username.trim(), normalizedEmail, password)
      toast.success('Account created successfully')

      const from = (location.state as { from?: { pathname?: string } } | null)?.from
      navigate(from?.pathname ?? '/organizations/new')
    } catch (err: unknown) {
      console.error('Registration error:', err)
      const message =
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Registration failed. Please check your details.'
      setLocalError(message)
      toast.error('Registration failed')
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const isLoading = isAuthLoading || isCheckingEmail
  const displayError = localError || authStoreError

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50/70 px-4 py-12">
      {/* Decorative Top-Right & Bottom-Left Corner Elements */}
      <AuthCornerDecorations />

      {/* Main Register Card */}
      <section className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200/80 bg-white/95 p-8 shadow-2xl shadow-indigo-500/5 backdrop-blur-sm sm:p-10">
        {/* Brand Header */}
        <div className="text-center">
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900">
            Create an account
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Start hiring faster with modern applicant tracking
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Full Name / Username
            </label>
            <div className="relative mt-1.5 flex items-center">
              <span className="pointer-events-none absolute left-3.5 text-gray-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Jane Doe"
                autoFocus={!initialEmail}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Work Email Address
            </label>
            <div className="relative mt-1.5 flex items-center">
              <span className="pointer-events-none absolute left-3.5 text-gray-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="jane@company.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Password
            </label>
            <div className="relative mt-1.5 flex items-center">
              <span className="pointer-events-none absolute left-3.5 text-gray-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                placeholder="At least 8 characters"
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
            <p className="mt-1 text-[11px] text-gray-400 flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-500" /> Must be at least 8 characters
            </p>
          </div>

          {displayError ? (
            <div className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-600">
              {displayError}
            </div>
          ) : null}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white shadow-md shadow-gray-900/10 transition-all hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create free account</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Card Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link
            to={`/login${email ? `?email=${encodeURIComponent(email)}` : ''}`}
            state={location.state}
            className="font-semibold text-indigo-600 underline-offset-4 hover:underline hover:text-indigo-700"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage
