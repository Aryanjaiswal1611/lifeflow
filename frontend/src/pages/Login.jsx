import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { BiShow, BiHide } from 'react-icons/bi';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const googleConfigured = Boolean(GOOGLE_CLIENT_ID);

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result?.requiresTwoFactor) {
        toast.success('Please verify your 2FA code');
        return;
      }
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setGoogleLoading(true);
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch user info');
      const userInfo = await res.json();
      await googleLogin({
        googleId: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.picture,
        accessToken: tokenResponse.access_token
      });
      toast.success('Signed in with Google!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Google login failed';
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLoginHook = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (error) => {
      if (error.error === 'popup_closed_by_user') {
        toast.error('Google sign-in was cancelled.');
      } else if (error.error === 'popup_blocked_by_browser') {
        toast.error('Pop-up was blocked. Please allow pop-ups for this site.');
      } else if (error.error === 'access_denied') {
        toast.error('Google sign-in was denied.');
      } else if (error.error === 'invalid_client') {
        toast.error('Google sign-in configuration error. Please contact support.');
      } else {
        toast.error(error.message || 'Google sign-in failed. Please try again.');
      }
    },
    flow: 'implicit',
    scope: 'email profile openid'
  });

  const handleGoogleLogin = () => {
    if (!googleConfigured) {
      toast.error('Google Sign-In is not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.');
      return;
    }
    googleLoginHook();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="mb-8 text-center">
            <span className="text-5xl">🩸</span>
            <h2 className="section-title mt-5">Welcome Back</h2>
            <p className="text-gray-500 dark:text-gray-400">Sign in to your LifeFlow account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className="input-field pr-10" placeholder="Enter your password" required />
                <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" onClick={() => setShow(!show)}>
                  {show ? <BiHide size={20} /> : <BiShow size={20} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="link text-sm">Forgot Password?</Link>
            </div>
            <button type="submit" disabled={loading || googleLoading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-sm text-gray-400 dark:bg-gray-900">or continue with</span></div>
            </div>
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading || !googleConfigured}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              title={!googleConfigured ? 'Google Sign-In not configured. Add VITE_GOOGLE_CLIENT_ID to .env' : ''}
            >
              {googleLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              )}
              {googleLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account? <Link to="/register" className="link">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
