// client/src/pages/Register.jsx
import { useState } from 'react';
import api from '../api/axios';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', orgName: '' });
  const [logo, setLogo] = useState(null); // new — holds the actual file object
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleLogoChange(e) {
    setLogo(e.target.files[0]); // file inputs give a FileList; we just want the first file
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('orgName', form.orgName);
      if (logo) {
        formData.append('logo', logo); // only attach if the user actually picked one
      }

      await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-orange-700 mb-6">Register Your Temple</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <input
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
          required
        />
        <input
          name="orgName"
          placeholder="Temple / Trust Name"
          value={form.orgName}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
          required
        />
       <div className="relative mb-4">
  <input
    name="password"
    type={showPassword ? 'text' : 'password'}
    placeholder="Password"
    value={form.password}
    onChange={handleChange}
    className="w-full border rounded-md px-3 py-2 text-sm pr-10"
    required
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>

        <label className="text-sm font-medium text-gray-700">Temple Logo (optional)</label>
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleLogoChange}
          className="w-full border rounded-md px-3 py-2 mb-4 text-sm"
        />
           
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-700 text-white rounded-md py-2 font-medium hover:bg-orange-800 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="text-sm text-gray-600 text-center mt-4">
  Already have an account?{' '}
  <Link to="/login" className="text-orange-700 font-medium hover:underline">
    Login
  </Link>
</p>
      </form>
    </div>
  );
}