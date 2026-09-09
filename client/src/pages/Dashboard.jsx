// client/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ChandaPage from './ChandaPage';
import ExpensePage from './ExpensePage';
import VideoPage from './VideoPage';
import DailyEventPage from './DailyEventPage';
import OverviewPage from './OverviewPage';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'chanda', label: 'Chanda' },
  { key: 'expense', label: 'Expenses' },
  { key: 'video', label: 'Videos' },
  { key: 'events', label: 'Daily Events' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [organization, setOrganization] = useState(
    JSON.parse(localStorage.getItem('organization') || '{}')
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Always fetch the true, current organization data on mount —
  // localStorage is only used as an instant-display fallback while this loads.
  useEffect(() => {
    async function refreshOrganization() {
      try {
        const res = await api.get('/auth/me');
        setOrganization(res.data.organization);
        localStorage.setItem('organization', JSON.stringify(res.data.organization));
      } catch (err) {
        // if this fails, we just keep showing whatever localStorage had
      }
    }
    refreshOrganization();
  }, []);

  const publicUrl = `${window.location.origin}/temple/${organization.slug}`;

  async function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    setUploadingLogo(true);
    try {
      const res = await api.put('/auth/update-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedOrg = { ...organization, logoUrl: res.data.organization.logoUrl };
      localStorage.setItem('organization', JSON.stringify(updatedOrg));
      setOrganization(updatedOrg);
      toast.success('Logo updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update logo');
    } finally {
      setUploadingLogo(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-orange-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Vinayka Management Dashboard</h1>
        <div className="flex items-center gap-4">
          <span>{user.name}</span>
          <button onClick={handleLogout} className="bg-orange-900 px-3 py-1 rounded-md text-sm">
            Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-6 py-4 text-center md:text-left">
        <div className="flex items-center gap-3 justify-center md:justify-start">
          <label className="relative cursor-pointer group">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt="Temple logo"
                className="h-12 w-12 rounded-full object-cover border"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                Add
              </div>
            )}
            <span className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] transition">
              {uploadingLogo ? '...' : 'Change'}
            </span>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleLogoChange}
              className="hidden"
              disabled={uploadingLogo}
            />
          </label>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Welcome, {user.name}</h2>
            <p className="text-sm text-gray-500">{organization.name}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row items-center gap-4">
          <div className="text-center sm:text-right">
            <p className="font-medium text-gray-800">Public Temple Page</p>
            <p className="text-xs text-gray-500 break-all max-w-[200px] mx-auto sm:mx-0">{publicUrl}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                toast.success('Link copied!');
              }}
              className="text-orange-700 text-sm underline mt-1"
            >
              Copy Link
            </button>
          </div>
          <QRCodeSVG value={publicUrl} size={90} />
        </div>
      </div>

      <div className="bg-white border-b flex gap-1 px-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-orange-700 text-orange-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewPage />}
      {activeTab === 'chanda' && <ChandaPage />}
      {activeTab === 'expense' && <ExpensePage />}
      {activeTab === 'video' && <VideoPage />}
      {activeTab === 'events' && <DailyEventPage />}
    </div>
  );
}