// client/src/pages/OverviewPage.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [];
for (let y = CURRENT_YEAR + 10; y >= CURRENT_YEAR - 2; y--) {
  YEAR_OPTIONS.push(y);
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function OverviewPage() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchOverview() {
      const res = await api.get('/overview', { params: { year } });
      setData(res.data);
    }
    fetchOverview();
  }, [year]);

  if (!data) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-orange-700">Overview</h2>
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Total Chanda</p>
          <p className="text-2xl font-bold text-green-700">₹{data.totalChanda.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400">{data.chandaCount} entries</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Total Expenses</p>
          <p className="text-2xl font-bold text-red-700">₹{data.totalExpense.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400">{data.expenseCount} entries</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Event Budget Spent</p>
          <p className="text-2xl font-bold text-purple-700">₹{data.totalEventBudget.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400">{data.eventCount} events</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-500 text-sm">Net Profit/Loss</p>
          <p className={`text-2xl font-bold ${data.netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {data.netBalance >=0 ? '+' : '-'} ₹{Math.abs(data.netBalance).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-400">for {data.year}</p>
        </div>
      </div>

      {/* Month-by-month table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-orange-50 text-orange-800">
            <tr>
              <th className="text-left p-3">Month</th>
              <th className="text-left p-3">Chanda</th>
              <th className="text-left p-3">Expense</th>
              <th className="text-left p-3">Balance</th>
            </tr>
          </thead>
         <tbody>
{data.monthly.filter((m) => [8, 9].includes(m.month)).map((m) => (
      <tr key={m.month} className="border-t">
        <td className="p-3">{MONTH_NAMES[m.month - 1]}</td>
        <td className="p-3 text-green-700">₹{m.chanda.toLocaleString('en-IN')}</td>
        <td className="p-3 text-red-700">₹{m.expense.toLocaleString('en-IN')}</td>
        <td className="p-3 font-medium">₹{(m.chanda - m.expense).toLocaleString('en-IN')}</td>
      </tr>
    ))}
</tbody>
        </table>
      </div>
    </div>
  );
}