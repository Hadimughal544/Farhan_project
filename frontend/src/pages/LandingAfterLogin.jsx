import DashboardLayout from "../layouts/DashboardLayout";
import { Link } from "react-router-dom";

export default function LandingAfterLogin() {
  return (
    <DashboardLayout>
      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold">Welcome to your Admission Hub</h1>
          <p className="mt-2 text-slate-600">Get personalized predictions and targeted university suggestions tailored to Pakistan's university landscape.</p>
          <div className="mt-6 flex gap-3">
            <Link to="/predict" className="rounded-md bg-brand-600 px-4 py-2 text-white">Get Prediction</Link>
            <Link to="/dashboard" className="rounded-md border px-4 py-2">View Dashboard</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold">How it works</h3>
          <ol className="mt-3 text-sm list-decimal list-inside text-slate-600">
            <li>Fill your academic details</li>
            <li>Model computes your eligibility and chances</li>
            <li>We suggest universities matching your profile</li>
          </ol>
        </div>
      </section>
    </DashboardLayout>
  );
}
