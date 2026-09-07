// client/src/pages/VideoPage.jsx
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import SelectWithOther from '../components/SelectWithOther';
import { Pencil, Trash2 } from 'lucide-react';
import FadeInOnScroll from '../components/FadeInOnScroll';

const CATEGORIES = ['Festival', 'Daily Ritual', 'Special Event'];

const EMPTY_FORM = {
  title: '',
  url: '',
  year: new Date().getFullYear(),
  category: { value: '' },
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [];
for (let y = CURRENT_YEAR + 10; y >= CURRENT_YEAR - 5; y--) {
  YEAR_OPTIONS.push(y);
}

export default function VideoPage() {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const formRef = useRef(null);

 const [filterYear, setFilterYear] = useState('');

async function fetchVideos() {
  const res = await api.get('/videos', { params: { year: filterYear || undefined } });
  setVideos(res.data);
}

useEffect(() => {
  fetchVideos();
}, [filterYear]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEdit(video) {
    setEditingId(video._id);
    setForm({
      title: video.title,
      url: video.url,
      year: video.year,
      category: video.category,
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this video?')) return;
    try {
      await api.delete(`/videos/${id}`);
      toast.success('Video deleted');
      fetchVideos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/videos/${editingId}`, form);
        toast.success('Video updated');
      } else {
        await api.post('/videos', form);
        toast.success('Video added');
      }
      setEditingId(null);
      setForm(EMPTY_FORM);
      fetchVideos();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save video';
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-orange-700 mb-4">Videos</h2>

      <form ref={formRef} onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm mb-6 max-w-md">
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
          required
        />
        <input
          name="url"
          placeholder="URL"
          value={form.url}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
          required
        />
        <input
          name="year"
          type="number"
          placeholder="Year"
          value={form.year}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
          required
        />

        <SelectWithOther
          label="Category"
          options={CATEGORIES}
          value={form.category}
          onChange={(val) => setForm({ ...form, category: val })}
        />

        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-orange-700 text-white rounded-md py-2 text-sm font-medium hover:bg-orange-800">
            {editingId ? 'Update Video' : 'Add Video'}
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
    value={filterYear}
    onChange={(e) => setFilterYear(e.target.value)}
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
            <th className="text-left p-3">Year</th>
            <th className="text-left p-3">Title</th>
            <th className="text-left p-3">Category</th>
            <th className="text-left p-3">Link</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((v, index) => (
            <tr key={v._id} className="border-t">
              <td className="p-3 text-gray-500">{index + 1}</td>
              <td className="p-3">{v.year}</td>
              <td className="p-3">{v.title}</td>
              <td className="p-3">{v.category.value === 'Other' ? v.category.customValue : v.category.value}</td>
              <td className="p-3">
                <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Watch
                </a>
              </td>
              <td className="p-3 flex gap-3">
                <button onClick={() => handleEdit(v)} className="text-blue-600 hover:text-blue-800" title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(v._id)} className="text-red-600 hover:text-red-800" title="Delete">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile: cards */}
      <div className="md:hidden flex flex-col gap-3">
        {videos.map((v, index) => (
           <FadeInOnScroll key={v._id}>
          <div key={v._id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs text-gray-400">#{index + 1}</p>
                <p className="font-medium text-gray-800">{v.title}</p>
                <p className="text-xs text-gray-500">
                  {v.category.value === 'Other' ? v.category.customValue : v.category.value}
                </p>
              </div>
              <p className="text-sm text-gray-500">{v.year}</p>
            </div>
            <div className="flex justify-between items-center">
              <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                Watch
              </a>
              <div className="flex gap-3">
                <button onClick={() => handleEdit(v)} className="text-blue-600" title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(v._id)} className="text-red-600" title="Delete">
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