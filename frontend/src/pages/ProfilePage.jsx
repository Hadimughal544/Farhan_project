import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../hooks/useAuth";
import TextInput from "../components/TextInput";
import PasswordInput from "../components/ui/PasswordInput";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";

function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "U";
  const first = parts[0]?.[0] || "U";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
}

export default function ProfilePage() {
  const { user, updateProfile, uploadAvatar } = useAuth();

  const joinedLabel = useMemo(() => {
    if (!user?.created_at) return "—";
    return new Date(user.created_at).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [user?.created_at]);

  const [form, setForm] = useState({ full_name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);

  useEffect(() => {
    setForm({
      full_name: user?.full_name || "",
      email: user?.email || "",
    });
  }, [user?.full_name, user?.email]);

  const onAvatarChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const updated = await uploadAvatar(f);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Avatar upload failed.");
    }
  };

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onPwChange = (e) => setPw((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validateProfile = () => {
    const next = {};
    if ((form.full_name || "").trim().length < 2) next.full_name = "Full name must be at least two characters.";
    if (!/^\S+@\S+\.\S+$/.test(form.email || "")) next.email = "Enter a valid email address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validatePassword = () => {
    const next = {};
    if ((pw.next || "").length < 8) next.next = "New password must contain at least eight characters.";
    if (pw.next !== pw.confirm) next.confirm = "Passwords do not match.";
    setPwErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ full_name: form.full_name.trim(), email: form.email.trim() });
      toast.success("Profile updated successfully.");
      setEditMode(false);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) {
      toast.error("Please correct the password fields.");
      return;
    }
    toast.error("Password change is not configured for this deployment. Please contact your administrator.");
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Profile</p>
            <h1 className="mt-1 font-heading text-2xl font-semibold text-slate-900 md:text-3xl">Account profile</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Manage identity details and review workspace metadata associated with this account.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditMode((v) => !v)}>
              {editMode ? "Cancel edit" : "Edit profile"}
            </Button>
            <Button type="button" onClick={() => setPwModalOpen(true)}>
              Change password
            </Button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-5">
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="avatar" className="h-14 w-14 rounded-xl object-cover" />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                    {initials(user?.full_name)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-heading text-lg font-semibold text-slate-900">{user?.full_name}</p>
                <p className="truncate text-sm text-slate-600">{user?.email}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</p>
                <p className="mt-1 font-medium capitalize text-slate-900">{user?.role}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Member since</p>
                <p className="mt-1 font-medium text-slate-900">{joinedLabel}</p>
              </div>
              {editMode ? (
                <label className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 cursor-pointer transition hover:bg-slate-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onAvatarChange}
                    className="hidden"
                    aria-label="Upload avatar"
                  />
                  📷 Upload Avatar
                </label>
              ) : null}
            </div>
          </article>

          <div className="space-y-6 lg:col-span-3">
            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-lg font-semibold text-slate-900">Profile details</h2>
              <p className="mt-1 text-sm text-slate-600">Update the information displayed across your workspace.</p>
              <form className="mt-5 space-y-4" onSubmit={saveProfile} noValidate>
                <TextInput
                  label="Full name"
                  name="full_name"
                  value={form.full_name}
                  onChange={onChange}
                  error={errors.full_name}
                  disabled={!editMode}
                />
                <TextInput
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  error={errors.email}
                  disabled={!editMode}
                />
                {editMode ? (
                  <div className="pt-2">
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving…" : "Save changes"}
                    </Button>
                  </div>
                ) : null}
              </form>
            </article>
          </div>
        </section>

        <Modal
          open={pwModalOpen}
          onClose={() => setPwModalOpen(false)}
          title="Change password"
          description="Update the password associated with this account. Your organization’s security policies still apply."
          footer={
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setPwModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={changePassword}>
                Update password
              </Button>
            </div>
          }
        >
          <form className="space-y-4" onSubmit={changePassword} noValidate>
            <PasswordInput
              label="Current password"
              name="current"
              value={pw.current}
              onChange={onPwChange}
              placeholder="Enter current password"
            />
            <PasswordInput
              label="New password"
              name="next"
              value={pw.next}
              onChange={onPwChange}
              placeholder="Minimum eight characters"
              error={pwErrors.next}
            />
            <PasswordInput
              label="Confirm new password"
              name="confirm"
              value={pw.confirm}
              onChange={onPwChange}
              placeholder="Re-enter new password"
              error={pwErrors.confirm}
            />
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

