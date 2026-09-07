// client/src/pages/OverviewPage.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import FadeInOnScroll from '../components/FadeInOnScroll';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [];
for (let y = CURRENT_YEAR + 10; y >= CURRENT_YEAR - 2; y--) {
  YEAR_OPTIONS.push(y);
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function OverviewPage() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState(null);
  const [organization, setOrganization] = useState(
    JSON.parse(localStorage.getItem('organization') || '{}')
  );
  const [uploadingBg, setUploadingBg] = useState(false);

  useEffect(() => {
    async function fetchOverview() {
      const res = await api.get('/overview', { params: { year } });
      setData(res.data);
    }
    fetchOverview();
  }, [year]);

  async function handleBackgroundChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('background', file);

    setUploadingBg(true);
    try {
      const res = await api.put('/auth/update-background', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedOrg = { ...organization, backgroundUrl: res.data.organization.backgroundUrl };
      localStorage.setItem('organization', JSON.stringify(updatedOrg));
      setOrganization(updatedOrg);
      toast.success('Background updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update background');
    } finally {
      setUploadingBg(false);
    }
  }

  if (!data) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed bg-no-repeat"
      style={{
        backgroundImage: organization.backgroundUrl
          ? `url(${import.meta.env.VITE_SERVER_URL}${organization.backgroundUrl})`
          : 'linear-gradient(to bottom, #fff7ed, #ffffff)',
          backgroundSize: organization.backgroundUrl ? '400px auto' : 'cover',
          backgroundColor: '#1a1a1a',
      }}
    >
      {/* one overlay for the whole page, so text/boxes stay readable everywhere */}
      {organization.backgroundUrl && <div className="absolute inset-0 bg-black/40" />}

      <div className="relative p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold drop-shadow ${organization.backgroundUrl ? 'text-white' : 'text-orange-700'}`}>
            Overview
          </h2>

          <div className="flex gap-2 items-center">
            <label className="bg-white/80 text-orange-700 px-3 py-2 rounded-md text-sm font-medium cursor-pointer hover:bg-white">
              {uploadingBg ? 'Uploading...' : 'Change Background'}
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleBackgroundChange}
                className="hidden"
                disabled={uploadingBg}
              />
            </label>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border rounded-md px-3 py-2 text-sm bg-white/80"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary cards — glassy, background visible through them */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <FadeInOnScroll>
  <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-5 rounded-xl shadow-lg text-center transition-transform duration-200 hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer">
    <p className="text-gray-700 text-sm">Total Chanda</p>
    <p className="text-2xl font-bold text-green-700">₹{data.totalChanda.toLocaleString('en-IN')}</p>
    <p className="text-xs text-gray-500">{data.chandaCount} entries</p>
  </div>
</FadeInOnScroll>

<FadeInOnScroll>
  <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-5 rounded-xl shadow-lg text-center transition-transform duration-200 hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer">
    <p className="text-gray-700 text-sm">Total Expenses</p>
    <p className="text-2xl font-bold text-red-700">₹{data.totalExpense.toLocaleString('en-IN')}</p>
    <p className="text-xs text-gray-500">{data.expenseCount} entries</p>
  </div>
</FadeInOnScroll>

<FadeInOnScroll>
  <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-5 rounded-xl shadow-lg text-center transition-transform duration-200 hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer">
    <p className="text-gray-700 text-sm">Event Budget Spent</p>
    <p className="text-2xl font-bold text-purple-700">₹{data.totalEventBudget.toLocaleString('en-IN')}</p>
    <p className="text-xs text-gray-500">{data.eventCount} events</p>
  </div>
</FadeInOnScroll>

<FadeInOnScroll>
 <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-5 rounded-xl shadow-lg text-center transition-transform duration-200 hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer">
    <p className="text-gray-700 text-sm">Net Profit/Loss</p>
    <p className={`text-2xl font-bold ${data.netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
      {data.netBalance >= 0 ? '+' : '-'} ₹{Math.abs(data.netBalance).toLocaleString('en-IN')}
    </p>
    <p className="text-xs text-gray-500">for {data.year}</p>
  </div>
</FadeInOnScroll>
        </div>

        {/* Month-by-month table — same glassy treatment, same background continues behind it */}
        <FadeInOnScroll>
  <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl shadow-lg overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-orange-50/80 text-orange-800">
        <tr>
          <th className="text-left p-3">Month</th>
          <th className="text-left p-3">Chanda</th>
          <th className="text-left p-3">Expense</th>
          <th className="text-left p-3">Balance</th>
        </tr>
      </thead>
      <tbody>
        {data.monthly.filter((m) => [8, 9].includes(m.month)).map((m) => (
          <tr key={m.month} className="border-t border-gray-200">
            <td className="p-3 text-gray-700">{MONTH_NAMES[m.month - 1]}</td>
            <td className="p-3 text-green-700 font-medium">₹{m.chanda.toLocaleString('en-IN')}</td>
            <td className="p-3 text-red-700 font-medium">₹{m.expense.toLocaleString('en-IN')}</td>
            <td className="p-3 font-bold text-gray-800">₹{(m.chanda - m.expense).toLocaleString('en-IN')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</FadeInOnScroll>
      </div>
    </div>
  );
}