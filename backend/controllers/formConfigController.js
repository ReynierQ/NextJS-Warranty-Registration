import { FormConfigModel } from "../models/formConfigModel.js";

/**
 * GET /api/form/config
 * Retrieve the current form configuration
 */
export const getFormConfig = async (req, res) => {
  try {
    const config = await FormConfigModel.get();
    
    // Parse JSON strings if they come from database
    const storeOptions = typeof config.store_options === 'string' 
      ? JSON.parse(config.store_options) 
      : config.store_options;
      
    const onlinePlatformStores = typeof config.online_platform_stores === 'string'
      ? JSON.parse(config.online_platform_stores)
      : config.online_platform_stores;
      
    const brandOptions = typeof config.brand_options === 'string'
      ? JSON.parse(config.brand_options)
      : config.brand_options;
      
    const purchaseTypeOptions = typeof config.purchase_type_options === 'string'
      ? JSON.parse(config.purchase_type_options)
      : config.purchase_type_options;

    return res.status(200).json({
      success: true,
      data: {
        store_options: storeOptions,
        online_platform_stores: onlinePlatformStores,
        brand_options: brandOptions,
        purchase_type_options: purchaseTypeOptions
      }
    });
  } catch (error) {
    console.error('Error fetching form config:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch form configuration',
      error: error.message
    });
  }
};

/**
 * PUT /api/form/config
 * Update the form configuration
 * Requires admin authentication
 */
export const updateFormConfig = async (req, res) => {
  try {
    const {
      storeOptions,
      onlinePlatformStores,
      brand_options,
      purchase_type_options
    } = req.body;

    // Validate the input
    if (!storeOptions || !onlinePlatformStores || !brand_options || !purchase_type_options) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate brand_options is an array
    if (!Array.isArray(brand_options)) {
      return res.status(400).json({
        success: false,
        message: 'brand_options must be an array'
      });
    }

    // Validate purchase_type_options is an array
    if (!Array.isArray(purchase_type_options)) {
      return res.status(400).json({
        success: false,
        message: 'purchase_type_options must be an array'
      });
    }

    // Update the configuration
    const config = await FormConfigModel.update({
      storeOptions,
      onlinePlatformStores,
      brand_options,
      purchase_type_options
    });

    // Parse the returned data
    const storeOpts = typeof config.store_options === 'string' 
      ? JSON.parse(config.store_options) 
      : config.store_options;
      
    const onlineStores = typeof config.online_platform_stores === 'string'
      ? JSON.parse(config.online_platform_stores)
      : config.online_platform_stores;
      
    const brands = typeof config.brand_options === 'string'
      ? JSON.parse(config.brand_options)
      : config.brand_options;
      
    const purchaseTypes = typeof config.purchase_type_options === 'string'
      ? JSON.parse(config.purchase_type_options)
      : config.purchase_type_options;

    return res.status(200).json({
      success: true,
      message: 'Configuration updated successfully',
      data: {
        store_options: storeOpts,
        online_platform_stores: onlineStores,
        brand_options: brands,
        purchase_type_options: purchaseTypes
      }
    });
  } catch (error) {
    console.error('Error updating form config:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update form configuration',
      error: error.message
    });
  }
};