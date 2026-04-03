import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { apiErrorMessage } from "../utils/formatters";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.email) nextErrors.email = "Email is required.";
    if (!values.password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setLoading(true);
      await login(values);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (error) {
      toast.error(apiErrorMessage(error, "Login failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_30px_90px_-35px_rgba(15,23,42,0.45)] backdrop-blur lg:grid-cols-[1.1fr_minmax(0,440px)]">
        <section className="relative overflow-hidden bg-slate-950 px-6 py-8 text-white sm:px-10 lg:px-12 lg:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.28),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.22),_transparent_30%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">Welcome back</p>
              <h1 className="mt-4 max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">
                Return to the workspace where billing and spend stay under control.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                Review invoices, record expenses, and keep your dashboard current without hopping between tools.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold">Clear dashboard</p>
                <p className="mt-2 text-sm text-slate-300">See income, expenses, and profit together.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold">Faster invoicing</p>
                <p className="mt-2 text-sm text-slate-300">Create and export professional invoice PDFs.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold">Smarter expense view</p>
                <p className="mt-2 text-sm text-slate-300">Track spend with filters and live revenue context.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center px-5 py-8 sm:px-8 lg:px-10">
          <form className="w-full space-y-5" onSubmit={onSubmit}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Sign in</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">Access your account</h2>
              <p className="mt-2 text-sm text-slate-500">Use your email and password to open the finance workspace.</p>
            </div>

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
              {loading ? "Signing in..." : "Login"}
            </Button>

            <div className="surface-card px-4 py-3 text-sm text-slate-500">
              Need an account?{" "}
              <Link to="/register" className="font-semibold text-brand-700 hover:underline">
                Create one here
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
