// client/src/pages/ChandaPage.jsx
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import SelectWithOther from '../components/SelectWithOther';
import { Pencil, Trash2 } from 'lucide-react';


// const CHANDA_TYPES = ['Monthly', 'Yearly', 'One-time', 'Festival'];
const PAYMENT_MODES = ['Cash', 'PhonePe', 'GPay', 'Bank Transfer'];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [];
for (let y = CURRENT_YEAR + 10; y >= CURRENT_YEAR - 2; y--) {
  YEAR_OPTIONS.push(y);
}
const EMPTY_FORM = {
  devoteeName: '',
  devoteePhone: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  // chandaType: { value: '' },
  paymentMode: { value: '' },
  notes:'',
};



export default function ChandaPage() {
  const [chandas, setChandas] = useState([]);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const formRef = useRef(null);

  async function fetchChandas() {
    const res = await api.get('/chandas', { params: { search, year: year || undefined } });
    setChandas(res.data);
  }

  useEffect(() => {
    fetchChandas();
  }, [search, year]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

 function handleEdit(chanda) {
  setEditingId(chanda._id);
  setForm({
    devoteeName: chanda.devoteeName,
    devoteePhone: chanda.devoteePhone || '',
    amount: chanda.amount,
    date: new Date(chanda.date).toISOString().split('T')[0],
    // chandaType: chanda.chandaType,
    paymentMode: chanda.paymentMode,
    notes: chanda.notes || '',
  });
   formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

  async function handleDelete(id) {
    if (!window.confirm('Delete this chanda entry?')) return;
    try {
      await api.delete(`/chandas/${id}`);
      toast.success('Chanda deleted');
      fetchChandas();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  }

  function cancelEdit() {
  setEditingId(null);
  setForm(EMPTY_FORM);
  setError('');
}

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.devoteePhone && !/^[6-9]\d{9}$/.test(form.devoteePhone)) {
      setError('Phone number must be a valid 10-digit number');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/chandas/${editingId}`, form);
        toast.success('Chanda updated');
      } else {
        await api.post('/chandas', form);
        toast.success('Chanda added');
      }
      setEditingId(null);
      setForm(EMPTY_FORM);
      fetchChandas();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save chanda';
      setError(message);
      toast.error(message);
    }
  }

  async function downloadReport() {
    try {
      const now = new Date();
      const res = await api.get('/reports/chanda', {
        params: { year: now.getFullYear(), month: now.getMonth() + 1 },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `chanda-report-${now.getFullYear()}-${now.getMonth() + 1}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded');
    } catch (err) {
      toast.error('Failed to download report');
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-orange-700">Chanda Entries</h2>
        <button
          onClick={downloadReport}
          className="bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-800"
        >
          Download PDF
        </button>
      </div>

      <form ref = {formRef} onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm mb-6 max-w-md">
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <input
          name="devoteeName"
          placeholder="Devotee Name"
          value={form.devoteeName}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
          required
        />
        <input
          name="devoteePhone"
          placeholder="Phone Number (Optional)"
          value={form.devoteePhone}
          onChange={handleChange}
          maxLength="10"
          className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
        />
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
          required
        />

        <input
  name="date"
  type="date"
  value={form.date}
  onChange={handleChange}
  className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
  required
/>
        

        {/* <SelectWithOther
          label="Chanda Type"
          options={CHANDA_TYPES}
          value={form.chandaType}
          onChange={(val) => setForm({ ...form, chandaType: val })}
        /> */}
        <SelectWithOther
          label="Payment Mode"
          options={PAYMENT_MODES}
          value={form.paymentMode}
          onChange={(val) => setForm({ ...form, paymentMode: val })}
        />


        <input
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
        />

        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-orange-700 text-white rounded-md py-2 text-sm font-medium hover:bg-orange-800">
            {editingId ? 'Update Chanda' : 'Add Chanda'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="flex-1 bg-gray-200 text-gray-700 rounded-md py-2 text-sm font-medium hover:bg-gray-300">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="flex gap-2 mb-4">
        <input
          placeholder="Search by devotee name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm flex-1"
        />
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Years</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Desktop: table */}
      <table className="w-full bg-white rounded-lg shadow-sm text-sm hidden md:table">
        <thead className="bg-orange-50 text-orange-800">
          <tr>
            <th className="text-left p-3">#</th>
            <th className="text-left p-3">Date</th>
            <th className="text-left p-3">Devotee</th>
            <th className="text-left p-3">Phone</th>
            {/* <th className="text-left p-3">Type</th> */}
            <th className="text-left p-3">Payment</th>
            <th className="text-left p-3">Amount</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {chandas.map((c, index) => (
            <tr key={c._id} className="border-t">
              <td className="p-3 text-gray-500">{index + 1}</td>
              <td className="p-3">{new Date(c.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
              <td className="p-3">{c.devoteeName}</td>
              <td className="p-3">{c.devoteePhone}</td>
              {/* <td className="p-3">{c.chandaType.value === 'Other' ? c.chandaType.customValue : c.chandaType.value}</td> */}
              <td className="p-3">{c.paymentMode.value === 'Other' ? c.paymentMode.customValue : c.paymentMode.value}</td>
              <td className="p-3">₹{c.amount.toLocaleString('en-IN')}</td>
              <td className="p-3 flex gap-3">
                <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800" title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(c._id)} className="text-red-600 hover:text-red-800" title="Delete">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile: cards */}
      <div className="md:hidden flex flex-col gap-3">
        {chandas.map((c, index) => (
          <div key={c._id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-gray-400">#{index + 1}</p>
                <p className="font-medium text-gray-800">{c.devoteeName}</p>
                <p className="text-xs text-gray-500">{c.devoteePhone}</p>
              </div>
              <p className="font-bold text-orange-700">₹{c.amount.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              {/* <span>{c.chandaType.value === 'Other' ? c.chandaType.customValue : c.chandaType.value}</span> */}
              <span>{c.paymentMode.value === 'Other' ? c.paymentMode.customValue : c.paymentMode.value}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {new Date(c.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </span>
              <div className="flex gap-3">
                <button onClick={() => handleEdit(c)} className="text-blue-600" title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(c._id)} className="text-red-600" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}