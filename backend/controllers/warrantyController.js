import { WarrantyModel } from "../models/warrantyModel.js";
import { v4 as uuidv4 } from "uuid";
import { validateEmail, validatePhoneNumber, validateDate } from "../utils/validators.js";

export const registerWarranty = async (req, res) => {
  try {
    const { 
      name, email, contactNumber, gender, birthdate, brand,
      productName, purchaseDate, purchaseFrom, 
      purchaseType, storeName, storeBranch, onlinePlatform, onlineStore,
      receiptNumber, serialNumber, termsAccepted, pdpaAccepted 
    } = req.body;

    // Validation checks...
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email",
        errors: ["Invalid email format"] 
      });
    }

    // Check for duplicate serial number
    const isDuplicate = await WarrantyModel.checkDuplicate(serialNumber, productName);
    if (isDuplicate) {
      return res.status(409).json({ 
        success: false, 
        message: "This serial number has already been registered for this product",
        errors: [`Serial number ${serialNumber} for product ${productName} is already registered`]
      });
    }

    const registrationId = uuidv4();
    const warranty = await WarrantyModel.create({
      registrationId, name, email, contactNumber, gender, birthdate,
      brand, productName, purchaseDate, purchaseFrom,
      purchaseType: purchaseType || null,
      storeName: storeName || null,
      storeBranch: storeBranch || null,
      onlinePlatform: onlinePlatform || null,
      onlineStore: onlineStore || null,
      receiptNumber, serialNumber,
      receiptImage: req.file?.filename || null,
      termsAccepted: termsAccepted === "true",
      pdpaAccepted: pdpaAccepted === "true"
    });

    res.status(201).json({ success: true, data: warranty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getWarranty = async (req, res) => {
  const warranty = await WarrantyModel.getById(req.params.id);
  if (!warranty) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data: warranty });
};