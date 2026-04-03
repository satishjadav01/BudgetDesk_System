import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { apiErrorMessage } from "../utils/formatters";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ full_name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.full_name) nextErrors.full_name = "Full name is required.";
    if (!values.email) nextErrors.email = "Email is required.";
    if (!values.password || values.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setLoading(true);
      await register(values);
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(apiErrorMessage(error, "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_30px_90px_-35px_rgba(15,23,42,0.45)] backdrop-blur lg:grid-cols-[1.1fr_minmax(0,460px)]">
        <section className="relative overflow-hidden bg-slate-950 px-6 py-8 text-white sm:px-10 lg:px-12 lg:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.28),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.24),_transparent_30%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">New workspace</p>
              <h1 className="mt-4 max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">
                Create an account and turn this tracker into your daily finance home base.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                A single account gives you invoice management, expense control, and a cleaner view of business health.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold">Create invoices</p>
                <p className="mt-2 text-sm text-slate-300">Build itemized records with tax and status tracking.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold">Capture expenses</p>
                <p className="mt-2 text-sm text-slate-300">Sort spend by category and month for easier review.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold">Watch profit move</p>
                <p className="mt-2 text-sm text-slate-300">See how billing and spend affect the business in real time.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center px-5 py-8 sm:px-8 lg:px-10">
          <form className="w-full space-y-5" onSubmit={onSubmit}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Create account</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">Start your workspace</h2>
              <p className="mt-2 text-sm text-slate-500">Set up your profile and begin tracking invoices and expenses.</p>
            </div>

            <Input
              label="Full Name"
              value={values.full_name}
              error={errors.full_name}
              onChange={(e) => setValues((prev) => ({ ...prev, full_name: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              value={values.email}
              error={errors.email}
              onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
            />
            <Input
              label="Password"
              type="password"
              value={values.password}
              error={errors.password}
              onChange={(e) => setValues((prev) => ({ ...prev, password: e.target.value }))}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Register"}
            </Button>

            <div className="surface-card px-4 py-3 text-sm text-slate-500">
              Already registered?{" "}
              <Link to="/login" className="font-semibold text-brand-700 hover:underline">
                Login here
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
