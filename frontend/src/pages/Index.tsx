import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ArrowLeft, XCircle } from "lucide-react";
import VirtualAssistant from "@/components/VirtualAssistant";
import DocumentUpload from "@/components/DocumentUpload";
import { cn } from "@/lib/utils";
import PersonalDetailsForm from "@/components/PersonalDetailsForm";
import IncomeDetailsForm from "@/components/IncomeDetailsForm";
import FeatureShowcase from "@/components/FeatureShowcase";
import { toast, Toaster } from "sonner";
import IntroSection from "@/components/IntroSection";
import axios from "axios";
import { io } from "socket.io-client"; // Import Socket.IO client

// Add a declaration file for '@/components/IntroSection' or use a type assertion
// Example: Declare the module in a .d.ts file

type ApplicationStage =
  | "intro"
  | "documents"
  | "personal"
  | "income"
  | "review";

// Define types for personalDetails and incomeDetails
interface PersonalDetails {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface IncomeDetails {
  employmentType: string;
  employerName: string;
  monthlyIncome: string;
  yearsEmployed: string;
  existingLoans: string;
  loanAmount: string;
  loanPurpose: string;
}

const socket = io("http://localhost:5000"); // Connect to the backend

const Index = () => {
  const [currentStage, setCurrentStage] = useState<ApplicationStage>("intro");
  const [documentData, setDocumentData] = useState<{
    name?: string;
    dob?: string;
    gender?: string;
    address?: string;
    aadhaarNumber?: string;
    panNumber?: string;
    aadhaarUploaded?: boolean;
    panUploaded?: boolean;
  }>({});
  const [isVideoComplete, setIsVideoComplete] = useState(false);
  const [personalComplete, setPersonalComplete] = useState(false);
  const [incomeComplete, setIncomeComplete] = useState(false);
  const userId = localStorage.getItem("userId"); // Assume userId is stored after login

  const [personalDetails, setPersonalDetails] =
    useState<PersonalDetails | null>(null);
  const [incomeDetails, setIncomeDetails] = useState<IncomeDetails | null>(
    null
  );

  const [applicationStatus, setApplicationStatus] = useState("Pending");

  const stageVideos = {
    intro: "/videos/intro.mp4", // Corrected video for Intro page
    documents: "/videos/s2.mp4", // Corrected video for Documents page
    personal: "/videos/s3.mp4", // Corrected video for Personal page
    income: "/videos/s4.mp4", // Corrected video for Income page
    review: "/videos/s5.mp4", // Corrected video for Review page
  };

  const stageQuestions = {
    intro:
      "Welcome to our digital loan application. I'm Sophia, your virtual loan manager. Let me guide you through the application process.",
    documents:
      "Now, let's upload your identification documents. We'll need your Aadhaar and PAN card to proceed.",
    personal:
      "Great! Now I need some personal information to process your application.",
    income:
      "Let's gather details about your income and employment to assess your loan eligibility.",
    review:
      "Thank you for providing all the required information. Let's review your application before submission.",
  };

  useEffect(() => {
    if (
      currentStage === "documents" &&
      documentData.aadhaarUploaded &&
      documentData.panUploaded
    ) {
      setIsVideoComplete(true);
    }
  }, [documentData.aadhaarUploaded, documentData.panUploaded, currentStage]);

  useEffect(() => {
    if (currentStage === "review" && userId) {
      fetch(`http://localhost:5000/api/review-details/${userId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch review details");
          }
          return response.json();
        })
        .then((data) => {
          setPersonalDetails(data.personalDetails); // Update personal details for review
          setIncomeDetails(data.incomeDetails); // Update income details for review
          setApplicationStatus(data.status || "Pending"); // Set application status
        })
        .catch((error) => {
          console.error("Error fetching review details:", error);
          toast.error("Failed to load review details.");
        });
    }
  }, [currentStage, userId]);

  useEffect(() => {
    // Listen for application status updates
    socket.on(
      "applicationStatusUpdate",
      (data: { userId: string; status: string }) => {
        if (data.userId === userId) {
          setApplicationStatus(data.status); // Update the application status in real time
          toast.success(`Application ${data.status.toLowerCase()}!`);
        }
      }
    );

    // Cleanup the socket connection on component unmount
    return () => {
      socket.off("applicationStatusUpdate");
    };
  }, [userId]);

  useEffect(() => {
    if (userId) {
      // Fetch the application status from the backend
      fetch(`http://localhost:5000/api/review-details/${userId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch application status");
          }
          return response.json();
        })
        .then((data) => {
          setApplicationStatus(data.status || "Yet to Submit"); // Update the application status
        })
        .catch((error) => {
          console.error("Error fetching application status:", error);
          toast.error("Failed to fetch application status.");
        });
    }
  }, [userId]);

  const handleDocumentData = (data: any, docType?: "aadhaar" | "pan") => {
    const updatedData = {
      ...documentData,
      ...data,
    };
    if (docType === "aadhaar") {
      updatedData.aadhaarUploaded = true;
    } else if (docType === "pan") {
      updatedData.panUploaded = true;
    }
    setDocumentData(updatedData);
  };

  const handleOCRData = (data: any, docType: "aadhaar" | "pan") => {
    console.log(`OCR data extracted from ${docType}:`, data);
    if (docType === "aadhaar" && data.aadhaarNumber) {
      toast.success("Aadhaar details extracted successfully");
    } else if (docType === "pan" && data.panNumber) {
      toast.success("PAN details extracted successfully");
    } else {
      toast.error(`Failed to extract complete details from ${docType}`);
    }
    handleDocumentData(data, docType);
  };

  const handlePersonalFormSubmit = async (data: any) => {
    try {
      const userId = localStorage.getItem("userId"); // Retrieve userId from localStorage
      if (!userId) {
        toast.error("User ID is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/personal-details",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, ...data }), // Include userId in the payload
        }
      );
      if (response.ok) {
        setPersonalComplete(true);
        setIsVideoComplete(true);
        toast.success("Personal details saved successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save personal details.");
      }
    } catch (error) {
      console.error("Error saving personal details:", error);
      toast.error("An error occurred while saving personal details.");
    }
  };

  const handleIncomeFormSubmit = async (data: any) => {
    try {
      const email = localStorage.getItem("email"); // Retrieve logged-in user's email
      if (!email) {
        toast.error("User email is missing. Please log in again.");
        return;
      }

      const payload = {
        ...data,
      };

      console.log("Submitting income details:", payload);

      const response = await fetch("http://localhost:5000/api/income-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": email, // Send email in the headers
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIncomeComplete(true);
        setIsVideoComplete(true);
        toast.success("Income details saved successfully.");
      } else {
        const error = await response.json();
        console.error("Error saving income details:", error);
        toast.error(error.error || "Failed to save income details.");
      }
    } catch (error) {
      console.error("Error saving income details:", error);
      toast.error("An error occurred while saving income details.");
    }
  };

  const handleFormSubmit = (formType: "personal" | "income", data: any) => {
    if (formType === "personal") {
      setPersonalDetails(data);
    } else if (formType === "income") {
      setIncomeDetails(data);
    }
  };

  const handleNextStage = () => {
    switch (currentStage) {
      case "intro":
        setCurrentStage("documents");
        break;
      case "documents":
        setCurrentStage("personal");
        break;
      case "personal":
        setCurrentStage("income");
        break;
      case "income":
        setCurrentStage("review");
        break;
      case "review":
        // Notify the backend of a new application
        socket.emit("newApplication", userId);
        toast.info("Application submitted. Waiting for approval...");
        break;
    }
    setIsVideoComplete(false);
  };

  const handlePreviousStage = () => {
    switch (currentStage) {
      case "documents":
        setCurrentStage("intro");
        break;
      case "personal":
        setCurrentStage("documents");
        break;
      case "income":
        setCurrentStage("personal");
        break;
      case "review":
        setCurrentStage("income");
        break;
      default:
        break;
    }
  };

  const handleVideoComplete = () => {
    setIsVideoComplete(true);
  };

  const canProceed = () => {
    if (currentStage === "intro") {
      return true; // Allow proceeding from intro without restrictions
    }
    if (currentStage === "documents") {
      return (
        isVideoComplete &&
        documentData.aadhaarUploaded &&
        documentData.panUploaded
      );
    } else if (currentStage === "personal") {
      return personalComplete;
    } else if (currentStage === "income") {
      return incomeComplete;
    }
    return isVideoComplete;
  };

  const updateApplicationStatus = (status: "Approved" | "Rejected") => {
    fetch("http://localhost:5000/api/application-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update application status");
        }
        return response.json();
      })
      .then(() => {
        setApplicationStatus(status);
        toast.success(`Application ${status.toLowerCase()} successfully.`);
      })
      .catch((error) => {
        console.error("Error updating application status:", error);
        toast.error("Failed to update application status.");
      });
  };

  const handleLogout = () => {
    localStorage.clear(); // Clear all stored user data
    window.location.href = "/"; // Redirect to the homepage or login page
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />{" "}
      {/* Ensure toasts are displayed in the top-right corner */}
      <header className="bg-primary py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">BranchVision</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="bg-white text-primary hover:bg-gray-100"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </header>
      <div className="container mx-auto px-4 py-6">
        {/* Removed StatusBox */}
        <div className="flex justify-between mb-8">
          {(
            ["intro", "documents", "personal", "income", "review"] as const
          ).map((stage, index) => (
            <div
              key={stage}
              className={cn(
                "flex flex-col items-center",
                currentStage === stage
                  ? "text-primary"
                  : index <
                    [
                      "intro",
                      "documents",
                      "personal",
                      "income",
                      "review",
                    ].indexOf(currentStage)
                  ? "text-green-600"
                  : "text-gray-400"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mb-2",
                  currentStage === stage
                    ? "bg-primary text-white"
                    : index <
                      [
                        "intro",
                        "documents",
                        "personal",
                        "income",
                        "review",
                      ].indexOf(currentStage)
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-400"
                )}
              >
                {index <
                ["intro", "documents", "personal", "income", "review"].indexOf(
                  currentStage
                ) ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  currentStage === stage ? "font-semibold" : ""
                )}
              >
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          <div className="w-full md:w-1/2">
            <div className="rounded-xl overflow-hidden shadow-md bg-gray-50 h-full">
              {currentStage === "intro" && (
                <div className="space-y-4">
                  <IntroSection />
                  <p className="text-sm text-gray-600">
                    Click the play button to watch the video or proceed whenever
                    you're ready.
                  </p>
                </div>
              )}
              {currentStage !== "intro" && (
                <VirtualAssistant
                  videoSrc={stageVideos[currentStage]}
                  question={stageQuestions[currentStage]}
                  onComplete={handleVideoComplete}
                />
              )}
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="rounded-xl p-6 shadow-md bg-white h-full">
              {currentStage === "intro" && <FeatureShowcase />}
              {currentStage === "documents" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Upload Your Documents
                  </h2>
                  <div className="grid gap-6">
                    <DocumentUpload
                      docType="aadhaar"
                      onDocumentUploaded={(file) => {
                        console.log("Aadhaar uploaded:", file);
                        if (!documentData.aadhaarUploaded) {
                          setTimeout(() => {
                            handleDocumentData(
                              {
                                name: "John Doe",
                                dob: "1990-01-01",
                                gender: "Male",
                                address: "123 Main St, City, State, 123456",
                                aadhaarNumber: "1234 5678 9012",
                              },
                              "aadhaar"
                            );
                          }, 2000);
                        }
                      }}
                      onOCRComplete={(data) => handleOCRData(data, "aadhaar")}
                    />
                    <DocumentUpload
                      docType="pan"
                      onDocumentUploaded={(file) => {
                        console.log("PAN uploaded:", file);
                        if (!documentData.panUploaded) {
                          setTimeout(() => {
                            handleDocumentData(
                              {
                                panNumber: "ABCDE1234F",
                              },
                              "pan"
                            );
                          }, 2000);
                        }
                      }}
                      onOCRComplete={(data) => handleOCRData(data, "pan")}
                    />
                  </div>
                </div>
              )}
              {currentStage === "personal" && (
                <PersonalDetailsForm
                  initialData={documentData}
                  onSubmit={(data) => {
                    handlePersonalFormSubmit(data);
                    handleFormSubmit("personal", data);
                  }}
                />
              )}
              {currentStage === "income" && (
                <IncomeDetailsForm
                  onSubmit={(data) => {
                    handleIncomeFormSubmit(data);
                    handleFormSubmit("income", data);
                  }}
                />
              )}
              {currentStage === "review" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Review Your Application
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg shadow">
                      <h3 className="font-medium text-gray-700 mb-2">
                        Personal Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold">Name:</span>{" "}
                          {personalDetails?.name || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Email:</span>{" "}
                          {personalDetails?.email || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Phone:</span>{" "}
                          {personalDetails?.phone || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Date of Birth:</span>{" "}
                          {personalDetails?.dob || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Gender:</span>{" "}
                          {personalDetails?.gender || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Address:</span>{" "}
                          {personalDetails?.address || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">City:</span>{" "}
                          {personalDetails?.city || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">State:</span>{" "}
                          {personalDetails?.state || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">PIN Code:</span>{" "}
                          {personalDetails?.pincode || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg shadow">
                      <h3 className="font-medium text-gray-700 mb-2">
                        Income Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold">
                            Employment Type:
                          </span>{" "}
                          {incomeDetails?.employmentType || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Employer Name:</span>{" "}
                          {incomeDetails?.employerName || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Monthly Income:</span>{" "}
                          ₹{incomeDetails?.monthlyIncome || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Years Employed:</span>{" "}
                          {incomeDetails?.yearsEmployed || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Existing Loans:</span>{" "}
                          {incomeDetails?.existingLoans || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Loan Amount:</span> ₹
                          {incomeDetails?.loanAmount || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Loan Purpose:</span>{" "}
                          {incomeDetails?.loanPurpose || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-8 flex justify-between">
                {currentStage !== "intro" && (
                  <Button onClick={handlePreviousStage} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNextStage}
                  className={cn("gap-2", !canProceed() && "opacity-50")}
                  disabled={!canProceed()}
                >
                  {currentStage === "review"
                    ? "Submit Application"
                    : "Continue"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
