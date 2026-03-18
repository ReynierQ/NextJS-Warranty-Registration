"use client";

import { useState } from "react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/admin/login", { email, password });

      if (res.data.success) {
        // ✅ Save JWT token to localStorage
        localStorage.setItem("token", res.data.token);

        // redirect to dashboard
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-8 rounded-lg w-96 shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-jbl-orange"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-jbl-orange"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-jbl-orange hover:bg-orange-600 rounded font-semibold transition-colors"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
