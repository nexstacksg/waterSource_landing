"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function PortalAuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const authPayload = isLogin
        ? {
            email: form.get("email"),
            password: form.get("password"),
          }
        : {
            name: form.get("name"),
            email: form.get("email"),
            password: form.get("password"),
            phone: form.get("phone"),
          };
      const response = await fetch(`/api/customer-auth/${isLogin ? "login" : "signup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(authPayload),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
        setError(payload?.error ?? payload?.message ?? "We could not sign you in. Please check your details.");
        setSubmitted(false);
        return;
      }
      router.replace("/portal");
      router.refresh();
    } catch {
      setError("We could not reach the account service. Please try again.");
      setSubmitted(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <main className="portal-auth-page">
      <Link className="portal-auth-back" href="/">← Back to WaterSource</Link>
      <div className="portal-auth-card">
        <div className="portal-auth-brand"><span>W</span> WaterSource portal</div>
        <p className="eyebrow">{isLogin ? "Welcome back" : "Start your journey"}</p>
        <h1>{isLogin ? "Sign in to your portal" : "Create your account"}</h1>
        <p className="portal-auth-lead">
          {isLogin ? "Track deliveries, view your orders, and manage your address." : "Keep your WaterSource orders and delivery details in one place."}
        </p>
        <form onSubmit={handleSubmit}>
          {!isLogin && <label>Full name<input name="name" placeholder="Your full name" required /></label>}
          <label>Email address<input name="email" placeholder="you@example.com" required type="email" /></label>
          {!isLogin && <label>Phone number<input autoComplete="tel" name="phone" placeholder="+65 9000 0000" required type="tel" /></label>}
          <label>Password<input name="password" placeholder="At least 8 characters" required type="password" /></label>
          <button className="portal-primary-button" disabled={submitted} type="submit">
            {submitted ? "Opening your portal…" : isLogin ? "Sign in" : "Create account"}
          </button>
          {error && <p className="portal-form-error" role="alert">{error}</p>}
        </form>
        <p className="portal-auth-switch">
          {isLogin ? "New to WaterSource?" : "Already have an account?"} {" "}
          <Link href={isLogin ? "/portal/signup" : "/portal/login"}>{isLogin ? "Create an account" : "Sign in"}</Link>
        </p>
        <p className="portal-preview-note">Your account is protected with a secure 30-day session.</p>
      </div>
    </main>
  );
}
