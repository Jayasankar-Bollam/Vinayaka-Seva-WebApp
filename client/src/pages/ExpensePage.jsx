// client/src/pages/ExpensePage.jsx
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import SelectWithOther from "../components/SelectWithOther";
import { Pencil, Trash2, FileText, ExternalLink } from "lucide-react";
import FadeInOnScroll from "../components/FadeInOnScroll";

const CATEGORIES = [
  "Pooja Items",
  "Lighting/Deepam",
  "Flowers",
  "Prasadam",
  "Maintenance",
];
// const PURPOSES = ["Oil", "Camphor", "Flowers", "Decoration", "Electricity"];
const PAYMENT_MODES = ["Cash", "PhonePe", "GPay", "Bank Transfer"];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [];
for (let y = CURRENT_YEAR + 10; y >= CURRENT_YEAR - 2; y--) {
  YEAR_OPTIONS.push(y);
}

const EMPTY_FORM = {
  amount: "",
  date: new Date().toISOString().split("T")[0],
  category: { value: "" },
  // purpose: { value: "" },
  paymentMode: { value: "" },
  notes: "",
};

export default function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [year, setYear] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [existingReceiptUrl, setExistingReceiptUrl] = useState(null);
  const formRef = useRef(null);
  const receiptInputRef = useRef(null);

  async function fetchExpenses() {
    const res = await api.get("/expenses", {
      params: { year: year || undefined },
    });
    setExpenses(res.data);
  }

  useEffect(() => {
    fetchExpenses();
  }, [year]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleReceiptChange(e) {
    setReceiptFile(e.target.files[0] || null);
  }

  function handleEdit(expense) {
    setEditingId(expense._id);
    setForm({
      amount: expense.amount,
      date: new Date(expense.date).toISOString().split("T")[0],
      category: expense.category,
      // purpose: expense.purpose,
      paymentMode: expense.paymentMode,
      notes: expense.notes || "",
    });
    setExistingReceiptUrl(expense.receiptUrl || null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setReceiptFile(null);
    setExistingReceiptUrl(null);
    if (receiptInputRef.current) {
      receiptInputRef.current.value = "";
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this expense entry?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Expense deleted");
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("amount", form.amount);
    formData.append("date", form.date);
    formData.append("category", JSON.stringify(form.category));
    // formData.append("purpose", JSON.stringify(form.purpose));
    formData.append("paymentMode", JSON.stringify(form.paymentMode));
    formData.append("notes", form.notes);
    if (receiptFile) {
      formData.append("receipt", receiptFile);
    }

    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, formData);
        toast.success("Expense updated");
      } else {
        await api.post("/expenses", formData);
        toast.success("Expense added");
      }
      setEditingId(null);
      setForm(EMPTY_FORM);
      setReceiptFile(null);
      setExistingReceiptUrl(null);
      if (receiptInputRef.current) {
        receiptInputRef.current.value = "";
      }
      fetchExpenses();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to save expense";
      setError(message);
      toast.error(message);
    }
  }

  async function downloadReport() {
    try {
      const now = new Date();
      const res = await api.get("/reports/expense", {
        params: { year: now.getFullYear() },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `expense-report-${now.getFullYear()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Report downloaded");
    } catch (err) {
      toast.error("Failed to download report");
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-orange-700">Expense Entries</h2>
        <button
          onClick={downloadReport}
          className="bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-800"
        >
          Download PDF
        </button>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-lg shadow-sm mb-6 max-w-md"
      >
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

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

        <SelectWithOther
          label="Category"
          options={CATEGORIES}
          value={form.category}
          onChange={(val) => setForm({ ...form, category: val })}
        />
        <SelectWithOther
          label="Purpose"
          options={PURPOSES}
          value={form.purpose}
          onChange={(val) => setForm({ ...form, purpose: val })}
        />
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

        <div className="mb-3">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Receipt (optional)
          </label>
          {existingReceiptUrl && !receiptFile && (
            <p className="text-xs text-gray-500 mb-1">
              Current:{" "}
              <a
                href={existingReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View existing receipt
              </a>{" "}
              — choosing a new file will replace it
            </p>
          )}
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp, application/pdf"
            onChange={handleReceiptChange}
            ref={receiptInputRef}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-orange-700 text-white rounded-md py-2 text-sm font-medium hover:bg-orange-800"
          >
            {editingId ? "Update Expense" : "Add Expense"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 bg-gray-200 text-gray-700 rounded-md py-2 text-sm font-medium hover:bg-gray-300"
            >
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
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: table */}
      <table className="w-full bg-white rounded-lg shadow-sm text-sm hidden md:table">
        <thead className="bg-orange-50 text-orange-800">
          <tr>
            <th className="text-left p-3">#</th>
            <th className="text-left p-3">Date</th>
            <th className="text-left p-3">Category</th>
            {/* <th className="text-left p-3">Purpose</th> */}
            <th className="text-left p-3">Payment</th>
            <th className="text-left p-3">Amount</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e, index) => (
            <tr key={e._id} className="border-t">
              <td className="p-3 text-gray-500">{index + 1}</td>
              <td className="p-3">
                {new Date(e.date).toLocaleDateString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}
              </td>
              <td className="p-3">
                {e.category.value === "Other"
                  ? e.category.customValue
                  : e.category.value}
              </td>
              <td className="p-3">
                {e.purpose.value === "Other"
                  ? e.purpose.customValue
                  : e.purpose.value}
              </td>
              <td className="p-3">
                {e.paymentMode.value === "Other"
                  ? e.paymentMode.customValue
                  : e.paymentMode.value}
              </td>
              <td className="p-3">
                ₹{e.amount.toLocaleString("en-IN")}
                {e.receiptUrl && (
                  <a
                    href={e.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs mt-1"
                  >
                    <FileText size={14} />
                    Receipt
                  </a>
                )}
              </td>
              <td className="p-3 flex gap-3">
                <button
                  onClick={() => handleEdit(e)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(e._id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile: cards */}
      <div className="md:hidden flex flex-col gap-3">
        {expenses.map((e, index) => (
          <FadeInOnScroll key={e._id}>
            <div className="bg-white rounded-lg shadow-sm p-4 transition-transform duration-200 hover:scale-105 active:scale-95">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-gray-400">#{index + 1}</p>
                  <p className="font-medium text-gray-800">
                    {e.category.value === "Other"
                      ? e.category.customValue
                      : e.category.value}
                  </p>
                  {/* <p className="text-xs text-gray-500">
                    {e.purpose.value === "Other"
                      ? e.purpose.customValue
                      : e.purpose.value}
                  </p> */}
                </div>
                <p className="font-bold text-orange-700">
                  ₹{e.amount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>
                  {e.paymentMode.value === "Other"
                    ? e.paymentMode.customValue
                    : e.paymentMode.value}
                </span>
                {e.notes && (
                  <span className="text-gray-400 italic">{e.notes}</span>
                )}
              </div>
              {e.receiptUrl && (
                <a
                  href={e.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs mb-2 hover:bg-blue-100"
                >
                  <FileText size={14} />
                  Receipt
                  <ExternalLink size={12} />
                </a>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {new Date(e.date).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(e)}
                    className="text-blue-600"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(e._id)}
                    className="text-red-600"
                    title="Delete"
                  >
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
