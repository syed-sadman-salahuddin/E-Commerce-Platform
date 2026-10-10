import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function validate(mode, v) {
  const e = {};

  if (mode === "signup" && v.name.trim().length < 2) {
    e.name = "Name must be at least 2 characters.";
  }

  if (!v.email.trim()) {
    e.email = "Email is required.";
  } else if (!/^\S+@\S+\.\S+$/.test(v.email)) {
    e.email = "Enter a valid email address.";
  }

  if (!v.password) {
    e.password = "Password is required.";
  } else if (mode === "signup" && v.password.length < 6) {
    e.password = "Password must be at least 6 characters.";
  }

  if (mode === "signup" && v.confirm !== v.password) {
    e.confirm = "Passwords do not match.";
  }

  return e;
}

const emptyValues = { name: "", email: "", password: "", confirm: "" };

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, login, signup } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState("login");
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [loading, user, navigate]);

  function setField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError("");
  }

  function switchMode(next) {
    setMode(next);
    setErrors({});
    setServerError("");
    setShowPassword(false);
    setValues((prev) => ({ ...emptyValues, email: prev.email }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const found = validate(mode, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      const result =
        mode === "login"
          ? login(values.email, values.password, remember)
          : signup(values.name, values.email, values.password);

      if (!result.ok) {
        setServerError(result.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      showToast(mode === "login" ? "Welcome back!" : "Account created successfully!");
      navigate("/dashboard");
    }, 600);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-indigo-50 via-white to-violet-50 p-4">
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl" />

      <div className="animate-fade-up relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Boxes size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Dekko Isho Inventory
          </h1>
          <p className="text-sm text-slate-500">Inventory management</p>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-2xl shadow-indigo-900/10 backdrop-blur-xl">
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  "rounded-lg py-2 text-sm font-medium transition-all",
                  mode === m
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <h2 className="text-xl font-semibold text-slate-900">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mb-6 mt-1 text-sm text-slate-500">
            {mode === "login"
              ? "Enter your details to access your dashboard."
              : "Start managing your inventory in minutes."}
          </p>

          {serverError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === "signup" && (
              <Input
                label="Full name"
                name="name"
                placeholder="John Doe"
                autoComplete="name"
                value={values.name}
                error={errors.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            )}

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              value={values.email}
              error={errors.email}
              onChange={(e) => setField("email", e.target.value)}
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={values.password}
              error={errors.password}
              onChange={(e) => setField("password", e.target.value)}
              right={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="text-slate-400 transition hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {mode === "signup" && (
              <Input
                label="Confirm password"
                name="confirm"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                value={values.confirm}
                error={errors.confirm}
                onChange={(e) => setField("confirm", e.target.value)}
              />
            )}

            {mode === "login" && (
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                />
                Remember me
              </label>
            )}

            <Button type="submit" disabled={submitting} className="w-full py-3">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {mode === "login" ? "Log in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}