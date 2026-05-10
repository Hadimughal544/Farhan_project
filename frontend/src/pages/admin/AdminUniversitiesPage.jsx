import { useEffect, useState } from "react";
import UniversityCard from "../../components/UniversityCard";
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

export default function AdminUniversitiesPage() {
  const [unis, setUnis] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
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
      setError(e?.response?.data?.detail || "Failed to load universities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
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
      setError("Add at least one program (comma-separated).");
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
        setStatus("University updated successfully.");
      } else {
        await createUniversity(payload);
        setStatus("University added successfully.");
      }
      reset();
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not save university.");
    }
  };

  const onEdit = (uni) => {
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this university?")) return;
    setStatus("");
    setError("");
    try {
      await deleteUniversity(id);
      setStatus("University removed.");
      if (editingId === id) reset();
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to delete.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-600">Loading universities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Universities</h1>
        <p className="mt-1 text-sm text-slate-600">
          Maintain the catalog students see after prediction. Tier should match how strongly the institution aligns with
          High / Medium / Low admission chances.
        </p>
        {status ? <p className="mt-2 text-sm text-emerald-700">{status}</p> : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </header>

      <div className="grid gap-8 lg:grid-cols-5">
        <form
          onSubmit={onSubmit}
          className="lg:col-span-2 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Edit university" : "Add university"}
          </h2>

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              University name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="e.g. FAST NUCES"
            />
          </div>

          <div>
            <label htmlFor="city" className="mb-1 block text-sm font-medium text-slate-700">
              City
            </label>
            <input
              id="city"
              name="city"
              value={form.city}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="e.g. Karachi"
            />
          </div>

          <div>
            <label htmlFor="programs" className="mb-1 block text-sm font-medium text-slate-700">
              Programs (comma-separated)
            </label>
            <textarea
              id="programs"
              name="programs"
              value={form.programs}
              onChange={onChange}
              rows={3}
              required
              className="w-full resize-y rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="Computer Science, Software Engineering"
            />
            <p className="mt-1 text-xs text-slate-500">Names must match the prediction form options for matching.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="min_fee" className="mb-1 block text-sm font-medium text-slate-700">
                Minimum fee (PKR)
              </label>
              <input
                id="min_fee"
                name="min_fee"
                type="number"
                min={0}
                step={1000}
                value={form.min_fee}
                onChange={onChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label htmlFor="max_fee" className="mb-1 block text-sm font-medium text-slate-700">
                Maximum fee (PKR)
              </label>
              <input
                id="max_fee"
                name="max_fee"
                type="number"
                min={0}
                step={1000}
                value={form.max_fee}
                onChange={onChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="merit" className="mb-1 block text-sm font-medium text-slate-700">
              Merit cutoff (1–100)
            </label>
            <input
              id="merit"
              name="merit"
              type="number"
              min={1}
              max={100}
              step={0.1}
              value={form.merit}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <p className="mt-1 text-xs text-slate-500">
              Compared against the student eligibility score from the predictor (same 0–100 scale).
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="tier" className="mb-1 block text-sm font-medium text-slate-700">
                Tier
              </label>
              <select
                id="tier"
                name="tier"
                value={form.tier}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value={1}>1 — shown when prediction is High</option>
                <option value={2}>2 — shown when prediction is Medium</option>
                <option value={3}>3 — shown when prediction is Low</option>
              </select>
            </div>
            <div>
              <label htmlFor="type" className="mb-1 block text-sm font-medium text-slate-700">
                Institution type
              </label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              >
                <option value="Private">Private</option>
                <option value="Government">Government</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                name="is_scholarships"
                checked={form.is_scholarships}
                onChange={onChange}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Scholarships available
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                name="is_admission_open"
                checked={form.is_admission_open}
                onChange={onChange}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Admission currently open
            </label>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              {editingId ? "Save changes" : "Add to catalog"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={reset}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Catalog ({unis.length})</h2>
          {unis.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
              No universities yet. Add one using the form.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {unis.map((uni) => (
                <div key={uni.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <UniversityCard uni={uni} />
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(uni)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(uni.id)}
                      className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
