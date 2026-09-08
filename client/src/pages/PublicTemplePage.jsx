// client/src/pages/PublicTemplePage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [];
for (let y = CURRENT_YEAR + 10; y >= CURRENT_YEAR - 2; y--) {
  YEAR_OPTIONS.push(y);
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'videos', label: 'Videos' },
  { key: 'events', label: 'Daily Events' },
];

export default function PublicTemplePage() {
  const { slug } = useParams();
  const [org, setOrg] = useState(null);
  const [summary, setSummary] = useState(null);
  const [videos, setVideos] = useState([]);
  const [events, setEvents] = useState([]);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [activeTab, setActiveTab] = useState('overview');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchOrg() {
      try {
        const res = await api.get(`/public/${slug}`);
        setOrg(res.data);
      } catch (err) {
        setNotFound(true);
      }
    }
    fetchOrg();
  }, [slug]);

  useEffect(() => {
    if (!org) return;
    async function fetchTabData() {
      try {
        if (activeTab === 'overview') {
          const res = await api.get(`/public/${slug}/summary`, { params: { year } });
          setSummary(res.data);
        } else if (activeTab === 'videos') {
          const res = await api.get(`/public/${slug}/videos`, { params: { year } });
          setVideos(res.data);
        } else if (activeTab === 'events') {
          const res = await api.get(`/public/${slug}/daily-events`, { params: { year } });
          setEvents(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch tab data', err);
      }
    }
    fetchTabData();
  }, [slug, org, year, activeTab]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Temple not found.</p>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-700 text-white py-6 md:py-8 px-4 text-center">
        {org.logoUrl && (
          <img
            src={`${import.meta.env.VITE_API_URL}${org.logoUrl}`}
            alt="Temple logo"
            className="h-20 w-20 rounded-full mx-auto mb-3 object-cover border-4 border-white"
          />
        )}
        <h1 className="text-3xl font-bold">{org.name}</h1>
        <p className="text-orange-100 mt-1">Transparency Report</p>
      </div>

      <div className="bg-white border-b flex gap-1 px-4 overflow-x-auto">
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

      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-end mb-4">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {activeTab === 'overview' && summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-gray-500 text-sm">Total Chanda</p>
              <p className="text-2xl font-bold text-green-700">₹{summary.totalChanda.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-gray-500 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700">₹{summary.totalExpense.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-gray-500 text-sm">Balance</p>
              <p className="text-2xl font-bold text-orange-700">₹{summary.balance.toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          videos.length === 0 ? (
            <p className="text-gray-500 text-sm">No videos for this year yet.</p>
          ) : (
            <div className="grid gap-3">
              {videos.map((v) => (
                <a
                  key={v._id}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-transform duration-200 hover:scale-105 active:scale-95"
                >
                  <p className="font-medium text-gray-800">{v.title}</p>
                  <p className="text-sm text-gray-500">
                    {v.category.value === 'Other' ? v.category.customValue : v.category.value}
                  </p>
                </a>
              ))}
            </div>
          )
        )}

        {activeTab === 'events' && (
          events.length === 0 ? (
            <p className="text-gray-500 text-sm">No events for this year yet.</p>
          ) : (
            <div className="grid gap-3">
              {events.map((ev) => (
                <div key={ev._id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">
                        {ev.eventType.value === 'Other' ? ev.eventType.customValue : ev.eventType.value}
                      </p>
                      {ev.description && <p className="text-sm text-gray-500">{ev.description}</p>}
                    </div>
                    {ev.budget > 0 && (
                      <p className="font-bold text-orange-700">₹{ev.budget.toLocaleString('en-IN')}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(ev.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}