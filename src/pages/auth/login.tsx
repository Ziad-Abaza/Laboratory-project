import { useState } from 'react';
import { Eye, EyeOff, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmail = (value: string) => {
    if (!value) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleEmailBlur = () => {
    setErrors(prev => ({ ...prev, email: validateEmail(email) }));
  };

  const handlePasswordBlur = () => {
    setErrors(prev => ({ ...prev, password: validatePassword(password) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({ email: emailError, password: passwordError });

    if (!emailError && !passwordError) {
      setIsLoading(true);
      try {
        await login(email, password);
        // Redirect based on user role
        const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
        switch (user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'reception':
            navigate('/reception');
            break;
          case 'laboratory':
            navigate('/laboratory-reception');
            break;
          default:
            navigate('/reception');
        }
      } catch (error) {
        console.error('Login failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="size-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div
          className="bg-card rounded-[var(--radius)] shadow-[0_4px_24px_rgba(8,145,178,0.08)] p-8 md:p-10 transition-shadow duration-300 hover:shadow-[0_8px_32px_rgba(8,145,178,0.12)]"
        >
          {/* Logo Placeholder */}
          <div className="flex justify-center mb-6">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
              <Heart className="size-8 text-white" strokeWidth={2} />
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="text-center mb-8">
            <h1 className="text-[1.75rem] text-card-foreground mb-2">
              Clinic Management System
            </h1>
            <p className="text-muted-foreground text-[0.9375rem]">
              Secure Staff Login
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-[0.875rem] text-card-foreground"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                onBlur={handleEmailBlur}
                className={`
                  w-full px-4 py-3 rounded-lg bg-input-background border-2
                  transition-all duration-200 outline-none
                  ${errors.email
                    ? 'border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10'
                    : 'border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10'
                  }
                  placeholder:text-muted-foreground/60
                `}
                placeholder="your.email@clinic.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1.5 text-[0.8125rem] text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-[0.875rem] text-card-foreground"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  onBlur={handlePasswordBlur}
                  className={`
                    w-full px-4 py-3 pr-12 rounded-lg bg-input-background border-2
                    transition-all duration-200 outline-none
                    ${errors.password
                      ? 'border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10'
                      : 'border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10'
                    }
                    placeholder:text-muted-foreground/60
                  `}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-card-foreground hover:bg-muted transition-all duration-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-[0.8125rem] text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a
                href="#forgot-password"
                className="text-[0.875rem] text-primary hover:text-accent transition-colors duration-200"
              >
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-3.5 px-6 rounded-lg bg-primary text-primary-foreground
                transition-all duration-200
                hover:bg-accent hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5
                active:translate-y-0
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                focus:outline-none focus:ring-4 focus:ring-primary/30
              "
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin size-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-[0.8125rem] text-muted-foreground">
              Access restricted to authorized healthcare staff only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
