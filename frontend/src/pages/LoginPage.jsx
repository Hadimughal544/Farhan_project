import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthCard from "../components/AuthCard";
import TextInput from "../components/TextInput";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import PasswordInput from "../components/ui/PasswordInput";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};

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
      await login(form);
      toast.success("Welcome back. You are signed in.");
      navigate("/dashboard");
    } catch (error) {
      setServerError(error?.response?.data?.detail || "Login failed.");
      toast.error(error?.response?.data?.detail || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to continue to FutureCampus and track your admission journey."
      >
        <form onSubmit={onSubmit} noValidate className="space-y-4">
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
            placeholder="Enter your password"
            error={errors.password}
          />

          {serverError ? <p className="mb-4 text-sm text-red-600">{serverError}</p> : null}

          <Button type="submit" disabled={submitting} className="w-full py-3">
            {submitting ? "Authenticating…" : "Continue"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          New user?{" "}
          <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
            Create an account
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
