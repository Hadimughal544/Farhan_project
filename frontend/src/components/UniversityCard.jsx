export default function UniversityCard({ uni, featured = false }) {
  if (featured) {
    return (
      <article className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-card transition-shadow duration-300 hover:shadow-lift">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Preferred institution</p>
          <h3 className="mt-1 font-heading text-xl font-semibold tracking-tight text-slate-900">{uni.name}</h3>
          <p className="mt-0.5 text-sm text-slate-600">{uni.city}</p>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Programs offered</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-800">{uni.programs.join(", ")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
              <p className="text-xs text-slate-500">Classification tier</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">Tier {uni.tier}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
              <p className="text-xs text-slate-500">Sector</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">{uni.type}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5 sm:col-span-2">
              <p className="text-xs text-slate-500">Annual fee range (PKR)</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
                {Number(uni.min_fee).toLocaleString()} — {Number(uni.max_fee).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
              Merit index {uni.merit}
            </span>
            <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
              {uni.is_scholarships ? "Financial aid available" : "Standard tuition"}
            </span>
            <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
              {uni.is_admission_open ? "Accepting applications" : "Admissions closed"}
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <h4 className="font-heading font-semibold text-slate-900">{uni.name}</h4>
      <p className="mt-1 text-sm text-slate-600">{uni.city}</p>
      <p className="mt-2 text-sm text-slate-700">Programs: {uni.programs.join(", ")}</p>
      <p className="mt-2 text-xs text-slate-600">
        Tier {uni.tier} · {uni.type}
      </p>
      <p className="mt-1 text-xs text-slate-600">
        Merit {uni.merit} · PKR {Number(uni.min_fee).toLocaleString()} – {Number(uni.max_fee).toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-slate-600">
        {uni.is_scholarships ? "Aid programs" : "No aid flag"} · {uni.is_admission_open ? "Open" : "Closed"}
      </p>
    </div>
  );
}
