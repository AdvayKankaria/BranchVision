const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { createObjectCsvWriter } = require("csv-writer");

// Define the Files folder and ensure it exists
const filesFolder = path.join(__dirname, "../Files");
if (!fs.existsSync(filesFolder)) {
  fs.mkdirSync(filesFolder);
}

router.post("/", async (req, res) => {
  try {
    const { userName, personalInfo } = req.body;
    if (!userName || !personalInfo) {
      return res
        .status(400)
        .json({ error: "Missing userName or personalInfo" });
    }

    // Create a new folder for this application submission
    const folderName = Date.now().toString();
    const appFolder = path.join(filesFolder, folderName);
    fs.mkdirSync(appFolder, { recursive: true });

    // Create a CSV file in the folder with the user's personal/financial information
    const csvFilePath = path.join(appFolder, `${userName}.csv`);
    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: "name", title: "Name" },
        { id: "email", title: "Email" },
        { id: "phone", title: "Phone" },
        { id: "income", title: "Income" },
        { id: "submissionDate", title: "Submission Date" },
      ],
      append: false, // overwrite if the file exists
    });
    const record = {
      ...personalInfo,
      submissionDate: new Date().toISOString(),
    };
    await csvWriter.writeRecords([record]);

    res
      .status(200)
      .json({ message: "Application submitted and CSV saved successfully." });
  } catch (error) {
    console.error("Submit application error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
