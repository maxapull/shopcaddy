"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

type Mode = "sign-in" | "sign-up";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    if (mode === "sign-up") {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        router.replace("/");
        router.refresh();
      } else {
        setCheckEmail(true);
      }
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  if (checkEmail) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 text-center">
        <Logo size="lg" />
        <p className="mt-6 text-sm text-caddy-ink">
          Check <span className="font-semibold">{email}</span> for a confirmation link, then come
          back and sign in.
        </p>
        <button
          onClick={() => {
            setCheckEmail(false);
            setMode("sign-in");
          }}
          className="mt-4 text-xs font-semibold text-caddy-orange-dark"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <div className="mb-6 flex justify-center">
        <Logo size="lg" />
      </div>
      <div className="rounded-xl2 border border-caddy-orange-light bg-white p-6 shadow-card">
        <h1 className="text-lg font-bold text-caddy-ink">
          {mode === "sign-in" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-caddy-gray">
          {mode === "sign-in"
            ? "Sign in to your shopping and budget assistant."
            : "Takes a few seconds — no card required."}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div className="flex items-center gap-2 rounded-xl2 border border-caddy-orange-light bg-caddy-cream px-3 py-2.5">
            <Mail size={16} className="shrink-0 text-caddy-gray" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl2 border border-caddy-orange-light bg-caddy-cream px-3 py-2.5">
            <Lock size={16} className="shrink-0 text-caddy-gray" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl2 bg-caddy-orange px-4 py-2.5 text-sm font-semibold text-white shadow-floating disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === "sign-in" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "sign-in" ? "sign-up" : "sign-in");
            setError(null);
          }}
          className="mt-4 w-full text-center text-xs font-semibold text-caddy-orange-dark"
        >
          {mode === "sign-in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
