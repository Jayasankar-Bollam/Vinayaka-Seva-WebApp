// client/src/pages/Login.jsx
import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';


export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem(
        "organization",
        JSON.stringify(res.data.organization),
      );
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-orange-700 mb-6">Login</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-700 text-white rounded-md py-2 font-medium hover:bg-orange-800 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-gray-600 text-center mt-4">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-orange-700 font-medium hover:underline"
          >
            Register your temple
          </Link>
        </p>
        <p className="text-sm text-center mt-2">
  <Link to="/forgot-password" className="text-orange-700 hover:underline">
    Forgot Password?
  </Link>
</p>
      </form>
    </div>
  );
}
