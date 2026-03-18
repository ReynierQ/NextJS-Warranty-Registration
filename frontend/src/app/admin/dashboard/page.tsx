"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import AdminNavbar from "@/app/components/admin-navbar/admin-navbar";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTokenExpiration = () => {
    // Clear any stored tokens
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    // Show message
    setError("Your session has expired. Redirecting to login...");
    // Redirect to login after a short delay
    setTimeout(() => {
      router.push("/admin/login");
    }, 1500);
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        setAdmin(res.data.admin);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        
        // Check if error is due to token expiration (401 Unauthorized)
        if (err.response?.status === 401) {
          handleTokenExpiration();
          return;
        }
        
        // For other errors, still redirect to login but show error
        setError("Failed to load dashboard. Please login again.");
        setTimeout(() => {
          router.push("/admin/login");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    // Check if token exists before fetching
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Redirecting to login...");
      setTimeout(() => {
        router.push("/admin/login");
      }, 1500);
      setLoading(false);
      return;
    }

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-2">Loading dashboard...</p>
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          {error.includes("session has expired") || error.includes("No authentication") ? (
            <p className="text-gray-400">Please wait...</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-900 text-white p-8">
        
        
        {/* Dashboard cards */}    
        <div className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h1 className="text-3xl font-bold mb-6">Welcome, {admin?.email}</h1>
          <h3 className="text-xl font-semibold mb-2">Logged in as: {admin.name}</h3>
          <p className="text-gray-400">Role: Administrator</p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Admin Accounts</h3>
            <p className="text-gray-400">Manage accounts of the admins</p>
            <a 
              href="/admin/admin-management" 
              className="mt-4 inline-block text-orange-500 hover:text-orange-400 font-medium"
            >
              View All →
            </a>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Warranties</h3>
            <p className="text-gray-400">Manage warranty registrations</p>
            <a 
              href="/admin/warranty" 
              className="mt-4 inline-block text-orange-500 hover:text-orange-400 font-medium"
            >
              View All →
            </a>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Forms</h3>
            <p className="text-gray-400">Edit form dropdowns</p>
            <a 
              href="/admin/form" 
              className="mt-4 inline-block text-orange-500 hover:text-orange-400 font-medium"
            >
              Manage Forms →
            </a>
          </div>
          
        </div>
      </div>
    </>
  );
}