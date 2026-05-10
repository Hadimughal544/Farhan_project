export default function UniversityCard({ uni }) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h4 className="font-semibold text-slate-800">{uni.name}</h4>
      <p className="text-sm text-slate-600">{uni.city}</p>
      <p className="text-sm text-slate-600">Programs: {uni.programs.join(", ")}</p>
      <p className="mt-2 text-sm">
        Tier: <strong>{uni.tier}</strong> · Type: <strong>{uni.type}</strong>
      </p>
      <p className="text-sm">
        Merit: <strong>{uni.merit}</strong> · Fee Range:{" "}
        <strong>
          PKR {Number(uni.min_fee).toLocaleString()} - {Number(uni.max_fee).toLocaleString()}
        </strong>
      </p>
      <p className="text-sm">
        Scholarships: <strong>{uni.is_scholarships ? "Yes" : "No"}</strong> · Admission Open:{" "}
        <strong>{uni.is_admission_open ? "Yes" : "No"}</strong>
      </p>
    </div>
  );
}
