// client/src/pages/PublicTemplePage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { PlayCircle, ExternalLink, Lock } from 'lucide-react';
import FadeInOnScroll from '../components/FadeInOnScroll';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [];
for (let y = CURRENT_YEAR + 10; y >= CURRENT_YEAR - 12; y--) {
  YEAR_OPTIONS.push(y);
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'chanda', label: 'Chanda' },
  { key: 'expense', label: 'Expenses' },
  { key: 'videos', label: 'Videos' },
  { key: 'events', label: 'Daily Events' },
];

export default function PublicTemplePage() {
  const { slug } = useParams();
  const [org, setOrg] = useState(null);
  const [summary, setSummary] = useState(null);
  const [videos, setVideos] = useState([]);
  const [events, setEvents] = useState([]);
  const [year, setYear] = useState('');
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
          const res = await api.get(`/public/${slug}/summary`, { params: { year: year || undefined } });
          setSummary(res.data);
        } else if (activeTab === 'videos') {
          const res = await api.get(`/public/${slug}/videos`, { params: { year: year || undefined } });
          setVideos(res.data);
        } else if (activeTab === 'events') {
          const res = await api.get(`/public/${slug}/daily-events`, { params: { year: year || undefined } });
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
    console.log('org.backgroundUrl:', org.backgroundUrl);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Full URL:', `${import.meta.env.VITE_API_URL}${org.backgroundUrl}`);
  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="relative bg-cover bg-center bg-fixed bg-no-repeat"
        style={{
          backgroundImage: org.backgroundUrl
            ? `url(${import.meta.env.VITE_API_URL}${org.backgroundUrl})`
            : 'linear-gradient(to bottom, #c2410c, #ea580c)',
        }}
      >
        {org.backgroundUrl && <div className="absolute inset-0 bg-black/40" />}

        <div className="relative py-6 md:py-8 px-4 text-center">
          {org.logoUrl && (
            <img
              src={`${import.meta.env.VITE_API_URL}${org.logoUrl}`}
              alt="Temple logo"
              className="h-20 w-20 rounded-full mx-auto mb-3 object-cover border-4 border-white"
            />
          )}
          <h1 className="text-3xl font-bold text-white drop-shadow">{org.name}</h1>
          <p className="text-white/90 mt-1">Transparency Report</p>
        </div>

        {/* Tab bar */}
        <div className="relative bg-white/90 backdrop-blur border-b flex gap-1 px-4 overflow-x-auto">
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

        <div className="relative max-w-3xl mx-auto p-6">
          <div className="flex justify-end mb-4">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white/90"
            >
              <option value="">All Years</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
              <FadeInOnScroll>
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-5 rounded-xl shadow-lg text-center transition-transform duration-200 hover:scale-105 hover:shadow-xl active:scale-95">
                  <p className="text-gray-600 text-sm">Total Chanda</p>
                  <p className="text-2xl font-bold text-green-700">₹{summary.totalChanda.toLocaleString('en-IN')}</p>
                </div>
              </FadeInOnScroll>

              <FadeInOnScroll>
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-5 rounded-xl shadow-lg text-center transition-transform duration-200 hover:scale-105 hover:shadow-xl active:scale-95">
                  <p className="text-gray-600 text-sm">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-700">₹{summary.totalExpense.toLocaleString('en-IN')}</p>
                </div>
              </FadeInOnScroll>

              <FadeInOnScroll>
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-5 rounded-xl shadow-lg text-center transition-transform duration-200 hover:scale-105 hover:shadow-xl active:scale-95">
                  <p className="text-gray-600 text-sm">Event Budget</p>
                  <p className="text-2xl font-bold text-purple-700">₹{(summary.totalEventBudget || 0).toLocaleString('en-IN')}</p>
                </div>
              </FadeInOnScroll>

              <FadeInOnScroll>
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-5 rounded-xl shadow-lg text-center transition-transform duration-200 hover:scale-105 hover:shadow-xl active:scale-95">
                  <p className="text-gray-600 text-sm">Net Balance</p>
                  <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {summary.balance >= 0 ? '+' : '-'} ₹{Math.abs(summary.balance).toLocaleString('en-IN')}
                  </p>
                </div>
              </FadeInOnScroll>
            </div>
          )}

          {/* Locked Chanda/Expense tabs */}
          {(activeTab === 'chanda' || activeTab === 'expense') && (
            <FadeInOnScroll>
              <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-xl shadow-lg p-8 text-center">
                <Lock className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-700 font-medium">Admin Access Required</p>
                <p className="text-sm text-gray-500 mt-1">
                  Detailed {activeTab === 'chanda' ? 'chanda' : 'expense'} records are only visible to temple administrators.
                </p>
              </div>
            </FadeInOnScroll>
          )}

          {/* Videos tab */}
          {activeTab === 'videos' && (
            videos.length === 0 ? (
              <p className="text-white/90 text-sm">No videos for this year yet.</p>
            ) : (
              <div className="grid gap-3">
                {videos.map((v) => (
                  <FadeInOnScroll key={v._id}>
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/80 backdrop-blur-xl border border-white/50 p-4 rounded-xl shadow-lg hover:shadow-xl transition-transform duration-200 hover:scale-105 active:scale-95 flex items-center gap-3"
                    >
                      <PlayCircle className="text-orange-700 flex-shrink-0" size={32} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{v.title}</p>
                        <p className="text-sm text-gray-500">
                          {v.category.value === 'Other' ? v.category.customValue : v.category.value}
                        </p>
                      </div>
                      <ExternalLink className="text-gray-400" size={18} />
                    </a>
                  </FadeInOnScroll>
                ))}
              </div>
            )
          )}

          {/* Daily Events tab */}
          {activeTab === 'events' && (
            events.length === 0 ? (
              <p className="text-white/90 text-sm">No events for this year yet.</p>
            ) : (
              <div className="grid gap-3">
                {events.map((ev) => (
                  <FadeInOnScroll key={ev._id}>
                    <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-4 rounded-xl shadow-lg">
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
                  </FadeInOnScroll>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}