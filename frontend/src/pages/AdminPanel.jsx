import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import UniversityCard from "../components/UniversityCard";

export default function AdminPanel() {
  const { user } = useAuth();
  const [unis, setUnis] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingUniversityId, setEditingUniversityId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    city: "",
    programs: "",
    min_fee: 0,
    max_fee: 0,
    merit: 50,
    type: "Private",
    tier: 1,
    is_scholarships: false,
    is_admission_open: true,
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [unisRes, usersRes] = await Promise.all([
        api.get("/admin/universities"),
        api.get("/admin/users"),
      ]);
      setUnis(unisRes.data);
      setUsers(usersRes.data);
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load admin data");
    }
  };

  const resetForm = () => {
    setEditingUniversityId(null);
    setForm({
      name: "",
      city: "",
      programs: "",
      min_fee: 0,
      max_fee: 0,
      merit: 50,
      type: "Private",
      tier: 1,
      is_scholarships: false,
      is_admission_open: true,
    });
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const saveUniversity = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");
    try {
      const payload = {
        ...form,
        min_fee: Number(form.min_fee),
        max_fee: Number(form.max_fee),
        merit: Number(form.merit),
        tier: Number(form.tier),
        programs: form.programs.split(",").map((s) => s.trim()),
      };

      if (editingUniversityId) {
        await api.put(`/admin/universities/${editingUniversityId}`, payload);
        setStatus("University updated successfully");
      } else {
        await api.post("/admin/universities", payload);
        setStatus("University added successfully");
      }
      resetForm();
      await fetchAll();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to save university");
    }
  };

  const onEditUniversity = (uni) => {
    setEditingUniversityId(uni.id);
    setForm({
      name: uni.name,
      city: uni.city,
      programs: uni.programs.join(", "),
      min_fee: uni.min_fee,
      max_fee: uni.max_fee,
      merit: uni.merit,
      type: uni.type,
      tier: uni.tier,
      is_scholarships: uni.is_scholarships,
      is_admission_open: uni.is_admission_open,
    });
  };

  const onDeleteUniversity = async (id) => {
    if (!window.confirm("Delete this university?")) return;
    setError("");
    setStatus("");
    try {
      await api.delete(`/admin/universities/${id}`);
      setStatus("University deleted successfully");
      await fetchAll();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to delete university");
    }
  };

  const onUpdateUserRole = async (id, role) => {
    setError("");
    setStatus("");
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setStatus("User role updated successfully");
      await fetchAll();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to update user role");
    }
  };

  const onDeleteUser = async (id) => {
    if (!window.confirm("Delete this user account?")) return;
    setError("");
    setStatus("");
    try {
      await api.delete(`/admin/users/${id}`);
      setStatus("User deleted successfully");
      await fetchAll();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to delete user");
    }
  };

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="mt-2 text-sm text-slate-600">Manage universities and users.</p>
          {status ? <p className="mt-2 text-sm text-green-700">{status}</p> : null}
          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
            <h3 className="text-xl font-semibold">
              {editingUniversityId ? "Edit University" : "Add University"}
            </h3>

          <form className="mt-4 space-y-3" onSubmit={saveUniversity}>
            <input name="name" value={form.name} onChange={onChange} placeholder="University name" className="w-full rounded-md border px-3 py-2" />
            <input name="city" value={form.city} onChange={onChange} placeholder="City" className="w-full rounded-md border px-3 py-2" />
            <input name="programs" value={form.programs} onChange={onChange} placeholder="Programs (comma separated)" className="w-full rounded-md border px-3 py-2" />
            <input name="min_fee" value={form.min_fee} onChange={onChange} type="number" placeholder="Min fee (PKR)" className="w-full rounded-md border px-3 py-2" />
            <input name="max_fee" value={form.max_fee} onChange={onChange} type="number" placeholder="Max fee (PKR)" className="w-full rounded-md border px-3 py-2" />
            <input name="merit" value={form.merit} onChange={onChange} type="number" placeholder="Merit (1-100)" className="w-full rounded-md border px-3 py-2" />
            <select name="tier" value={form.tier} onChange={onChange} className="w-full rounded-md border px-3 py-2">
              <option value={1}>Tier 1</option>
              <option value={2}>Tier 2</option>
              <option value={3}>Tier 3</option>
            </select>
            <select name="type" value={form.type} onChange={onChange} className="w-full rounded-md border px-3 py-2">
              <option>Private</option>
              <option>Government</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_scholarships"
                checked={form.is_scholarships}
                onChange={onChange}
              />
              Scholarships Available
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_admission_open"
                checked={form.is_admission_open}
                onChange={onChange}
              />
              Admission Open
            </label>
            <button className="w-full rounded-md bg-brand-600 px-4 py-2 text-white">
              {editingUniversityId ? "Update University" : "Add University"}
            </button>
            {editingUniversityId ? (
              <button type="button" onClick={resetForm} className="w-full rounded-md border px-4 py-2">
                Cancel Edit
              </button>
            ) : null}
          </form>
        </div>

        <div className="md:col-span-2 grid gap-4">
          {unis.length === 0 ? <p className="text-sm text-slate-600">No universities yet.</p> : null}
          {unis.map((u) => (
            <div key={u.id} className="space-y-2 rounded-lg border p-3">
              <UniversityCard uni={u} />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEditUniversity(u)}
                  className="rounded-md border px-3 py-1 text-sm"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteUniversity(u.id)}
                  className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="text-xl font-semibold">User Management</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="py-2 pr-4">{u.full_name}</td>
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4 capitalize">{u.role}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.role}
                          onChange={(e) => onUpdateUserRole(u.id, e.target.value)}
                          className="rounded-md border px-2 py-1"
                          disabled={u.id === user?.id}
                        >
                          <option value="student">student</option>
                          <option value="admin">admin</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => onDeleteUser(u.id)}
                          className="rounded-md border border-red-300 px-3 py-1 text-red-700 disabled:opacity-50"
                          disabled={u.id === user?.id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
