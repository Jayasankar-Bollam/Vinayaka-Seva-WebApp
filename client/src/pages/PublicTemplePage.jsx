// client/src/pages/PublicTemplePage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function PublicTemplePage() {
  const { slug } = useParams();
  const [org, setOrg] = useState(null);
  const [summary, setSummary] = useState(null);
  const [videos, setVideos] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const orgRes = await api.get(`/public/${slug}`);
        setOrg(orgRes.data);

        const [summaryRes, videosRes] = await Promise.all([
          api.get(`/public/${slug}/summary`, { params: { year } }),
          api.get(`/public/${slug}/videos`, { params: { year } }),
        ]);
        setSummary(summaryRes.data);
        setVideos(videosRes.data);
      } catch (err) {
        setNotFound(true);
      }
    }
    fetchData();
  }, [slug, year]);

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

      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-end mb-4">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {[year, year - 1, year - 2].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

        <h2 className="text-lg font-bold text-gray-800 mb-3">Videos — {year}</h2>
        {videos.length === 0 ? (
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
        )}
      </div>
    </div>
  );
}