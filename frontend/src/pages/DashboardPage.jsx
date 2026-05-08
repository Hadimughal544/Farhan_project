import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../hooks/useAuth";

const quickStatsSeed = [
  { label: "Profile completion", value: "92%", subtitle: "Almost done" },
  { label: "Applications tracked", value: "7", subtitle: "2 pending actions" },
  { label: "Shortlisted universities", value: "4", subtitle: "Best-fit options" },
  { label: "Upcoming deadlines", value: "3", subtitle: "Next: 18 days left" },
];

const upcomingTasks = [
  {
    title: "Finalize statement of purpose",
    due: "Due in 2 days",
    status: "High priority",
    statusClass: "bg-rose-100 text-rose-700",
  },
  {
    title: "Upload latest transcript",
    due: "Due in 5 days",
    status: "In progress",
    statusClass: "bg-amber-100 text-amber-700",
  },
  {
    title: "Verify recommendation contacts",
    due: "Due in 8 days",
    status: "Ready",
    statusClass: "bg-emerald-100 text-emerald-700",
  },
];

const recentActivity = [
  "Profile details updated successfully",
  "AI shortlist refreshed with latest preferences",
  "Reminder sent for IELTS score submission",
  "New scholarship alert matched your profile",
];

export default function DashboardPage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      full_name: user?.full_name || "",
      email: user?.email || "",
    });
  }, [user]);

  const joinedLabel = useMemo(() => {
    if (!user?.created_at) return "Recently joined";
    return new Date(user.created_at).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [user]);

  const validate = () => {
    const nextErrors = {};
    if ((form.full_name || "").trim().length < 2) {
      nextErrors.full_name = "Name must be at least 2 characters.";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email || "")) {
      nextErrors.email = "Please enter a valid email.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setServerError("");
    if (!validate()) return;

    setSaving(true);
    try {
      await updateProfile({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
      });
      setSuccessMessage("Your profile has been updated.");
    } catch (error) {
      setServerError(error?.response?.data?.detail || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <article className="rounded-2xl border border-slate-200 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 p-6 text-white md:p-8">
          <p className="text-sm font-medium text-blue-100">Your admission command center</p>
          <h2 className="mt-2 font-heading text-2xl font-bold md:text-3xl">
            Keep everything organized and decision-ready
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-blue-100 md:text-base">
            Track progress, monitor critical tasks, and keep your profile accurate so every recommendation is personalized for your goals.
          </p>
        </article>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickStatsSeed.map((item) => (
            <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-1 font-heading text-3xl font-bold text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-600">{item.subtitle}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <h3 className="font-heading text-xl font-semibold text-slate-900">Upcoming Priorities</h3>
            <p className="mt-1 text-sm text-slate-600">Focus on these actions to stay ahead of deadlines.</p>
            <div className="mt-5 space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.title} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{task.title}</p>
                    <p className="text-sm text-slate-600">{task.due}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${task.statusClass}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-heading text-xl font-semibold text-slate-900">Recent Activity</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {recentActivity.map((activity) => (
                <li key={activity} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 flex-none rounded-full bg-brand-500" />
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-heading text-xl font-semibold text-slate-900">Profile Overview</h3>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-slate-500">Full name</p>
                <p className="font-semibold text-slate-800">{user?.full_name}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-slate-500">Email</p>
                <p className="font-semibold text-slate-800">{user?.email}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-slate-500">Role</p>
                  <p className="font-semibold capitalize text-slate-800">{user?.role}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-slate-500">Joined</p>
                  <p className="font-semibold text-slate-800">{joinedLabel}</p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-heading text-xl font-semibold text-slate-900">Edit Profile</h3>
            <p className="mt-1 text-sm text-slate-600">
              Keep your account information accurate for better admission guidance.
            </p>
            <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
              <div>
                <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={onChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="Your full name"
                />
                {errors.full_name ? <p className="mt-1 text-xs text-red-600">{errors.full_name}</p> : null}
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="you@example.com"
                />
                {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
              </div>

              {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
              {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </article>
        </section>
      </section>
    </DashboardLayout>
  );
}
