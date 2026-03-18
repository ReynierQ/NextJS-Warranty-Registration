"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import DatePicker from '../date-picker/date-picker';
import { warrantyApi, WarrantyRegistrationData, formConfigApi  } from "@/utils/api/forms";
import Link from "next/link";
import { toast } from "react-toastify";


export default function Form() {
  const [currentStep, setCurrentStep] = useState(1);
  const [storeOptions, setStoreOptions] = useState<{ [key: string]: string[] }>({});
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [purchaseTypeOptions, setPurchaseTypeOptions] = useState<string[]>([]);
  const [onlinePlatformStores, setOnlinePlatformStores] = useState<{ [key: string]: string[] }>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    gender: "",
    birthdate: "",
    brand: "",
    productName: "",
    purchaseFrom: "",
    purchaseType: "", // Store or Online
    storeName: "", // Which store
    storeBranch: "", // Which branch
    onlinePlatform: "", // Lazada, TikTok, Shopee, jblstore.com.ph
    onlineStore: "", // JBL Lazada, Onward Lazada, etc.
    purchaseDate: "",
    receiptNumber: "",
    serialNumber: "",
    receiptImage: null as File | null,
    termsAccepted: false,
    pdpaAccepted: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const config = await formConfigApi.fetchConfig();

      setStoreOptions(config.storeOptions);
      setOnlinePlatformStores(config.onlinePlatformStores);

      // FIXED
      setBrandOptions(config.brandOptions || []);
      setPurchaseTypeOptions(config.purchaseTypeOptions || []);
    };

    fetchData();
  }, []);


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files, type, checked } = e.target as HTMLInputElement;
    
    // Reset dependent fields when parent field changes
    if (name === "purchaseType") {
      setFormData((prev) => ({
        ...prev,
        purchaseType: value,
        storeName: "",
        storeBranch: "",
        onlinePlatform: "",
        onlineStore: "",
        purchaseFrom: ""
      }));
      return;
    }
    
    if (name === "storeName") {
      setFormData((prev) => ({
        ...prev,
        storeName: value,
        storeBranch: ""
      }));
      return;
    }

    if (name === "storeBranch") {
      // Combine store name and branch for purchaseFrom
      setFormData((prev) => ({
        ...prev,
        storeBranch: value,
        purchaseFrom: `${prev.storeName} - ${value}`
      }));
      return;
    }
    
    if (name === "onlinePlatform") {
      setFormData((prev) => ({
        ...prev,
        onlinePlatform: value,
        onlineStore: "",
        purchaseFrom: value === "jblstore.com.ph" ? "jblstore.com.ph" : ""
      }));
      return;
    }

    if (name === "onlineStore") {
      setFormData((prev) => ({
        ...prev,
        onlineStore: value,
        purchaseFrom: value
      }));
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : files ? files[0] : value,
    }));
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          toast.warning(<b>Please enter your full name</b>);
          return false;
        }
        if (!formData.email.trim()) {
          toast.warning(<b>Please enter your email address</b>);
          return false;
        }
        const emailPattern = /^[^@]+@[^@]+\.[^@]+$/;
        if (!emailPattern.test(formData.email)) {
          toast.warning(<b>Please enter a valid email address (must contain @ and .)</b>);
          return false;
        }
        if (!formData.gender.trim()) {
          toast.warning(<b>Please select a gender</b>);
          return false;
        }
        if (!formData.contactNumber.trim()) {
          toast.warning(<b>Please enter your contact number</b>);
          return false;
        }
        const phone = formData.contactNumber.trim();
        if (phone.startsWith("09")) {
          if (!/^\d{11}$/.test(phone)) {
            toast.warning(<b>Number starting with 09 must be exactly 11 digits (e.g. 09171234567).</b>);
            return false;
          }
        } else if (phone.startsWith("+639")) {
          if (!/^\+639\d{9}$/.test(phone)) {
            toast.warning(<b>Number starting with +639 must be exactly 13 characters (e.g. +639171234567).</b>);
            return false;
          }
        } else {
          toast.warning(<b>Contact number must start with 09 or +639.</b>);
          return false;
        }
        if (!formData.birthdate) {
          toast.warning(<b>Please select your date of birth</b>);
          return false;
        }
        return true;

      case 2:
        if (!formData.brand) {
          toast.warning(<b>Please select a brand</b>);
          return false;
        }
        if (!formData.productName.trim()) {
          toast.warning(<b>Please enter the product name/model</b>);
          return false;
        }
        if (!formData.serialNumber.trim()) {
          toast.warning(<b>Please enter the serial number</b>);
          return false;
        }
        return true;

      case 3:
        if (!formData.purchaseType) {
          toast.warning(<b>Please select purchase type (Store or Online)</b>);
          return false;
        }
        if (formData.purchaseType === "Store") {
          if (!formData.storeName) {
            toast.warning(<b>Please select a store</b>);
            return false;
          }
          if (!formData.storeBranch) {
            toast.warning(<b>Please select a branch</b>);
            return false;
          }
        } else if (formData.purchaseType === "Online") {
          if (!formData.onlinePlatform) {
            toast.warning(<b>Please select an online platform</b>);
            return false;
          }
          if (formData.onlinePlatform !== "jblstore.com.ph" && !formData.onlineStore) {
            toast.warning(<b>Please select an online store</b>);
            return false;
          }
        }
        if (!formData.purchaseDate) {
          toast.warning(<b>Please select the purchase date</b>);
          return false;
        }
        if (!formData.receiptNumber.trim()) {
          toast.warning(<b>Please enter the receipt/invoice number</b>);
          return false;
        }
        if (!formData.receiptImage) {
          toast.warning(<b>Please upload the receipt/invoice</b>);
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.termsAccepted) {
      toast.warning(<b>You must accept the Terms and Conditions.</b>);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await warrantyApi.submitRegistration(formData as WarrantyRegistrationData);
      
      if (result.success) {
        toast.success(<b>✅ Registration successful!</b>);
        
        setFormData({
          name: "",
          email: "",
          contactNumber: "",
          gender: "",
          birthdate: "",
          brand: "",
          productName: "",
          purchaseFrom: "",
          purchaseType: "",
          storeName: "",
          storeBranch: "",
          onlinePlatform: "",
          onlineStore: "",
          purchaseDate: "",
          receiptNumber: "",
          serialNumber: "",
          receiptImage: null,
          termsAccepted: false,
          pdpaAccepted: false,
        });
        setCurrentStep(1);
      }
      else if (result.errors && result.errors.length > 0) {
        toast.error(<b>❌ Registration failed:\n\n{result.errors.join("\n")}</b>);
      }
    } 
    catch (error: any) {
      console.error("Submission error:", error);

      if (error.message.includes("duplicate") || error.message.includes("already been registered")) {
        toast.error(<b>❌ This serial number is already registered for the selected product. Please double-check your entry.</b>);
      } else if (error instanceof Error) {
        toast.error(<b>❌ This serial number is already registered for the selected product. Please double-check your entry.</b>);
      } else {
        toast.error(<b>❌ Registration failed. Please try again.</b>);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => {
    const steps = [
      { number: 1, label: "Personal Info" },
      { number: 2, label: "Product Info" },
      { number: 3, label: "Purchase Info" },
      { number: 4, label: "Review & Submit" }
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep >= step.number
                      ? 'bg-jbl-orange text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {step.number}
                </div>
                <span className={`text-xs mt-2 ${
                  currentStep >= step.number ? 'text-white' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 mx-0 transition-colors ${
                    currentStep > step.number ? 'bg-jbl-orange' : 'bg-gray-600'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto p-4 rounded-lg shadow-lg max-w-2xl mb-12 sm:mb-8 md:mb-8">
      {renderProgressBar()}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Personal Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-jbl-orange focus:border-jbl-orange focus:outline-none transition-colors text-white bg-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-white rounded-lg px-3 py-2 
               focus:ring-2 focus:ring-jbl-orange focus:border-jbl-orange 
               focus:outline-none transition-colors text-white bg-transparent"
                placeholder="your.email@example.com"
                pattern="^[^@]+@[^@]+\.[^@]+$"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactNumber"
                required
                value={formData.contactNumber}
                onChange={(e) => {
                  let value = e.target.value;
                  value = value.replace(/[^\d+]/g, '');
                  if (!value.startsWith('+63')) {
                    value = '+63';
                  }
                  if (value.length > 13) {
                    value = value.slice(0, 13);
                  }
                  handleChange({
                    target: {
                      name: 'contactNumber',
                      value: value,
                      type: 'tel'
                    }
                  } as any);
                }}
                onFocus={(e) => {
                  if (!e.target.value) {
                    handleChange({
                      target: {
                        name: 'contactNumber',
                        value: '+63',
                        type: 'tel'
                      }
                    } as any);
                  }
                }}
                onKeyDown={(e) => {
                  const input = e.target as HTMLInputElement;
                  const cursorPosition = input.selectionStart || 0;
                  if (
                    (e.key === 'Backspace' || e.key === 'Delete') &&
                    cursorPosition <= 3
                  ) {
                    e.preventDefault();
                  }
                }}
                className="w-full border border-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-jbl-orange focus:border-jbl-orange focus:outline-none transition-colors text-white bg-transparent"
                placeholder="+639XXXXXXXXX"
                maxLength={13}
                minLength={13}
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2">Gender</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, gender: e.target.value }))
                    }
                    className="accent-jbl-orange"
                  />
                  Male
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, gender: e.target.value }))
                    }
                    className="accent-jbl-orange"
                  />
                  Female
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value="prefer not to say"
                    checked={formData.gender === "prefer not to say"}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, gender: e.target.value }))
                    }
                    className="accent-jbl-orange"
                  />
                  Prefer not to say
                </label>
              </div>
            </div>

            <DatePicker
              name="birthdate"
              value={formData.birthdate}
              onChange={handleDateChange}
              required
              label="Date of Birth"
            />
          </div>
        )}

        {/* Step 2: Product Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Product Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                name="brand"
                required
                value={formData.brand}
                onChange={handleChange}
                className="w-full border border-white rounded-lg px-3 py-2 bg-black text-white focus:ring-2 focus:ring-white focus:border-white focus:outline-none transition-colors"
              >
                <option value="">Select a brand</option>
                {brandOptions.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Product Name/Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="productName"
                required
                value={formData.productName}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setFormData((prev) => ({
                    ...prev,
                    productName: value,
                  }));
                }}
                className="w-full border border-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-jbl-orange focus:border-jbl-orange focus:outline-none transition-colors text-white bg-transparent uppercase"
                placeholder="E.G., JBLFLIP6, CHARGE5, ETC."
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Serial Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="serialNumber"
                required
                value={formData.serialNumber}
                onChange={(e) => {
                  let value = e.target.value;
                  value = value.replace(/[^a-zA-Z0-9- ]/g, '');
                  value = value.toUpperCase();
                  handleChange({
                    target: {
                      name: 'serialNumber',
                      value: value,
                      type: 'text'
                    }
                  } as any);
                }}
                className="w-full border border-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-jbl-orange focus:border-jbl-orange focus:outline-none transition-colors text-white bg-transparent uppercase"
                placeholder="Found on product label or packaging"
                maxLength={70}
              />
            </div>
          </div>
        )}

        {/* Step 3: Purchase Information */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Purchase Information</h3>

            {/* Purchase Type: Store or Online */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Purchase Type <span className="text-red-500">*</span>
              </label>
              <select
                name="purchaseType"
                required
                value={formData.purchaseType}
                onChange={handleChange}
                className="w-full border border-white rounded-lg px-3 py-2 bg-black text-white focus:ring-2 focus:ring-white focus:border-white focus:outline-none transition-colors"
              >
                <option value="">Select purchase type</option>
                {purchaseTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* If Store is selected */}
            {formData.purchaseType === "Store" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Store Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    required
                    value={formData.storeName}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      setFormData((prev) => ({
                        ...prev,
                        storeName: value,
                      }));
                    }}
                    className="w-full border border-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-jbl-orange focus:border-jbl-orange focus:outline-none transition-colors text-white bg-transparent uppercase"
                    placeholder="ENTER STORE NAME"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Store Branch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="storeBranch"
                    required
                    value={formData.storeBranch}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      setFormData((prev) => ({
                        ...prev,
                        storeBranch: value,
                      }));
                    }}
                    className="w-full border border-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-jbl-orange focus:border-jbl-orange focus:outline-none transition-colors text-white bg-transparent uppercase"
                    placeholder="ENTER STORE BRANCH"
                    maxLength={100}
                  />
                </div>
              </>
            )}

            {/* If Online is selected */}
            {formData.purchaseType === "Online" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Online Platform <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="onlinePlatform"
                    required
                    value={formData.onlinePlatform}
                    onChange={handleChange}
                    className="w-full border border-white rounded-lg px-3 py-2 bg-black text-white focus:ring-2 focus:ring-white focus:border-white focus:outline-none transition-colors"
                  >
                    <option value="">Select platform</option>
                    {Object.keys(onlinePlatformStores).map((platform) => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                </div>

                {formData.onlinePlatform && formData.onlinePlatform !== "jblstore.com.ph" && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Online Store <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="onlineStore"
                      required
                      value={formData.onlineStore}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        setFormData((prev) => ({
                          ...prev,
                          onlineStore: value,
                        }));
                      }}
                      className="w-full border border-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-jbl-orange focus:border-jbl-orange focus:outline-none transition-colors text-white bg-transparent uppercase"
                      placeholder="ENTER ONLINE STORE NAME"
                      maxLength={100}
                    />
                  </div>
                )}
              </>
            )}
            
            <DatePicker
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleDateChange}
              required
              label="Purchase Date"
            />

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Receipt/Invoice Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="receiptNumber"
                required
                value={formData.receiptNumber}
                onChange={(e) => {
                  let value = e.target.value;
                  value = value.replace(/[^a-zA-Z0-9- ]/g, '');
                  handleChange({
                    target: {
                      name: 'receiptNumber',
                      value: value,
                      type: 'text'
                    }
                  } as any);
                }}
                className="w-full border border-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-jbl-orange focus:border-jbl-orange focus:outline-none transition-colors text-white bg-transparent uppercase"
                placeholder="Receipt or invoice number"
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Upload Receipt/Invoice <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-white rounded-lg p-6 text-center hover:border-jbl-orange transition-colors">
                <input
                  type="file"
                  name="receiptImage"
                  required
                  accept="image/*,.pdf"
                  onChange={handleChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-jbl-orange file:text-white hover:file:bg-jbl-orange/80 transition-colors"
                />
                <p className="text-xs text-gray-300 mt-2">
                  Accepted formats: JPG, PNG, PDF (Max 5MB)
                </p>
                {formData.receiptImage && (
                  <p className="text-sm text-green-400 mt-2">
                    ✓ File selected: {formData.receiptImage.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Review & Submit</h3>
            
            {/* Review Summary */}
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Personal Information</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300"><span className="font-medium text-white">Name:</span> {formData.name}</p>
                  <p className="text-gray-300"><span className="font-medium text-white">Email:</span> {formData.email}</p>
                  <p className="text-gray-300"><span className="font-medium text-white">Contact:</span> {formData.contactNumber}</p>
                  <p className="text-gray-300"><span className="font-medium text-white">Birthdate:</span> {formData.birthdate}</p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-semibold text-white mb-3">Product Information</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300"><span className="font-medium text-white">Brand:</span> {formData.brand}</p>
                  <p className="text-gray-300"><span className="font-medium text-white">Product:</span> {formData.productName}</p>
                  <p className="text-gray-300"><span className="font-medium text-white">Serial Number:</span> {formData.serialNumber}</p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-semibold text-white mb-3">Purchase Information</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300"><span className="font-medium text-white">Purchase From:</span> {formData.purchaseFrom}</p>
                  <p className="text-gray-300"><span className="font-medium text-white">Purchase Date:</span> {formData.purchaseDate}</p>
                  <p className="text-gray-300"><span className="font-medium text-white">Receipt Number:</span> {formData.receiptNumber}</p>
                  <p className="text-gray-300"><span className="font-medium text-white">Receipt File:</span> {formData.receiptImage?.name}</p>
                </div>
              </div>
            </div>

            {/* Service Centre Info */}
            <div className="bg-gray-800 text-white p-4 rounded-lg space-y-2">
              <p className="font-semibold">Service Centre Address:</p>
              <p className="text-sm">Address Here</p>
              <p className="text-sm"><span className="font-semibold">Email:</span> <a href="mailto:example@info.com.com" className="text-red-500 underline">example@info.com</a></p>
              <p className="text-sm"><span className="font-semibold">Mobile:</span> Contact Number Here</p>
              <p className="text-sm"><span className="font-semibold">Hours:</span> Mon–Fri 8:00 am – 5:30 pm</p>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                required
                className="mt-1"
              />
              <label className="text-sm text-white">
                <span className="font-semibold">Terms and Conditions*</span>
                <br />
                I acknowledge that I have read and understood the terms and conditions, and I agree to all of the terms.
              </label>
            </div>

            {/* PDPA */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                name="pdpaAccepted"
                checked={formData.pdpaAccepted}
                onChange={handleChange}
                className="mt-1"
              />
              <label className="text-sm text-white">
                <span className="font-semibold">PDPA</span>
                <br />
                I agree to receive marketing communications from IMS Marketing Pte Ltd and our related entities. Your personal information will be processed in accordance with our <Link href="/" style={{ color: "var(--jbl-orange)" }} className="underline">Privacy Policy</Link>.
                <br /><br />
                You may withdraw your consent at any time by emailing us at <a href="mailto:example@info.com" className="underline text-red-500">example@info.com</a>.
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 mb-10">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold bg-transparent hover:bg-button-orange transition-colors"
            >
              Previous
            </button>

          )}
          
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto px-6 py-3 text-white border-2 border-white rounded-lg font-semibold hover:bg-button-orange transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`ml-auto px-6 py-3 rounded-lg font-semibold transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : 'border-2 border-white text-white hover:bg-button-orange'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}