const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { createObjectCsvWriter } = require("csv-writer"); // Add CSV writer

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const db = new sqlite3.Database("./loan_guide.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");

    // Create users table
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )`,
      (err) => {
        if (err) console.error("Error creating users table:", err.message);
      }
    );

    // Create uploads table
    db.run(
      `CREATE TABLE IF NOT EXISTS uploads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        doc_type TEXT NOT NULL,
        upload_date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      (err) => {
        if (err) console.error("Error creating uploads table:", err.message);
      }
    );
  }
});

// File upload setup
const upload = multer({ dest: "temp/" });
const filesDir = path.join(__dirname, "Files");
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}

// Signup endpoint
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send("All fields are required.");
  }

  db.run(
    `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
    [name, email, password],
    function (err) {
      if (err) {
        return res.status(400).send("User already exists.");
      }

      const userFolder = path.join(filesDir, name);
      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder);
      }

      // Create a CSV file for user details
      const csvWriter = createObjectCsvWriter({
        path: path.join(userFolder, "user_details.csv"),
        header: [
          { id: "name", title: "Name" },
          { id: "email", title: "Email" },
          { id: "password", title: "Password" },
        ],
      });

      csvWriter
        .writeRecords([{ name, email, password }])
        .then(() => console.log("User details saved to CSV."))
        .catch((err) => console.error("Error writing to CSV:", err));

      res.status(201).send("User registered successfully.");
    }
  );
});

// Login endpoint
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("All fields are required.");
  }

  db.get(
    `SELECT * FROM users WHERE email = ? AND password = ?`,
    [email, password],
    (err, row) => {
      if (err) {
        return res.status(500).send("Internal server error.");
      }
      if (!row) {
        return res.status(401).send("Invalid credentials.");
      }

      res.status(200).send(`Welcome, ${row.name}!`);
    }
  );
});

// File upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  const { email } = req.body;
  if (!email || !req.file) {
    return res.status(400).send("Email and file are required.");
  }

  db.get(`SELECT name FROM users WHERE email = ?`, [email], (err, row) => {
    if (err || !row) {
      return res.status(400).send("Invalid user.");
    }

    const userFolder = path.join(filesDir, row.name);
    const filePath = path.join(userFolder, req.file.originalname);

    fs.rename(req.file.path, filePath, (err) => {
      if (err) {
        return res.status(500).send("Error saving file.");
      }
      res.status(200).send("File uploaded successfully.");
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
