import { useEffect, useMemo, useState } from "react";
import UniversityCard from "../../components/UniversityCard";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { createUniversity, deleteUniversity, getAdminUniversities, updateUniversity } from "../../services/adminService";

const emptyForm = {
  name: "",
  city: "",
  programs: "",
  min_fee: "",
  max_fee: "",
  merit: "",
  type: "Private",
  tier: 1,
  is_scholarships: false,
  is_admission_open: true,
};

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export default function AdminUniversitiesPage() {
  const [unis, setUnis] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminUniversities();
      setUnis(data);
    } catch (e) {
      setError(e?.response?.data?.detail || "Catalog could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return unis;
    return unis.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.city || "").toLowerCase().includes(q) ||
        (u.programs || []).some((p) => (p || "").toLowerCase().includes(q))
    );
  }, [unis, query]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (uni) => {
    setEditingId(uni.id);
    setForm({
      name: uni.name,
      city: uni.city,
      programs: uni.programs.join(", "),
      min_fee: String(uni.min_fee),
      max_fee: String(uni.max_fee),
      merit: String(uni.merit),
      type: uni.type,
      tier: uni.tier,
      is_scholarships: uni.is_scholarships,
      is_admission_open: uni.is_admission_open,
    });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");

    const programs = form.programs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (programs.length === 0) {
      setError("Provide at least one program name, separated by commas.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      city: form.city.trim(),
      programs,
      min_fee: Number(form.min_fee),
      max_fee: Number(form.max_fee),
      merit: Number(form.merit),
      type: form.type,
      tier: Number(form.tier),
      is_scholarships: Boolean(form.is_scholarships),
      is_admission_open: Boolean(form.is_admission_open),
    };

    try {
      if (editingId) {
        await updateUniversity(editingId, payload);
        setStatus("Catalog record updated.");
      } else {
        await createUniversity(payload);
        setStatus("Catalog record created.");
      }
      closeModal();
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Save operation failed.");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Remove this institution from the catalog?")) return;
    setStatus("");
    setError("");
    try {
      await deleteUniversity(id);
      setStatus("Catalog record removed.");
      if (editingId === id) closeModal();
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Deletion failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-600">Loading catalog…</p>
      </div>
    );
  }

  const formBody = (
    <form id="uni-catalog-form" onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="m_name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Institution name
        </label>
        <input
          id="m_name"
          name="name"
          value={form.name}
          onChange={onChange}
          required
          className={fieldClass}
          placeholder="e.g. National University of Sciences and Technology"
        />
      </div>

      <div>
        <label htmlFor="m_city" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Campus city
        </label>
        <input id="m_city" name="city" value={form.city} onChange={onChange} required className={fieldClass} placeholder="e.g. Islamabad" />
      </div>

      <div>
        <label htmlFor="m_programs" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Programs (comma-separated)
        </label>
        <textarea
          id="m_programs"
          name="programs"
          value={form.programs}
          onChange={onChange}
          rows={3}
          required
          className={`${fieldClass} resize-y`}
          placeholder="Computer Science, Software Engineering"
        />
        <p className="mt-1 text-xs text-slate-500">Program labels must align with assessment form options for matching.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="m_min_fee" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Minimum annual fee (PKR)
          </label>
          <input
            id="m_min_fee"
            name="min_fee"
            type="number"
            min={0}
            step={1000}
            value={form.min_fee}
            onChange={onChange}
            required
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="m_max_fee" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Maximum annual fee (PKR)
          </label>
          <input
            id="m_max_fee"
            name="max_fee"
            type="number"
            min={0}
            step={1000}
            value={form.max_fee}
            onChange={onChange}
            required
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="m_merit" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Merit index (1–100)
        </label>
        <input
          id="m_merit"
          name="merit"
          type="number"
          min={1}
          max={100}
          step={0.1}
          value={form.merit}
          onChange={onChange}
          required
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-slate-500">Compared against learner composite readiness from assessments.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="m_tier" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Catalog tier
          </label>
          <select id="m_tier" name="tier" value={form.tier} onChange={onChange} className={fieldClass}>
            <option value={1}>Tier I</option>
            <option value={2}>Tier II</option>
            <option value={3}>Tier III</option>
          </select>
        </div>
        <div>
          <label htmlFor="m_type" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sector
          </label>
          <select id="m_type" name="type" value={form.type} onChange={onChange} className={fieldClass}>
            <option value="Private">Private</option>
            <option value="Government">Government</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50/80 p-4">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            name="is_scholarships"
            checked={form.is_scholarships}
            onChange={onChange}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
          />
          Financial aid programs available
        </label>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            name="is_admission_open"
            checked={form.is_admission_open}
            onChange={onChange}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
          />
          Admissions cycle open
        </label>
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </form>
  );

  const modalFooter = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button type="button" variant="secondary" onClick={closeModal}>
        Cancel
      </Button>
      <Button type="submit" form="uni-catalog-form">
        {editingId ? "Save record" : "Create record"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Administration</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-slate-900 md:text-3xl">Institution catalog</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Maintain the canonical list of institutions, programs, fee bands, and operational flags consumed by eligibility
            assessments.
          </p>
          {status ? <p className="mt-2 text-sm font-medium text-emerald-700">{status}</p> : null}
          {error && !modalOpen ? <p className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}
        </div>
        <Button type="button" onClick={openCreate} className="shrink-0 self-start">
          Add institution
        </Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="catalog-search" className="sr-only">
          Search catalog
        </label>
        <input
          id="catalog-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name, city, or program…"
          className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />
        <p className="text-xs text-slate-500">
          {filtered.length} of {unis.length} records
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-sm text-slate-600">
          {error && unis.length === 0
            ? "The catalog could not be loaded. Check your connection and try again from the administration menu."
            : unis.length === 0
              ? "No catalog records yet. Add an institution to begin."
              : "No records match your filter."}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((uni) => (
            <div key={uni.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <UniversityCard uni={uni} />
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                <Button type="button" variant="secondary" className="flex-1 text-xs" onClick={() => openEdit(uni)}>
                  Edit record
                </Button>
                <Button type="button" variant="danger" className="flex-1 text-xs" onClick={() => onDelete(uni.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? "Edit catalog record" : "New catalog record"}
        description="All fields are validated before persistence. Tier metadata should align with your internal classification policy."
        footer={modalFooter}
      >
        {formBody}
      </Modal>
    </div>
  );
}
