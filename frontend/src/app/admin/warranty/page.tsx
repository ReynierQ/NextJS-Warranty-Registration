"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import AdminNavbar from "@/app/components/admin-navbar/admin-navbar";

export default function AdminWarrantiesPage() {
  const router = useRouter();
  const [allWarranties, setAllWarranties] = useState<any[]>([]);
  const [filteredWarranties, setFilteredWarranties] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [filterBrand, setFilterBrand] = useState("");
  const [filterPurchaseType, setFilterPurchaseType] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Sorting states
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleTokenExpiration = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    setError("Your session has expired. Redirecting to login...");
    setTimeout(() => {
      router.push("/admin/login");
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    // handle ISO or timestamp formats
    if (dateString.includes("T")) {
      const [datePart] = dateString.split("T");
      return datePart;
    }

    // handle date-only (YYYY-MM-DD)
    return dateString;
  };


  const fetchWarranties = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/warranty/warranties`);
      const warranties = res.data.data || [];
      setAllWarranties(warranties);
      setFilteredWarranties(warranties);
    } catch (err: any) {
      console.error("Error fetching warranties", err);
      
      if (err.response?.status === 401) {
        handleTokenExpiration();
        return;
      }
      
      setError("Failed to load warranties. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    
    fetchWarranties();
  }, []);

  const applyFiltersAndSort = () => {
    let filtered = [...allWarranties];

    // Apply search filter
    const searchLower = search.toLowerCase().trim();
    if (searchLower) {
      filtered = filtered.filter((w) => {
        return (
          w.name?.toLowerCase().includes(searchLower) ||
          w.email?.toLowerCase().includes(searchLower) ||
          w.product_name?.toLowerCase().includes(searchLower) ||
          w.brand?.toLowerCase().includes(searchLower) ||
          w.serial_number?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply brand filter
    if (filterBrand) {
      filtered = filtered.filter((w) => w.brand === filterBrand);
    }

    // Apply purchase type filter
    if (filterPurchaseType) {
      filtered = filtered.filter((w) => w.purchase_type === filterPurchaseType);
    }

    // Apply gender filter
    if (filterGender) {
      filtered = filtered.filter((w) => w.gender === filterGender);
    }

    // Apply date range filter
    if (filterDateFrom) {
      filtered = filtered.filter((w) => {
        const purchaseDate = new Date(w.purchase_date);
        const fromDate = new Date(filterDateFrom);
        return purchaseDate >= fromDate;
      });
    }

    if (filterDateTo) {
      filtered = filtered.filter((w) => {
        const purchaseDate = new Date(w.purchase_date);
        const toDate = new Date(filterDateTo);
        return purchaseDate <= toDate;
      });
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) aValue = "";
        if (bValue === null || bValue === undefined) bValue = "";

        // Handle date fields
        if (sortField === "purchase_date" || sortField === "birthdate") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        // Handle string comparison
        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredWarranties(filtered);
    setCurrentPage(1); // Reset to first page after filtering/sorting
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [search, filterBrand, filterPurchaseType, filterGender, filterDateFrom, filterDateTo, sortField, sortDirection, allWarranties]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterBrand("");
    setFilterPurchaseType("");
    setFilterGender("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSortField("");
    setSortDirection("asc");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this warranty?")) return;
    try {
      await api.delete(`/warranty/warranties/${id}`);
      
      setAllWarranties((prev) => prev.filter((w) => w.registration_id !== id));
      setFilteredWarranties((prev) => prev.filter((w) => w.registration_id !== id));
      
      const newFiltered = filteredWarranties.filter((w) => w.registration_id !== id);
      const newTotalPages = Math.ceil(newFiltered.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (err: any) {
      console.error("Delete error", err);
      
      if (err.response?.status === 401) {
        handleTokenExpiration();
        return;
      }
      
      alert("Failed to delete warranty.");
    }
  };

  // Get unique values for filter dropdowns
  const uniqueBrands = Array.from(new Set(allWarranties.map(w => w.brand).filter(Boolean)));
  const uniqueGenders = Array.from(new Set(allWarranties.map(w => w.gender).filter(Boolean)));

  // Calculate pagination values
  const totalItems = filteredWarranties.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentWarranties = filteredWarranties.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => goToPage(1)}
          className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="start-ellipsis" className="px-2">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? "bg-jbl-orange text-white"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="end-ellipsis" className="px-2">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <span className="ml-1 text-gray-500">⇅</span>;
    }
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  const exportToCSV = () => {
    // Prepare headers
    const headers = [
      "Name", "Email", "Contact Number", "Gender", "Birthdate",
      "Brand", "Product", "Purchase Type", "Store Name", "Store Branch",
      "Online Platform", "Online Store", "Purchase Date", "Receipt Number",
      "Serial Number", "Terms Accepted", "PDPA Accepted"
    ];

    // Prepare data rows
    const rows = filteredWarranties.map(w => [
      w.name || "",
      w.email || "",
      w.contact_number || "",
      w.gender || "",
      formatDate(w.birthdate),
      w.brand || "",
      w.product_name || "",
      w.purchase_type || "",
      w.store_name || "",
      w.store_branch || "",
      w.online_platform || "",
      w.online_store || "",
      formatDate(w.purchase_date),
      w.receipt_number || "",
      w.serial_number || "",
      w.terms_accepted ? "Yes" : "No",
      w.pdpa_accepted ? "Yes" : "No"
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => 
        row.map(cell => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const cellStr = String(cell);
          if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(",")
      )
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `warranties_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Create a printable version
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export PDF");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Warranties Report - ${new Date().toISOString().split('T')[0]}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #000;
            }
            h1 {
              text-align: center;
              margin-bottom: 20px;
            }
            .info {
              text-align: center;
              margin-bottom: 20px;
              font-size: 12px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 6px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            @media print {
              body { margin: 0; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <h1>Warranties Report</h1>
          <div class="info">
            Generated on: ${new Date().toLocaleString()}<br>
            Total Records: ${filteredWarranties.length}
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Gender</th>
                <th>Birthdate</th>
                <th>Brand</th>
                <th>Product</th>
                <th>Type</th>
                <th>Store</th>
                <th>Branch</th>
                <th>Platform</th>
                <th>Online Store</th>
                <th>Purchase Date</th>
                <th>Receipt #</th>
                <th>Serial #</th>
                <th>Terms</th>
                <th>PDPA</th>
              </tr>
            </thead>
            <tbody>
              ${filteredWarranties.map(w => `
                <tr>
                  <td>${w.name || ""}</td>
                  <td>${w.email || ""}</td>
                  <td>${w.contact_number || ""}</td>
                  <td>${w.gender || ""}</td>
                  <td>${formatDate(w.birthdate)}</td>
                  <td>${w.brand || ""}</td>
                  <td>${w.product_name || ""}</td>
                  <td>${w.purchase_type || ""}</td>
                  <td>${w.store_name || ""}</td>
                  <td>${w.store_branch || ""}</td>
                  <td>${w.online_platform || ""}</td>
                  <td>${w.online_store || ""}</td>
                  <td>${formatDate(w.purchase_date)}</td>
                  <td>${w.receipt_number || ""}</td>
                  <td>${w.serial_number || ""}</td>
                  <td>${w.terms_accepted ? "Yes" : "No"}</td>
                  <td>${w.pdpa_accepted ? "Yes" : "No"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  return (
    <>
      <AdminNavbar />
      <div className="p-6 text-white bg-gray-900 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Warranty Management</h1>

        {/* Search Bar */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Search by name, email, product, brand, or serial number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 rounded bg-gray-700 border border-gray-600 flex-1"
          />
        </div>

        {/* Filters Section - Collapsible */}
        <div className="mb-6 bg-gray-800 rounded-lg">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-750 rounded-lg transition-colors"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {(filterBrand || filterPurchaseType || filterGender || filterDateFrom || filterDateTo) && (
                <span className="ml-2 px-2 py-1 bg-jbl-orange text-white text-xs rounded-full">
                  Active
                </span>
              )}
            </h2>
            <svg 
              className={`w-5 h-5 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isFiltersOpen && (
            <div className="p-4 border-t border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1">Brand</label>
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                  >
                    <option value="">All Brands</option>
                    {uniqueBrands.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Purchase Type</label>
                  <select
                    value={filterPurchaseType}
                    onChange={(e) => setFilterPurchaseType(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                  >
                    <option value="">All Types</option>
                    <option value="Store">Store</option>
                    <option value="Online">Online</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Gender</label>
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                  >
                    <option value="">All Genders</option>
                    {uniqueGenders.map((gender) => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Purchase Date From</label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Purchase Date To</label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white [color-scheme:dark]"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredWarranties.length === 0 ? (
          <p>No warranties found.</p>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Showing {startIndex + 1} to {endIndex} of {totalItems} warranties
                {totalItems !== allWarranties.length && ` (filtered from ${allWarranties.length} total)`}
              </div>
              
              {/* Export Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Export PDF
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-md">
              <table className="min-w-full border border-gray-700 text-sm">
                <thead>
                  <tr className="bg-gray-800">
                    <th 
                      className="p-2 border border-gray-700 cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort("name")}
                    >
                      Name <SortIcon field="name" />
                    </th>
                    <th 
                      className="p-2 border border-gray-700 cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort("email")}
                    >
                      Email <SortIcon field="email" />
                    </th>
                    <th className="p-2 border border-gray-700">Contact Number</th>
                    <th 
                      className="p-2 border border-gray-700 cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort("gender")}
                    >
                      Gender <SortIcon field="gender" />
                    </th>
                    <th 
                      className="p-2 border border-gray-700 cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort("birthdate")}
                    >
                      Birthdate <SortIcon field="birthdate" />
                    </th>
                    <th 
                      className="p-2 border border-gray-700 cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort("brand")}
                    >
                      Brand <SortIcon field="brand" />
                    </th>
                    <th 
                      className="p-2 border border-gray-700 cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort("product_name")}
                    >
                      Product <SortIcon field="product_name" />
                    </th>
                    <th 
                      className="p-2 border border-gray-700 cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort("purchase_type")}
                    >
                      Purchase Type <SortIcon field="purchase_type" />
                    </th>
                    <th className="p-2 border border-gray-700">Store Name</th>
                    <th className="p-2 border border-gray-700">Store Branch</th>
                    <th className="p-2 border border-gray-700">Online Platform</th>
                    <th className="p-2 border border-gray-700">Online Store</th>
                    <th 
                      className="p-2 border border-gray-700 cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort("purchase_date")}
                    >
                      Purchase Date <SortIcon field="purchase_date" />
                    </th>
                    <th className="p-2 border border-gray-700">Receipt Number</th>
                    <th 
                      className="p-2 border border-gray-700 cursor-pointer hover:bg-gray-700"
                      onClick={() => handleSort("serial_number")}
                    >
                      Serial Number <SortIcon field="serial_number" />
                    </th>
                    <th className="p-2 border border-gray-700">Receipt Image</th>
                    <th className="p-2 border border-gray-700">Terms Accepted</th>
                    <th className="p-2 border border-gray-700">PDPA Accepted</th>
                    <th className="p-2 border border-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentWarranties.map((w) => (
                    <tr key={w.id} className="text-center bg-gray-900 hover:bg-gray-800">
                      <td className="p-2 border border-gray-700">{w.name}</td>
                      <td className="p-2 border border-gray-700">{w.email}</td>
                      <td className="p-2 border border-gray-700">{w.contact_number}</td>
                      <td className="p-2 border border-gray-700">{w.gender}</td>
                      <td className="p-2 border border-gray-700">{formatDate(w.birthdate)}</td>
                      <td className="p-2 border border-gray-700">{w.brand}</td>
                      <td className="p-2 border border-gray-700">{w.product_name}</td>
                      <td className="p-2 border border-gray-700">{w.purchase_type || "N/A"}</td>
                      <td className="p-2 border border-gray-700">{w.store_name || "N/A"}</td>
                      <td className="p-2 border border-gray-700">{w.store_branch || "N/A"}</td>
                      <td className="p-2 border border-gray-700">{w.online_platform || "N/A"}</td>
                      <td className="p-2 border border-gray-700">{w.online_store || "N/A"}</td>
                      <td className="p-2 border border-gray-700">{formatDate(w.purchase_date)}</td>
                      <td className="p-2 border border-gray-700">{w.receipt_number}</td>
                      <td className="p-2 border border-gray-700">{w.serial_number}</td>
                      <td className="p-2 border border-gray-700">
                        {w.receipt_image ? (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${w.receipt_image}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline"
                          >
                            View
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="p-2 border border-gray-700">
                        {w.terms_accepted ? "✅" : "❌"}
                      </td>
                      <td className="p-2 border border-gray-700">
                        {w.pdpa_accepted ? "✅" : "❌"}
                      </td>
                      <td className="p-2 border border-gray-700">
                        <button
                          onClick={() => handleDelete(w.registration_id)}
                          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded ${
                    currentPage === 1
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-jbl-orange hover:bg-orange-600"
                  }`}
                >
                  Previous
                </button>

                <div className="flex gap-2 items-center">
                  {renderPaginationButtons()}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-jbl-orange hover:bg-orange-600"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}