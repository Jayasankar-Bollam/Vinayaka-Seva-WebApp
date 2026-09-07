// client/src/pages/DailyEventPage.jsx
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import SelectWithOther from '../components/SelectWithOther';
import { Pencil, Trash2 } from 'lucide-react';
import FadeInOnScroll from '../components/FadeInOnScroll';

const EVENT_TYPES = ['Deeparadhana', 'Mangala Harathi', 'Bajana', 'Tug of War', 'Kabaddi'];

const EMPTY_FORM = {
  eventType: { value: '' },
  date: new Date().toISOString().split('T')[0],
  budget: '',
  description: '',
  notes: '',
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [];
for (let y = CURRENT_YEAR + 10; y >= CURRENT_YEAR - 2; y--) {
  YEAR_OPTIONS.push(y);
}

export default function DailyEventPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const formRef = useRef(null);

  const [year, setYear] = useState('');

async function fetchEvents() {
  const res = await api.get('/daily-events', { params: { year: year || undefined } });
  setEvents(res.data);
}

useEffect(() => {
  fetchEvents();
}, [year]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEdit(event) {
    setEditingId(event._id);
    setForm({
      eventType: event.eventType,
      date: new Date(event.date).toISOString().split('T')[0],
      budget: event.budget || '',
      description: event.description || '',
      notes: event.notes || '',
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/daily-events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/daily-events/${editingId}`, form);
        toast.success('Event updated');
      } else {
        await api.post('/daily-events', form);
        toast.success('Event added');
      }
      setEditingId(null);
      setForm(EMPTY_FORM);
      fetchEvents();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save event';
      setError(message);
      toast.error(message);
    }
  }

  async function downloadReport() {
    try {
      const now = new Date();
      const res = await api.get('/reports/daily-events', {
        params: { year: now.getFullYear(), month: now.getMonth() + 1 },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `events-report-${now.getFullYear()}-${now.getMonth() + 1}.pdf`);
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
        <h2 className="text-xl font-bold text-orange-700">Daily Events</h2>
        <button
          onClick={downloadReport}
          className="bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-800"
        >
          Download PDF
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm mb-6 max-w-md">
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <SelectWithOther
          label="Event Type"
          options={EVENT_TYPES}
          value={form.eventType}
          onChange={(val) => setForm({ ...form, eventType: val })}
        />

        <input
  name="date"
  type="date"
  value={form.date}
  onChange={handleChange}
  className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
  required
/>

        <input
          name="budget"
          type="number"
          placeholder="Budget (optional)"
          value={form.budget}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
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
            {editingId ? 'Update Event' : 'Add Event'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="flex-1 bg-gray-200 text-gray-700 rounded-md py-2 text-sm font-medium hover:bg-gray-300">
              Cancel
            </button>
          )}
        </div>
      </form>
      
       <div className="flex justify-end mb-4">
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
            <th className="text-left p-3">Event Type</th>
            <th className="text-left p-3">Budget</th>
            <th className="text-left p-3">Description</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev, index) => (
            <tr key={ev._id} className="border-t">
              <td className="p-3 text-gray-500">{index + 1}</td>
              <td className="p-3">{new Date(ev.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
              <td className="p-3">{ev.eventType.value === 'Other' ? ev.eventType.customValue : ev.eventType.value}</td>
              <td className="p-3">{ev.budget ? `₹${ev.budget.toLocaleString('en-IN')}` : '—'}</td>
              <td className="p-3">{ev.description}</td>
              <td className="p-3 flex gap-3">
                <button onClick={() => handleEdit(ev)} className="text-blue-600 hover:text-blue-800" title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(ev._id)} className="text-red-600 hover:text-red-800" title="Delete">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile: cards */}
      <div className="md:hidden flex flex-col gap-3">
        {events.map((ev, index) => (
          <FadeInOnScroll key={ev._id}>
          <div key={ev._id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-gray-400">#{index + 1}</p>
                <p className="font-medium text-gray-800">
                  {ev.eventType.value === 'Other' ? ev.eventType.customValue : ev.eventType.value}
                </p>
                {ev.description && <p className="text-xs text-gray-500">{ev.description}</p>}
              </div>
              <p className="font-bold text-orange-700">
                {ev.budget ? `₹${ev.budget.toLocaleString('en-IN')}` : '—'}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {new Date(ev.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </span>
              <div className="flex gap-3">
                <button onClick={() => handleEdit(ev)} className="text-blue-600" title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(ev._id)} className="text-red-600" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
          </FadeInOnScroll>
        ))}
      </div>
    </div>
  );
}