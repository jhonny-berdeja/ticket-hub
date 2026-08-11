"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";

export default function Login() {
  const router = useRouter();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    // No real authentication yet: any submission, even empty, succeeds.
    router.push("/home");
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, please enter your details.
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="rounded border-gray-300" />
              Remember me
            </label>
            <a href="#" className="font-medium text-gray-900 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <a href="#" className="font-medium text-gray-900 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
