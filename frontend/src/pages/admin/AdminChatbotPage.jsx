import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import {
  createChatbotKnowledgeEntry,
  deleteChatbotKnowledgeEntry,
  getChatbotKnowledgeBase,
  updateChatbotKnowledgeEntry,
} from "../../services/chatbotService";

const emptyForm = {
  question: "",
  answer: "",
  category: "general",
  keywords: "",
  display_order: 0,
  is_active: true,
};

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export default function AdminChatbotPage() {
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const loadEntries = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getChatbotKnowledgeBase();
      setEntries(data);
    } catch (e) {
      setError(e?.response?.data?.detail || "Knowledge base could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (entry) =>
        (entry.question || "").toLowerCase().includes(q) ||
        (entry.answer || "").toLowerCase().includes(q) ||
        (entry.category || "").toLowerCase().includes(q) ||
        (entry.keywords || []).some((k) => (k || "").toLowerCase().includes(q))
    );
  }, [entries, query]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (entry) => {
    setEditingId(entry.id);
    setForm({
      question: entry.question,
      answer: entry.answer,
      category: entry.category,
      keywords: (entry.keywords || []).join(", "),
      display_order: entry.display_order,
      is_active: entry.is_active,
    });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(false);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      category: form.category.trim().toLowerCase(),
      keywords: form.keywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      display_order: Number(form.display_order),
      is_active: Boolean(form.is_active),
    };

    try {
      if (editingId) {
        await updateChatbotKnowledgeEntry(editingId, payload);
        toast.success("Knowledge entry updated.");
      } else {
        await createChatbotKnowledgeEntry(payload);
        toast.success("Knowledge entry created.");
      }
      closeModal();
      await loadEntries();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not save this entry.");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this chatbot knowledge entry?")) return;
    try {
      await deleteChatbotKnowledgeEntry(id);
      toast.success("Knowledge entry removed.");
      await loadEntries();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not delete the entry.");
    }
  };

  const onToggleStatus = async (entry) => {
    try {
      await updateChatbotKnowledgeEntry(entry.id, { is_active: !entry.is_active });
      toast.success(entry.is_active ? "Entry disabled." : "Entry enabled.");
      await loadEntries();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Status update failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-600">Loading chatbot knowledge base...</p>
      </div>
    );
  }

  const modalFooter = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button type="button" variant="secondary" onClick={closeModal}>
        Cancel
      </Button>
      <Button type="submit" form="chatbot-kb-form">
        {editingId ? "Save entry" : "Create entry"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Administration</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-slate-900 md:text-3xl">Chatbot knowledge base</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage approved support answers used by the website assistant. The chatbot responds only with active knowledge
            base content and strict scope policies.
          </p>
          {error && !modalOpen ? <p className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}
        </div>
        <Button type="button" onClick={openCreate} className="shrink-0 self-start">
          Add entry
        </Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by question, answer, category, or keyword..."
          className="w-full max-w-xl rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />
        <p className="text-xs text-slate-500">
          {filtered.length} of {entries.length} entries
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-sm text-slate-600">
          {entries.length === 0
            ? "No knowledge entries found. Add your first support answer."
            : "No entries match your current filter."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/90">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold text-slate-700">Question</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Category</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Keywords</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Order</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-100 align-top transition-colors last:border-0 hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{entry.question}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">{entry.answer}</p>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-700">{entry.category}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{(entry.keywords || []).join(", ") || "-"}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">{entry.display_order}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                          entry.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {entry.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        <Button type="button" variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => openEdit(entry)}>
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => onToggleStatus(entry)}
                        >
                          {entry.is_active ? "Disable" : "Enable"}
                        </Button>
                        <Button type="button" variant="danger" className="px-3 py-1.5 text-xs" onClick={() => onDelete(entry.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? "Edit chatbot entry" : "Create chatbot entry"}
        description="Only approved support content should be added. The chatbot will not produce unrestricted answers."
        footer={modalFooter}
      >
        <form id="chatbot-kb-form" onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="kb-question" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              User question
            </label>
            <input
              id="kb-question"
              name="question"
              value={form.question}
              onChange={onChange}
              required
              className={fieldClass}
              placeholder="e.g. How does the assessment work?"
            />
          </div>

          <div>
            <label htmlFor="kb-answer" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Approved answer
            </label>
            <textarea
              id="kb-answer"
              name="answer"
              value={form.answer}
              onChange={onChange}
              rows={6}
              required
              className={`${fieldClass} resize-y`}
              placeholder="Provide professional, concise support guidance for this platform."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="kb-category" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </label>
              <input id="kb-category" name="category" value={form.category} onChange={onChange} required className={fieldClass} />
            </div>
            <div>
              <label htmlFor="kb-display-order" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Display order
              </label>
              <input
                id="kb-display-order"
                name="display_order"
                type="number"
                min={0}
                value={form.display_order}
                onChange={onChange}
                required
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="kb-keywords" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Keywords (comma-separated)
            </label>
            <input
              id="kb-keywords"
              name="keywords"
              value={form.keywords}
              onChange={onChange}
              className={fieldClass}
              placeholder="assessment, prediction, profile"
            />
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={onChange}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            />
            Entry is active and available for chatbot responses
          </label>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
        </form>
      </Modal>
    </div>
  );
}
