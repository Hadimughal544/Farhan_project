import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import TextInput from "../components/TextInput";
import UniversityCard from "../components/UniversityCard";
import Button from "../components/ui/Button";
import { predictAdmission } from "../services/predictionService";
import { useAuth } from "../hooks/useAuth";

const STEPS = [
  { id: 1, label: "Academic record", short: "Academics" },
  { id: 2, label: "Program & investment", short: "Program" },
  { id: 3, label: "Institution preferences", short: "Preferences" },
];

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export default function PredictionPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    matric_pct: "",
    inter_pct: "",
    entry_test_score: "",
    budget: "",
    program: "Computer Science",
    university_tier: 1,
    university_type: "Private",
  });

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const draftKey = useMemo(() => {
    const id = user?.id ?? user?.email ?? "anonymous";
    return `assessment_draft_${id}`;
  }, [user?.id, user?.email]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      setForm((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore bad drafts
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  const persistDraft = (nextForm) => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(nextForm));
    } catch {
      // ignore storage issues
    }
  };

  const programs = [
    "Accounting & Finance",
    "Agriculture",
    "Artificial Intelligence",
    "BBA",
    "Civil Engineering",
    "Computer Engineering",
    "Computer Science",
    "Cyber Security",
    "Data Science",
    "Economics",
    "Electrical Engineering",
    "Food Science",
    "Information Technology",
    "LLB",
    "Marketing",
    "Mechanical Engineering",
    "Media Studies",
    "Psychology",
    "Software Engineering",
  ];
  const universityTypes = ["Government", "Private"];

  const preferredUniversity = useMemo(() => {
    const list = result?.suggested_universities;
    if (!list?.length) return null;
    return list[0];
  }, [result]);

  const validateStep = (s) => {
    const nextErrors = { ...errors };
    const stepKeys = {
      1: ["matric_pct", "inter_pct", "entry_test_score"],
      2: ["budget", "program"],
      3: ["university_type"],
    };
    stepKeys[s].forEach((k) => delete nextErrors[k]);

    if (s === 1) {
      if (!form.matric_pct || form.matric_pct < 0 || form.matric_pct > 100) {
        nextErrors.matric_pct = "Enter a valid percentage (0–100).";
      }
      if (!form.inter_pct || form.inter_pct < 0 || form.inter_pct > 100) {
        nextErrors.inter_pct = "Enter a valid percentage (0–100).";
      }
      if (!form.entry_test_score || form.entry_test_score < 0 || form.entry_test_score > 100) {
        nextErrors.entry_test_score = "Enter a valid score (0–100).";
      }
    }
    if (s === 2) {
      if (!form.budget || form.budget < 0) {
        nextErrors.budget = "Enter a positive annual budget (PKR).";
      }
      if (!form.program) nextErrors.program = "Select an intended program.";
    }
    if (s === 3) {
      if (!form.university_type) nextErrors.university_type = "Select a sector preference.";
    }
    setErrors(nextErrors);
    return !stepKeys[s].some((k) => nextErrors[k]);
  };

  const validateAll = () => {
    const nextErrors = {};
    if (!form.matric_pct || form.matric_pct < 0 || form.matric_pct > 100) {
      nextErrors.matric_pct = "Enter a valid percentage (0–100).";
    }
    if (!form.inter_pct || form.inter_pct < 0 || form.inter_pct > 100) {
      nextErrors.inter_pct = "Enter a valid percentage (0–100).";
    }
    if (!form.entry_test_score || form.entry_test_score < 0 || form.entry_test_score > 100) {
      nextErrors.entry_test_score = "Enter a valid score (0–100).";
    }
    if (!form.budget || form.budget < 0) {
      nextErrors.budget = "Enter a positive annual budget (PKR).";
    }
    if (!form.program) nextErrors.program = "Select an intended program.";
    if (!form.university_type) nextErrors.university_type = "Select a sector preference.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "university_tier") updated.university_tier = parseInt(value, 10);
      persistDraft(updated);
      return updated;
    });
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!validateAll()) {
      setStep(1);
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      const computedEligibility = Number(
        (0.3 * parseFloat(form.matric_pct) +
          0.4 * parseFloat(form.inter_pct) +
          0.3 * parseFloat(form.entry_test_score)).toFixed(2)
      );

      const response = await predictAdmission({
        matric_pct: parseFloat(form.matric_pct),
        inter_pct: parseFloat(form.inter_pct),
        entry_test_score: parseFloat(form.entry_test_score),
        eligibility_score: computedEligibility,
        budget: parseFloat(form.budget),
        program: form.program,
        university_tier: form.university_tier,
        university_type: form.university_type,
      });

      setResult(response);
      persistDraft(form);
      toast.success("Assessment generated successfully.");
    } catch (err) {
      setError(err?.response?.data?.detail || "We could not complete your assessment. Please try again.");
      toast.error(err?.response?.data?.detail || "Assessment could not be generated.");
    } finally {
      setLoading(false);
    }
  };

  const readinessPct = result?.input_data?.eligibility_score != null
    ? Math.min(100, Math.max(0, Number(result.input_data.eligibility_score)))
    : 0;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 lg:mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Advisory workflow</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Eligibility assessment
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            Submit your academic and financial profile to receive a structured outcome and a single preferred institution
            aligned with your selections and our catalog.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  {STEPS.map((s) => (
                    <div
                      key={s.id}
                      className={`flex flex-1 flex-col items-center rounded-lg border px-1 py-2 transition-colors sm:px-2 ${
                        step === s.id
                          ? "border-slate-900 bg-slate-900 text-white"
                          : step > s.id
                            ? "border-slate-200 bg-slate-100 text-slate-800"
                            : "border-slate-100 bg-slate-50 text-slate-400"
                      }`}
                    >
                      <span className="text-[10px] font-bold tabular-nums sm:text-xs">{s.id}</span>
                      <span className="mt-0.5 hidden text-center text-[9px] font-semibold uppercase leading-tight tracking-wide sm:block">
                        {s.short}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all duration-500 ease-out"
                    style={{ width: `${(step / STEPS.length) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Step {step} of {STEPS.length}: {STEPS[step - 1].label}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {step === 1 ? (
                  <div className="animate-slide-up space-y-4">
                    <TextInput
                      name="matric_pct"
                      label="Secondary school aggregate (%)"
                      type="number"
                      placeholder="e.g. 88"
                      value={form.matric_pct}
                      onChange={onChange}
                      error={errors.matric_pct}
                      step="0.01"
                      min="0"
                      max="100"
                    />
                    <TextInput
                      name="inter_pct"
                      label="Higher secondary aggregate (%)"
                      type="number"
                      placeholder="e.g. 82"
                      value={form.inter_pct}
                      onChange={onChange}
                      error={errors.inter_pct}
                      step="0.01"
                      min="0"
                      max="100"
                    />
                    <TextInput
                      name="entry_test_score"
                      label="Standardized entry assessment (%)"
                      type="number"
                      placeholder="e.g. 75"
                      value={form.entry_test_score}
                      onChange={onChange}
                      error={errors.entry_test_score}
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="animate-slide-up space-y-4">
                    <TextInput
                      name="budget"
                      label="Annual tuition budget (PKR)"
                      type="number"
                      placeholder="e.g. 500000"
                      value={form.budget}
                      onChange={onChange}
                      error={errors.budget}
                      step="1000"
                      min="0"
                    />
                    <div>
                      <label htmlFor="program" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Intended program of study
                      </label>
                      <select id="program" name="program" value={form.program} onChange={onChange} className={fieldClass}>
                        {programs.map((prog) => (
                          <option key={prog} value={prog}>
                            {prog}
                          </option>
                        ))}
                      </select>
                      {errors.program ? <p className="mt-1.5 text-xs font-medium text-red-600">{errors.program}</p> : null}
                    </div>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="animate-slide-up space-y-4">
                    <div>
                      <label htmlFor="university_tier" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Institutional tier focus
                      </label>
                      <select
                        id="university_tier"
                        name="university_tier"
                        value={form.university_tier}
                        onChange={onChange}
                        className={fieldClass}
                      >
                        <option value={1}>Tier I — flagship research-led</option>
                        <option value={2}>Tier II — established national presence</option>
                        <option value={3}>Tier III — emerging / regional strength</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="university_type" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Sector preference
                      </label>
                      <select
                        id="university_type"
                        name="university_type"
                        value={form.university_type}
                        onChange={onChange}
                        className={fieldClass}
                      >
                        {universityTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.university_type ? (
                        <p className="mt-1.5 text-xs font-medium text-red-600">{errors.university_type}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
                  {step > 1 ? (
                    <Button type="button" variant="secondary" onClick={goBack} disabled={loading}>
                      Back
                    </Button>
                  ) : (
                    <span />
                  )}
                  {step < 3 ? (
                    <Button type="button" onClick={goNext} disabled={loading}>
                      Continue
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading} className="sm:min-w-[200px]">
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Processing…
                        </span>
                      ) : (
                        "Generate assessment"
                      )}
                    </Button>
                  )}
                </div>
              </form>

              {error ? (
                <div
                  className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-7">
            {result ? (
              <div className="space-y-6">
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
                  <h2 className="font-heading text-lg font-semibold text-slate-900">Assessment outcome</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Summary derived from the credentials you submitted. Catalog matching respects program, sector, tier,
                    budget, and availability flags.
                  </p>

                  <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Composite readiness</p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{readinessPct.toFixed(1)}</p>
                        <p className="text-xs text-slate-500">Weighted index from your academic inputs</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-slate-800 transition-all duration-700 ease-out"
                        style={{ width: `${readinessPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-100 px-3 py-2.5">
                      <p className="text-xs text-slate-500">Program</p>
                      <p className="text-sm font-medium text-slate-900">{result.input_data.program}</p>
                    </div>
                    <div className="rounded-lg border border-slate-100 px-3 py-2.5">
                      <p className="text-xs text-slate-500">Budget ceiling</p>
                      <p className="text-sm font-medium tabular-nums text-slate-900">
                        PKR {result.input_data.budget.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 px-3 py-2.5">
                      <p className="text-xs text-slate-500">Tier focus</p>
                      <p className="text-sm font-medium text-slate-900">Tier {result.input_data.university_tier}</p>
                    </div>
                    <div className="rounded-lg border border-slate-100 px-3 py-2.5">
                      <p className="text-xs text-slate-500">Sector</p>
                      <p className="text-sm font-medium text-slate-900">{result.input_data.university_type}</p>
                    </div>
                  </div>

                  <details className="mt-6 group rounded-lg border border-slate-100 bg-white">
                    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between">
                        Input detail
                        <svg
                          className="h-4 w-4 text-slate-400 transition group-open:rotate-180"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <dl className="grid gap-2 border-t border-slate-100 px-4 py-3 text-sm sm:grid-cols-2">
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">Secondary</dt>
                        <dd className="font-medium tabular-nums">{result.input_data.matric_pct}%</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">Higher secondary</dt>
                        <dd className="font-medium tabular-nums">{result.input_data.inter_pct}%</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">Entry assessment</dt>
                        <dd className="font-medium tabular-nums">{result.input_data.entry_test_score}%</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">Readiness index</dt>
                        <dd className="font-medium tabular-nums">{result.input_data.eligibility_score}%</dd>
                      </div>
                    </dl>
                  </details>
                </section>

                {preferredUniversity ? (
                  <section>
                    <h3 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Suggested institution
                    </h3>
                    <UniversityCard uni={preferredUniversity} featured />
                  </section>
                ) : (
                  <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 text-center">
                    <p className="text-sm font-medium text-slate-800">No catalog match for this profile</p>
                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                      Your administrator can extend the institutional catalog with programs, tiers, and fee bands that
                      align with this assessment.
                    </p>
                  </section>
                )}
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col justify-center rounded-xl border border-slate-200 bg-white p-8 shadow-card lg:min-h-[480px]">
                <div className="mx-auto max-w-md text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="font-heading text-lg font-semibold text-slate-900">Outcome workspace</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Complete the questionnaire and select <strong>Generate assessment</strong> to populate your
                    institutional recommendation and readiness summary.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
