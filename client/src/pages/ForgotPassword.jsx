// client/src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent — check your email');
    } catch (err) {
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-orange-700 mb-4">Forgot Password</h1>

        {sent ? (
          <p className="text-gray-600 text-sm">
            If that email is registered, a reset link has been sent. Check your inbox (and spam folder).
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-gray-600 text-sm mb-4">
              Enter your email and we'll send you a link to reset your password.
            </p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mb-4 text-sm"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-700 text-white rounded-md py-2 font-medium hover:bg-orange-800 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-sm text-gray-600 text-center mt-4">
          <Link to="/login" className="text-orange-700 font-medium hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}