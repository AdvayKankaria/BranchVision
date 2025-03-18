const fs = require("fs");
const path = require("path");
const { createObjectCsvWriter } = require("csv-writer");

// Ensure the Files folder exists
const filesFolder = path.join(__dirname, "../Files");
if (!fs.existsSync(filesFolder)) {
  fs.mkdirSync(filesFolder);
}

// Function to create a user folder
const createUserFolder = (userName) => {
  const userFolder = path.join(filesFolder, userName);
  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder);
  }
  return userFolder;
};

// Function to save uploaded file in the user's folder
const saveFileToUserFolder = (file, userFolder, fileName) => {
  const targetPath = path.join(userFolder, fileName);
  fs.renameSync(file.path, targetPath);
  return targetPath;
};

// Function to save personal and income information to a CSV file in the user's folder
const saveUserInfoToCSV = async (userFolder, personalInfo) => {
  const csvFilePath = path.join(userFolder, "user_info.csv");
  const csvWriter = createObjectCsvWriter({
    path: csvFilePath,
    header: [
      { id: "name", title: "Name" },
      { id: "email", title: "Email" },
      { id: "phone", title: "Phone" },
      { id: "income", title: "Income" },
      { id: "submissionDate", title: "Submission Date" },
    ],
    append: false, // Overwrite if the file exists
  });

  const record = {
    ...personalInfo,
    submissionDate: new Date().toISOString(),
  };

  try {
    await csvWriter.writeRecords([record]);
    console.log("User information saved to CSV successfully.");
  } catch (error) {
    console.error("Error writing user information to CSV:", error);
  }
};

// Function to save user details to a CSV file in the user's folder
const saveUserDetailsToCSV = async (userFolder, userDetails) => {
  const csvFilePath = path.join(userFolder, `${userDetails.name}.csv`);
  const csvWriter = createObjectCsvWriter({
    path: csvFilePath,
    header: [
      { id: "name", title: "Name" },
      { id: "email", title: "Email" },
      { id: "phone", title: "Phone" },
      { id: "income", title: "Income" },
      { id: "submissionDate", title: "Submission Date" },
    ],
    append: false, // Overwrite if the file exists
  });

  const record = {
    ...userDetails,
    submissionDate: new Date().toISOString(),
  };

  try {
    await csvWriter.writeRecords([record]);
    console.log("User details saved to CSV successfully.");
  } catch (error) {
    console.error("Error writing user details to CSV:", error);
  }
};

// CSV Writer setup for uploaded files
const uploadsCsvPath = path.join(filesFolder, "uploads.csv");
const uploadsCsvWriter = createObjectCsvWriter({
  path: uploadsCsvPath,
  header: [
    { id: "fileName", title: "File Name" },
    { id: "docType", title: "Document Type" },
    { id: "details", title: "Details" },
    { id: "uploadDate", title: "Upload Date" },
  ],
  append: true,
});

// CSV Writer setup for personal information
const personalInfoCsvPath = path.join(filesFolder, "personal_info.csv");
const personalInfoCsvWriter = createObjectCsvWriter({
  path: personalInfoCsvPath,
  header: [
    { id: "name", title: "Name" },
    { id: "email", title: "Email" },
    { id: "phone", title: "Phone" },
    { id: "submissionDate", title: "Submission Date" },
  ],
  append: true,
});

// Function to save uploaded file details to CSV
const saveToUploadsCSV = async (fileName, docType, details) => {
  const record = {
    fileName,
    docType,
    details: JSON.stringify(details),
    uploadDate: new Date().toISOString(),
  };

  try {
    await uploadsCsvWriter.writeRecords([record]);
    console.log("File details saved to CSV successfully.");
  } catch (error) {
    console.error("Error writing to uploads CSV:", error);
  }
};

// Function to save personal information to CSV
const saveToPersonalInfoCSV = async (personalInfo) => {
  const record = {
    ...personalInfo,
    submissionDate: new Date().toISOString(),
  };

  try {
    await personalInfoCsvWriter.writeRecords([record]);
    console.log("Personal information saved to CSV successfully.");
  } catch (error) {
    console.error("Error writing to personal info CSV:", error);
  }
};

// Function to move files from temporary storage to the user's folder
const moveFilesToUserFolder = (tempFiles, userFolder) => {
  tempFiles.forEach(({ tempPath, fileName }) => {
    const targetPath = path.join(userFolder, fileName);
    fs.renameSync(tempPath, targetPath);
  });
};

module.exports = {
  saveToUploadsCSV,
  saveToPersonalInfoCSV,
  filesFolder,
  createUserFolder,
  saveFileToUserFolder,
  saveUserInfoToCSV,
  saveUserDetailsToCSV,
  moveFilesToUserFolder, // Export the new function
};
