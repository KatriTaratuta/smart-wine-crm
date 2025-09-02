"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Вынесем базовый URL API в переменную окружения
const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

async function loginRequest(email: string, password: string) {
  // простой POST на бэкенд /auth/login
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  // ожидаем { access_token: "..." } или { token: "..." }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Login failed (${res.status})`);
  }
  return res.json();
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Пожалуйста, введите корректный e-mail.");
      return;
    }
    if (password.length < 4) {
      setError("Пароль должен быть не короче 4 символов.");
      return;
    }

    try {
      setLoading(true);
      const data = await loginRequest(email, password);

      // пытаемся вытащить токен
      const token =
        (data && (data.access_token || data.token)) || "";

      if (!token) {
        throw new Error("Токен не получен от сервера.");
      }

      // сохраним токен (пока в localStorage; позже заменим на httpOnly cookie)
      localStorage.setItem("jwt", token);

      // редирект на дашборд (сделаем-заглушку ниже)
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Ошибка входа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-4">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm bg-white/70 backdrop-blur
                      dark:bg-slate-900/60 dark:border-slate-800">
        <div className="mb-6 text-center">
          {/* логотип можно положить в /public/logo.svg и заменить ниже src */}
          <img
            src="/logo.svg"
            alt="Smart Wine CRM"
            className="mx-auto h-12 w-auto mb-3"
          />
          <h1 className="text-xl font-semibold">Вход в аккаунт</h1>
          <p className="text-sm text-slate-500">
            Используйте e-mail и пароль администратора/оператора
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm">E-mail</span>
            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border px-3 py-2 outline-none
                         focus:ring-2 ring-offset-1 ring-blue-500
                         bg-white dark:bg-slate-800 dark:border-slate-700"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm">Пароль</span>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                className="w-full rounded-lg border px-3 py-2 pr-10 outline-none
                           focus:ring-2 ring-offset-1 ring-blue-500
                           bg-white dark:bg-slate-800 dark:border-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700"
                aria-label={show ? "Скрыть пароль" : "Показать пароль"}
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 text-white py-2 font-medium
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <a className="hover:underline" href="#">Забыли пароль?</a>
          <a className="hover:underline" href="#">Создать аккаунт</a>
        </div>
      </div>
    </div>
  );
}