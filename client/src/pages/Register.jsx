// // client/src/pages/Register.jsx
// import { useState } from 'react';
// import api from '../api/axios';
// import { Eye, EyeOff } from 'lucide-react';
// import { Link, useNavigate } from 'react-router-dom';

// export default function Register() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ name: '', email: '', password: '', orgName: '' });
//   const [logo, setLogo] = useState(null); // new — holds the actual file object
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
  
//   function handleChange(e) {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   }

//   function handleLogoChange(e) {
//     setLogo(e.target.files[0]); // file inputs give a FileList; we just want the first file
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append('name', form.name);
//       formData.append('email', form.email);
//       formData.append('password', form.password);
//       formData.append('orgName', form.orgName);
//       if (logo) {
//         formData.append('logo', logo); // only attach if the user actually picked one
//       }

//       await api.post('/auth/register', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       navigate('/login');
//    } catch (err) {
//   const details = JSON.stringify({
//     message: err.response?.data?.message,
//     status: err.response?.status,
//     fullError: err.message,
//   });
//   setError(details);
// } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//         <h1 className="text-2xl font-bold text-orange-700 mb-6">Register Your Temple</h1>

//         {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

//         <input
//           name="name"
//           placeholder="Your Name"
//           value={form.name}
//           onChange={handleChange}
//           className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
//           required
//         />
//         <input
//           name="orgName"
//           placeholder="Temple / Trust Name"
//           value={form.orgName}
//           onChange={handleChange}
//           className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
//           required
//         />
//         <input
//           name="email"
//           type="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={handleChange}
//           className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
//           required
//         />
//        <div className="relative mb-4">
//   <input
//     name="password"
//     type={showPassword ? 'text' : 'password'}
//     placeholder="Password"
//     value={form.password}
//     onChange={handleChange}
//     className="w-full border rounded-md px-3 py-2 text-sm pr-10"
//     required
//   />
//   <button
//     type="button"
//     onClick={() => setShowPassword(!showPassword)}
//     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
//   >
//     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//   </button>
// </div>

//         <label className="text-sm font-medium text-gray-700">Temple Logo (optional)</label>
//         <input
//           type="file"
//           accept="image/png, image/jpeg, image/webp"
//           onChange={handleLogoChange}
//           className="w-full border rounded-md px-3 py-2 mb-4 text-sm"
//         />
           
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-orange-700 text-white rounded-md py-2 font-medium hover:bg-orange-800 disabled:opacity-50"
//         >
//           {loading ? 'Registering...' : 'Register'}
//         </button>
//         <p className="text-sm text-gray-600 text-center mt-4">
//   Already have an account?{' '}
//   <Link to="/login" className="text-orange-700 font-medium hover:underline">
//     Login
//   </Link>
// </p>
//       </form>
//     </div>
//   );
// }


// client/src/pages/Register.jsx
import { useState } from 'react';
import api from '../api/axios';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    orgName: '',
  });

  const [logo, setLogo] = useState(null);

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    orgName: '',
    logo: '',
    general: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Maximum logo size: 2 MB
  const MAX_LOGO_SIZE = 2 * 1024 * 1024;

  function handleChange(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    // Clear that field's error when user starts typing
    setErrors({
      ...errors,
      [name]: '',
      general: '',
    });
  }

  function handleLogoChange(e) {
    const file = e.target.files[0];

    // Clear previous logo error
    setErrors({
      ...errors,
      logo: '',
      general: '',
    });

    if (!file) {
      setLogo(null);
      return;
    }

    // Check image type
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setLogo(null);

      setErrors({
        ...errors,
        logo: 'Only PNG, JPEG and WebP images are allowed.',
        general: '',
      });

      e.target.value = '';
      return;
    }

    // Check image size
    if (file.size > MAX_LOGO_SIZE) {
      setLogo(null);

      setErrors({
        ...errors,
        logo: 'Logo size must not exceed 2 MB.',
        general: '',
      });

      e.target.value = '';
      return;
    }

    setLogo(file);
  }

  function validateForm() {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      orgName: '',
      logo: '',
      general: '',
    };

    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = 'Name is required.';
      isValid = false;
    }

    if (!form.orgName.trim()) {
      newErrors.orgName = 'Temple / Trust Name is required.';
      isValid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
      isValid = false;
    }

    // Password:
    // minimum 8 characters
    // uppercase
    // lowercase
    // number
    // special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!form.password) {
      newErrors.password = 'Password is required.';
      isValid = false;
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password =
        'Password must be at least 8 characters and contain uppercase, lowercase, number and special character.';
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setErrors({
      name: '',
      email: '',
      password: '',
      orgName: '',
      logo: '',
      general: '',
    });

    // Frontend validation
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('orgName', form.orgName);

      if (logo) {
        formData.append('logo', logo);
      }

      // Do not manually set multipart Content-Type.
      // Browser/Axios will set the correct boundary.
      await api.post('/auth/register', formData);

      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);

      const field = err.response?.data?.field;
      const message =
        err.response?.data?.message ||
        'Registration failed. Please try again.';

      setErrors((prev) => ({
        ...prev,
        [field || 'general']: message,
      }));
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
        <h1 className="text-2xl font-bold text-orange-700 mb-6">
          Register Your Temple
        </h1>

        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-3 py-2 mb-4">
            {errors.general}
          </div>
        )}

        {/* Name */}
        <input
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          className={`w-full border rounded-md px-3 py-2 mb-1 text-sm ${
            errors.name ? 'border-red-500' : ''
          }`}
          required
        />

        {errors.name && (
          <p className="text-red-600 text-xs mb-3">
            {errors.name}
          </p>
        )}

        {/* Organization Name */}
        <input
          name="orgName"
          placeholder="Temple / Trust Name"
          value={form.orgName}
          onChange={handleChange}
          className={`w-full border rounded-md px-3 py-2 mb-1 text-sm ${
            errors.orgName ? 'border-red-500' : ''
          }`}
          required
        />

        {errors.orgName && (
          <p className="text-red-600 text-xs mb-3">
            {errors.orgName}
          </p>
        )}

        {/* Email */}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className={`w-full border rounded-md px-3 py-2 mb-1 text-sm ${
            errors.email ? 'border-red-500' : ''
          }`}
          required
        />

        {errors.email && (
          <p className="text-red-600 text-xs mb-3">
            {errors.email}
          </p>
        )}

        {/* Password */}
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className={`w-full border rounded-md px-3 py-2 text-sm pr-10 ${
              errors.password ? 'border-red-500' : ''
            }`}
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        <p className="text-gray-500 text-xs mt-1 mb-1">
          Password must contain at least 8 characters, including
          uppercase, lowercase, number and special character.
        </p>

        {errors.password && (
          <p className="text-red-600 text-xs mb-4">
            {errors.password}
          </p>
        )}

        {/* Logo */}
        <label className="text-sm font-medium text-gray-700">
          Temple Logo (optional)
        </label>

        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleLogoChange}
          className={`w-full border rounded-md px-3 py-2 mt-1 mb-1 text-sm ${
            errors.logo ? 'border-red-500' : ''
          }`}
        />

        <p className="text-gray-500 text-xs mb-1">
          PNG, JPEG or WebP. Maximum size: 2 MB.
        </p>

        {errors.logo && (
          <p className="text-red-600 text-xs mb-4">
            {errors.logo}
          </p>
        )}

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-700 text-white rounded-md py-2 font-medium hover:bg-orange-800 disabled:opacity-50 mt-3"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="text-sm text-gray-600 text-center mt-4">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-orange-700 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}