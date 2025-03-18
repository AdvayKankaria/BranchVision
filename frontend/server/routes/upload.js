const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
let tempFiles = []; // Added declaration for temporary file storage
const {
  createUserFolder,
  saveFileToUserFolder,
  saveUserInfoToCSV,
  moveFilesToUserFolder,
} = require("../uploadHandler");

// Define the Files folder and ensure it exists
const filesFolder = path.join(__dirname, "../Files");
if (!fs.existsSync(filesFolder)) {
  fs.mkdirSync(filesFolder);
}

// Use multer with a dynamic destination so each upload gets its own folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = Date.now().toString();
    const dest = path.join(filesFolder, folderName);
    fs.mkdirSync(dest, { recursive: true });
    req.uploadFolder = dest; // optionally store folder path in request
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req, res) => {
  const { file } = req;
  const { docType } = req.body;

  console.log("Received file:", file); // Debugging log
  console.log("Received docType:", docType); // Debugging log

  if (!file) {
    console.error("File is missing.");
    return res.status(400).send("File is missing.");
  }

  try {
    // Save file temporarily
    tempFiles.push({
      tempPath: file.path,
      fileName: `${docType.replace(/\s+/g, "_")}.pdf`,
    });

    console.log("File uploaded temporarily:", tempFiles); // Debugging log
    res.status(200).send("File uploaded temporarily.");
  } catch (error) {
    console.error("Error handling upload:", error);
    res.status(500).send("Error saving file.");
  }
});

router.post("/submit-application", async (req, res) => {
  const { userName, personalInfo } = req.body;

  if (!userName || !personalInfo) {
    return res
      .status(400)
      .send("User name or personal information is missing.");
  }

  try {
    // Create user folder
    const userFolder = createUserFolder(userName);

    // Move files from temporary storage to the user's folder
    moveFilesToUserFolder(tempFiles, userFolder);

    // Save personal and income information to CSV
    await saveUserDetailsToCSV(userFolder, personalInfo);

    // Clear temporary files
    tempFiles.length = 0;

    res.status(200).send("Application submitted successfully.");
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).send("Error saving user information.");
  }
});

module.exports = router;
