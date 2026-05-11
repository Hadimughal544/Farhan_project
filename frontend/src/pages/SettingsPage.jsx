import { useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import Button from "../components/ui/Button";

const initial = {
  emailNotifications: true,
  roadmapReminders: true,
  scholarshipAlerts: true,
  compactCharts: false,
};

export default function SettingsPage() {
  const [prefs, setPrefs] = useState(initial);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const onSave = () => {
    toast.success("Preferences saved successfully.");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="saas-panel p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Settings</p>
          <h1 className="mt-2 saas-title">Workspace preferences</h1>
          <p className="mt-3 max-w-2xl saas-subtitle">
            Tune your notifications and dashboard behavior for a cleaner, more personalized experience.
          </p>
        </section>

        <section className="saas-panel p-6 md:p-8">
          <h2 className="saas-section-title">Notifications</h2>
          <div className="mt-5 space-y-3">
            {[
              ["emailNotifications", "Email notifications", "Receive alerts about important account updates."],
              ["roadmapReminders", "Roadmap reminders", "Get reminders for roadmap milestones and deadlines."],
              ["scholarshipAlerts", "Scholarship alerts", "Notify when new scholarships match your profile."],
              ["compactCharts", "Compact chart mode", "Use denser chart cards for smaller screens."],
            ].map(([key, title, desc]) => (
              <label key={key} className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{title}</span>
                  <span className="mt-1 block text-sm text-slate-600">{desc}</span>
                </span>
                <input
                  type="checkbox"
                  checked={prefs[key]}
                  onChange={() => toggle(key)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={onSave}>Save preferences</Button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
