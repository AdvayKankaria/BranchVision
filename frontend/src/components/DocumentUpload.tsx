import React, { useState } from "react";
import {
  Upload,
  Check,
  X,
  FileText,
  Camera,
  Image,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { processAadhaarCard, processPANCard } from "@/utils/ocrUtils";

type DocumentType = "aadhaar" | "pan" | "income";

interface DocumentUploadProps {
  docType: DocumentType;
  onDocumentUploaded?: (file: File, type: DocumentType) => void;
  onOCRComplete?: (data: any, docType: DocumentType) => void;
  className?: string;
}

const DocumentUpload = ({
  docType,
  onDocumentUploaded,
  onOCRComplete,
  className,
}: DocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const documentLabels: Record<DocumentType, string> = {
    aadhaar: "Aadhaar Card",
    pan: "PAN Card",
    income: "Income Proof",
  };

  const documentDescriptions: Record<DocumentType, string> = {
    aadhaar: "Upload your Aadhaar card for identification verification",
    pan: "Upload your PAN card for tax and financial verification",
    income: "Upload salary slips, bank statements or Form 16",
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const processOCR = async (fileToProcess: File) => {
    setIsOCRProcessing(true);
    let extractedData = null;

    try {
      if (docType === "aadhaar") {
        extractedData = await processAadhaarCard(fileToProcess);
        if (extractedData) {
          setExtractedText(
            `Name: ${extractedData.name || "Not detected"}\nAadhaar: ${
              extractedData.aadhaarNumber || "Not detected"
            }\nDOB: ${extractedData.dob || "Not detected"}`
          );
          toast.success("Information extracted from Aadhaar card");
        }
      } else if (docType === "pan") {
        extractedData = await processPANCard(fileToProcess);
        if (extractedData) {
          setExtractedText(
            `Name: ${extractedData.name || "Not detected"}\nPAN: ${
              extractedData.panNumber || "Not detected"
            }`
          );
          toast.success("Information extracted from PAN card");
        }
      }

      if (extractedData && onOCRComplete) {
        onOCRComplete(extractedData, docType);
      }
    } catch (error) {
      console.error("OCR processing error:", error);
      toast.error(
        `Failed to extract information from ${documentLabels[docType]}`
      );
    } finally {
      setIsOCRProcessing(false);
    }
  };

  const handleFileUpload = async (file: File, docType: DocumentType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", docType);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `${documentLabels[docType]} uploaded successfully: ${data.filePath}`
        );
      } else {
        const errorText = await response.text();
        console.error("Upload failed:", errorText);
        toast.error(
          `Failed to upload ${documentLabels[docType]}: ${errorText}`
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred during upload. Please try again.");
    }
  };

  const handleFileChange = async (fileToUpload: File) => {
    // Check if file is an image
    if (!fileToUpload.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (max 5MB)
    if (fileToUpload.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    // Validate image dimensions
    const image = document.createElement("img");
    image.src = URL.createObjectURL(fileToUpload);
    image.onload = () => {
      if (image.width < 3 || image.height < 3) {
        toast.error(
          `Image dimensions are too small (${image.width}x${image.height}). Minimum size is 3x3 pixels.`
        );
        return;
      }

      // Proceed with file upload and processing
      setFile(fileToUpload);
      const fileUrl = URL.createObjectURL(fileToUpload);
      setPreview(fileUrl);
      setIsProcessed(false);
      setExtractedText(null);

      setIsUploading(true);

      if (docType === "aadhaar" || docType === "pan") {
        processOCR(fileToUpload).then(() => {
          handleFileUpload(fileToUpload, docType);
        });
      } else {
        handleFileUpload(fileToUpload, docType);
      }

      setTimeout(() => {
        setIsUploading(false);
        setIsProcessed(true);
        if (onDocumentUploaded) {
          onDocumentUploaded(fileToUpload, docType);
        }
        toast.success(`${documentLabels[docType]} uploaded successfully`);
      }, 1500);
    };
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Create temporary video and canvas elements
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      // Wait for video to initialize
      setTimeout(() => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);

          // Convert to file
          canvas.toBlob((blob) => {
            if (blob) {
              const capturedFile = new File([blob], `${docType}_capture.jpg`, {
                type: "image/jpeg",
              });
              handleFileChange(capturedFile);
            }
            // Stop all video tracks
            stream.getTracks().forEach((track) => track.stop());
          }, "image/jpeg");
        }
      }, 300);
    } catch (error) {
      toast.error("Could not access camera");
      console.error("Camera access error:", error);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setIsProcessed(false);
    setExtractedText(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <h3 className="text-xl font-medium mb-2">{documentLabels[docType]}</h3>
      <p className="text-gray-600 mb-4 text-sm">
        {documentDescriptions[docType]}
      </p>

      {!file ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 transition-all duration-200 bg-gray-50/50",
            isDragging ? "border-primary bg-primary/5" : "border-gray-300"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="w-12 h-12 text-gray-400 mb-3" />
            <h4 className="text-lg font-medium mb-1">
              Upload {documentLabels[docType]}
            </h4>
            <p className="text-gray-500 text-sm mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={triggerFileInput}
                className="flex items-center space-x-1 py-2 px-4 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Browse Files</span>
              </button>
              <button
                type="button"
                onClick={handleCameraCapture}
                className="flex items-center space-x-1 py-2 px-4 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Use Camera</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileInputChange}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt={`${documentLabels[docType]} Preview`}
                className="w-full h-auto object-contain max-h-[300px]"
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  type="button"
                  onClick={resetUpload}
                  className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Image className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700 truncate max-w-[150px]">
                  {file.name}
                </span>
              </div>
              <div className="flex items-center">
                {isUploading || isOCRProcessing ? (
                  <div className="flex items-center text-primary text-sm">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isOCRProcessing ? "Extracting info..." : "Processing..."}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500" />
                    {isProcessed && (
                      <span className="text-sm text-green-500 ml-1">
                        Processed
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {extractedText && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                <h5 className="font-medium text-gray-700 mb-1">
                  Extracted Information:
                </h5>
                <pre className="whitespace-pre-wrap font-sans text-gray-600">
                  {extractedText}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
