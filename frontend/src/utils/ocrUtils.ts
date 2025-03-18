import axios from "axios";
import { toast } from "sonner";

// OCR service options (can be modified based on which service you're using)
const OCR_API_URL = "http://localhost:5000/api/ocr"; // Correct endpoint

export interface OCRResponse {
  text: string;
  fields?: {
    [key: string]: string;
  };
  success: boolean;
}

/**
 * Process an image through OCR to extract text and structured data
 */
export const processImageOCR = async (file: File): Promise<OCRResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(OCR_API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      text: response.data.text,
      fields: response.data.fields || {},
      success: true,
    };
  } catch (error) {
    console.error(
      "OCR processing error:",
      error.response?.data || error.message
    );
    toast.error("Failed to extract text from document");
    throw error; // Ensure the error is propagated
  }
};

/**
 * Extract specific information from Aadhaar card
 */
export const processAadhaarCard = async (file: File) => {
  const result = await processImageOCR(file);

  if (!result.success) return null;

  // For Aadhaar cards, we would extract:
  // 1. Full name
  // 2. Aadhaar number
  // 3. Date of birth
  // 4. Gender
  // 5. Address

  // This is a simplified example - in a real implementation,
  // the OCR service would need to be trained to extract these specific fields
  const extractedData = {
    name: result.fields?.name || extractNameFromText(result.text),
    aadhaarNumber:
      result.fields?.aadhaarNumber || extractAadhaarNumberFromText(result.text),
    dob: result.fields?.dob || extractDOBFromText(result.text),
    gender: result.fields?.gender || extractGenderFromText(result.text),
    address: result.fields?.address || extractAddressFromText(result.text),
  };

  return extractedData;
};

/**
 * Extract specific information from PAN card
 */
export const processPANCard = async (file: File) => {
  const result = await processImageOCR(file);

  if (!result.success) return null;

  // For PAN cards, we would extract:
  // 1. Full name
  // 2. PAN number
  // 3. Date of birth

  // This is a simplified example
  const extractedData = {
    name: result.fields?.name || extractNameFromText(result.text),
    panNumber:
      result.fields?.panNumber || extractPANNumberFromText(result.text),
    dob: result.fields?.dob || extractDOBFromText(result.text),
  };

  return extractedData;
};

// Helper functions to extract specific data from OCR text
// These are simplified and would need more sophisticated regex in production

function extractNameFromText(text: string): string {
  // Very simplified name extraction
  const nameMatch = text.match(/Name[:\s]+([A-Za-z\s]+)/i);
  return nameMatch ? nameMatch[1].trim() : "";
}

function extractAadhaarNumberFromText(text: string): string {
  // Look for 12-digit number pattern typical of Aadhaar
  const aadhaarMatch = text.match(/\d{4}[\s-]?\d{4}[\s-]?\d{4}/);
  return aadhaarMatch ? aadhaarMatch[0].replace(/[\s-]/g, " ") : "";
}

function extractPANNumberFromText(text: string): string {
  // PAN format: AAAAA0000A (5 letters, 4 numbers, 1 letter)
  const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
  return panMatch ? panMatch[0] : "";
}

function extractDOBFromText(text: string): string {
  // Improved regex for date patterns
  const dobMatch = text.match(/\b(\d{2}[\/\-]\d{2}[\/\-]\d{4})\b/);
  return dobMatch ? dobMatch[0] : "";
}

function extractGenderFromText(text: string): string {
  // Improved gender extraction logic
  if (/male/i.test(text)) return "Male";
  if (/female/i.test(text)) return "Female";
  return "";
}

function extractAddressFromText(text: string): string {
  // Simplified address extraction
  const addressMatch = text.match(/Address[:\s]+([\s\S]+?)(?=\n[A-Z]|$)/i);
  return addressMatch ? addressMatch[1].trim() : "";
}
