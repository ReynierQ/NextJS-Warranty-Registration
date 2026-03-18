"use client";

import { useState, useEffect } from "react";
import { Shield, Home, FileText, ClipboardList, LogOut, Menu, X } from 'lucide-react';

export default function AdminNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  useEffect(() => {
    // Wait until client-side render to access window
    setCurrentPath(window.location.pathname);
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }
  };

  const navItems = [
    { name: "Home", path: "/admin/dashboard", icon: Home },
    { name: "Admins", path: "/admin/admin-management", icon: Shield },
    { name: "Warranties", path: "/admin/warranty", icon: ClipboardList },
    { name: "Form", path: "/admin/form", icon: FileText },
  ];

  const handleNavigation = (path: string) => {
    window.location.href = path;
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (!currentPath) return false; // not yet hydrated
    if (path === "/admin") return currentPath === path;
    return currentPath.startsWith(path);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <a 
              href="/admin/dashboard" 
              className="text-xl font-bold text-white hover:text-jbl-orange transition-colors cursor-pointer"
            >
              JBL Warranty
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    active
                      ? "bg-jbl-orange text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </a>
              );
            })}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? "bg-orange-500 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </button>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
