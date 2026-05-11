import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthCard from "../components/AuthCard";
import TextInput from "../components/TextInput";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import PasswordInput from "../components/ui/PasswordInput";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (form.full_name.trim().length < 2) {
      nextErrors.full_name = "Full name must be at least 2 characters.";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Please enter a valid email.";
    }

    if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setServerError("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      await register(form);
      toast.success("Account created. Please sign in.");
      navigate("/login");
    } catch (error) {
      setServerError(error?.response?.data?.detail || "Registration failed.");
      toast.error(error?.response?.data?.detail || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Create your account"
        subtitle="Join FutureCampus to get AI-guided university and admission planning."
      >
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <TextInput
            label="Full Name"
            name="full_name"
            type="text"
            value={form.full_name}
            onChange={onChange}
            placeholder="e.g., Farhan Ali"
            error={errors.full_name}
          />

          <TextInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            error={errors.email}
          />

          <PasswordInput
            label="Password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Minimum 8 characters"
            error={errors.password}
          />

          {serverError ? <p className="mb-4 text-sm text-red-600">{serverError}</p> : null}

          <Button type="submit" disabled={submitting} className="w-full py-3">
            {submitting ? "Submitting…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Login here
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
