"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/app/components/admin-navbar/admin-navbar";
import api from "@/utils/api";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";

export default function AdminFormEditor() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"stores" | "online" | "brands" | "purchaseTypes">("stores");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [storeOptions, setStoreOptions] = useState<any>({});
  const [onlinePlatformStores, setOnlinePlatformStores] = useState<any>({});
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [purchaseTypeOptions, setPurchaseTypeOptions] = useState<string[]>([]);

  const [editingStore, setEditingStore] = useState<string | null>(null);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editingBrandIndex, setEditingBrandIndex] = useState<number | null>(null);
  const [editingPurchaseTypeIndex, setEditingPurchaseTypeIndex] = useState<number | null>(null);
  
  const [newStoreName, setNewStoreName] = useState("");
  const [newPlatformName, setNewPlatformName] = useState("");
  const [newBranch, setNewBranch] = useState("");
  const [newOnlineStore, setNewOnlineStore] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newPurchaseType, setNewPurchaseType] = useState("");

  const handleTokenExpiration = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    setError("Your session has expired. Redirecting to login...");
    setLoading(false);
    setTimeout(() => {
      router.push("/admin/login");
    }, 1500);
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Redirecting to login...");
      setLoading(false);
      setTimeout(() => {
        router.push("/admin/login");
      }, 1500);
      return;
    }

    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get("/form/config");
      const data = res.data.data;
      
      setStoreOptions(
        typeof data.store_options === 'string' 
          ? JSON.parse(data.store_options) 
          : data.store_options || {}
      );
      setOnlinePlatformStores(
        typeof data.online_platform_stores === 'string'
          ? JSON.parse(data.online_platform_stores)
          : data.online_platform_stores || {}
      );
      setBrandOptions(
        typeof data.brand_options === 'string'
          ? JSON.parse(data.brand_options)
          : data.brand_options || ["Brand 1", "Brand 2", "Brand 3", "Brand 4"]
      );
      setPurchaseTypeOptions(
        typeof data.purchase_type_options === 'string'
          ? JSON.parse(data.purchase_type_options)
          : data.purchase_type_options || ["Store", "Online"]
      );
    } catch (err: any) {
      console.error("Fetch config error:", err);
      if (err.response?.status === 401) {
        handleTokenExpiration();
        return;
      }
      setError("Failed to load configuration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Store Management Functions
  const addStore = () => {
    if (newStoreName.trim()) {
      setStoreOptions({ ...storeOptions, [newStoreName.trim()]: [] });
      setNewStoreName("");
    }
  };

  const deleteStore = (storeName: string) => {
    if (confirm(`Delete "${storeName}" and all its branches?`)) {
      const updated = { ...storeOptions };
      delete updated[storeName];
      setStoreOptions(updated);
    }
  };

  const addBranch = (storeName: string) => {
    if (newBranch.trim()) {
      const updated = { ...storeOptions };
      updated[storeName] = [...updated[storeName], newBranch.trim()];
      setStoreOptions(updated);
      setNewBranch("");
    }
  };

  const deleteBranch = (storeName: string, branch: string) => {
    const updated = { ...storeOptions };
    updated[storeName] = updated[storeName].filter(b => b !== branch);
    setStoreOptions(updated);
  };

  const renameStore = (oldName: string, newName: string) => {
    if (newName.trim() && newName !== oldName) {
      const updated: any = {};
      Object.keys(storeOptions).forEach(key => {
        if (key === oldName) {
          updated[newName] = storeOptions[key];
        } else {
          updated[key] = storeOptions[key];
        }
      });
      setStoreOptions(updated);
    }
    setEditingStore(null);
  };

  // Online Platform Management Functions
  const addPlatform = () => {
    if (newPlatformName.trim()) {
      setOnlinePlatformStores({ ...onlinePlatformStores, [newPlatformName.trim()]: [] });
      setNewPlatformName("");
    }
  };

  const deletePlatform = (platformName: string) => {
    if (confirm(`Delete "${platformName}" and all its stores?`)) {
      const updated = { ...onlinePlatformStores };
      delete updated[platformName];
      setOnlinePlatformStores(updated);
    }
  };

  const addOnlineStore = (platformName: string) => {
    if (newOnlineStore.trim()) {
      const updated = { ...onlinePlatformStores };
      updated[platformName] = [...updated[platformName], newOnlineStore.trim()];
      setOnlinePlatformStores(updated);
      setNewOnlineStore("");
    }
  };

  const deleteOnlineStore = (platformName: string, storeName: string) => {
    const updated = { ...onlinePlatformStores };
    updated[platformName] = updated[platformName].filter(s => s !== storeName);
    setOnlinePlatformStores(updated);
  };

  const renamePlatform = (oldName: string, newName: string) => {
    if (newName.trim() && newName !== oldName) {
      const updated: any = {};
      Object.keys(onlinePlatformStores).forEach(key => {
        if (key === oldName) {
          updated[newName] = onlinePlatformStores[key];
        } else {
          updated[key] = onlinePlatformStores[key];
        }
      });
      setOnlinePlatformStores(updated);
    }
    setEditingPlatform(null);
  };

  // Brand Management Functions
  const addBrand = () => {
    if (newBrand.trim() && !brandOptions.includes(newBrand.trim())) {
      setBrandOptions([...brandOptions, newBrand.trim()]);
      setNewBrand("");
    }
  };

  const deleteBrand = (index: number) => {
    if (confirm(`Delete "${brandOptions[index]}"?`)) {
      setBrandOptions(brandOptions.filter((_, i) => i !== index));
    }
  };

  const updateBrand = (index: number, newValue: string) => {
    if (newValue.trim()) {
      const updated = [...brandOptions];
      updated[index] = newValue.trim();
      setBrandOptions(updated);
    }
    setEditingBrandIndex(null);
  };

  // Purchase Type Management Functions
  const addPurchaseType = () => {
    if (newPurchaseType.trim() && !purchaseTypeOptions.includes(newPurchaseType.trim())) {
      setPurchaseTypeOptions([...purchaseTypeOptions, newPurchaseType.trim()]);
      setNewPurchaseType("");
    }
  };

  const deletePurchaseType = (index: number) => {
    if (confirm(`Delete "${purchaseTypeOptions[index]}"?`)) {
      setPurchaseTypeOptions(purchaseTypeOptions.filter((_, i) => i !== index));
    }
  };

  const updatePurchaseType = (index: number, newValue: string) => {
    if (newValue.trim()) {
      const updated = [...purchaseTypeOptions];
      updated[index] = newValue.trim();
      setPurchaseTypeOptions(updated);
    }
    setEditingPurchaseTypeIndex(null);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      await api.put("/form/config", {
        storeOptions,
        onlinePlatformStores,
        brand_options: brandOptions,
        purchase_type_options: purchaseTypeOptions
      });
      alert("✅ Changes saved successfully!");
    } catch (err: any) {
      console.error("Save error:", err);
      if (err.response?.status === 401) {
        handleTokenExpiration();
        return;
      }
      alert("❌ Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl mb-2">Loading configuration...</p>
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminNavbar />
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-xl mb-4">{error}</p>
            {(error.includes("session has expired") || error.includes("No authentication")) && (
              <p className="text-gray-400">Please wait...</p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Form Dropdown Editor</h1>
            <button
              onClick={saveChanges}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                saving 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab("stores")}
              className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === "stores"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Physical Stores
            </button>
            <button
              onClick={() => setActiveTab("online")}
              className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === "online"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Online Platforms
            </button>
            <button
              onClick={() => setActiveTab("brands")}
              className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === "brands"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Brands
            </button>
            <button
              onClick={() => setActiveTab("purchaseTypes")}
              className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
                activeTab === "purchaseTypes"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Purchase Types
            </button>
          </div>

          {/* Physical Stores Tab */}
          {activeTab === "stores" && (
            <div className="space-y-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Add New Store</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addStore()}
                    placeholder="Store name (e.g., Robinson's)"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                  />
                  <button
                    onClick={addStore}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                    Add Store
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(storeOptions).map(([storeName, branches]) => (
                  <div key={storeName} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      {editingStore === storeName ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            defaultValue={storeName}
                            onBlur={(e) => renameStore(storeName, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                renameStore(storeName, (e.target as HTMLInputElement).value);
                              }
                            }}
                            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-orange-500 text-white"
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingStore(null)}
                            className="text-gray-400 hover:text-white"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-xl font-semibold">{storeName}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingStore(storeName)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => deleteStore(storeName)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="ml-4 space-y-2">
                      <p className="text-sm text-gray-400 mb-2">Branches:</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(branches as string[]).map((branch) => (
                          <div
                            key={branch}
                            className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full"
                          >
                            <span className="text-sm">{branch}</span>
                            <button
                              onClick={() => deleteBranch(storeName, branch)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newBranch}
                          onChange={(e) => setNewBranch(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              addBranch(storeName);
                            }
                          }}
                          placeholder="Add new branch"
                          className="flex-1 px-3 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-orange-500 text-white"
                        />
                        <button
                          onClick={() => addBranch(storeName)}
                          className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Online Platforms Tab */}
          {activeTab === "online" && (
            <div className="space-y-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Add New Platform</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPlatformName}
                    onChange={(e) => setNewPlatformName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addPlatform()}
                    placeholder="Platform name (e.g., Amazon)"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                  />
                  <button
                    onClick={addPlatform}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                    Add Platform
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(onlinePlatformStores).map(([platformName, stores]) => (
                  <div key={platformName} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      {editingPlatform === platformName ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            defaultValue={platformName}
                            onBlur={(e) => renamePlatform(platformName, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                renamePlatform(platformName, (e.target as HTMLInputElement).value);
                              }
                            }}
                            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-orange-500 text-white"
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingPlatform(null)}
                            className="text-gray-400 hover:text-white"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-xl font-semibold">{platformName}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingPlatform(platformName)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => deletePlatform(platformName)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {platformName !== "jblstore.com.ph" && (
                      <div className="ml-4 space-y-2">
                        <p className="text-sm text-gray-400 mb-2">Stores:</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(stores as string[]).map((store) => (
                            <div
                              key={store}
                              className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full"
                            >
                              <span className="text-sm">{store}</span>
                              <button
                                onClick={() => deleteOnlineStore(platformName, store)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newOnlineStore}
                            onChange={(e) => setNewOnlineStore(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                addOnlineStore(platformName);
                              }
                            }}
                            placeholder="Add new store"
                            className="flex-1 px-3 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-orange-500 text-white"
                          />
                          <button
                            onClick={() => addOnlineStore(platformName)}
                            className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                    {platformName === "jblstore.com.ph" && (
                      <p className="ml-4 text-sm text-gray-400 italic">No sub-stores for this platform</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brands Tab */}
          {activeTab === "brands" && (
            <div className="space-y-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Add New Brand</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addBrand()}
                    placeholder="Brand name (e.g., Sony)"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                  />
                  <button
                    onClick={addBrand}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                    Add Brand
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Current Brands</h3>
                <div className="space-y-2">
                  {brandOptions.map((brand, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700 px-4 py-3 rounded-lg">
                      {editingBrandIndex === index ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            defaultValue={brand}
                            onBlur={(e) => updateBrand(index, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                updateBrand(index, (e.target as HTMLInputElement).value);
                              }
                            }}
                            className="flex-1 px-3 py-1 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:border-orange-500 text-white"
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingBrandIndex(null)}
                            className="text-gray-400 hover:text-white"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-white font-medium">{brand}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingBrandIndex(index)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => deleteBrand(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Purchase Types Tab */}
          {activeTab === "purchaseTypes" && (
            <div className="space-y-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Add New Purchase Type</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPurchaseType}
                    onChange={(e) => setNewPurchaseType(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addPurchaseType()}
                    placeholder="Purchase type (e.g., Retail)"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                  />
                  <button
                    onClick={addPurchaseType}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                    Add Type
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Current Purchase Types</h3>
                <div className="space-y-2">
                  {purchaseTypeOptions.map((type, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700 px-4 py-3 rounded-lg">
                      {editingPurchaseTypeIndex === index ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            defaultValue={type}
                            onBlur={(e) => updatePurchaseType(index, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                updatePurchaseType(index, (e.target as HTMLInputElement).value);
                              }
                            }}
                            className="flex-1 px-3 py-1 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:border-orange-500 text-white"
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingPurchaseTypeIndex(null)}
                            className="text-gray-400 hover:text-white"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-white font-medium">{type}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingPurchaseTypeIndex(index)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => deletePurchaseType(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}