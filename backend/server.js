import express from "express";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import multer from "multer";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { fileURLToPath } from "url";
import readline from "readline"; // Import readline module
import { Server } from "socket.io"; // Import Socket.IO

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Database setup
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        userId TEXT UNIQUE NOT NULL
      )`,
      (err) => {
        if (err) console.error("Error creating users table:", err.message);
      }
    );
  }
});

// Ensure the userId column exists in the users table
db.all(`PRAGMA table_info(users)`, [], (_, columns) => {
  // Removed unused 'err'
  const columnNames = columns.map((col) => col.name);
  if (!columnNames.includes("userId")) {
    console.log(
      "Recreating users table to add userId column with UNIQUE constraint..."
    );

    db.serialize(() => {
      // Create a temporary table with the updated schema
      db.run(
        `CREATE TABLE IF NOT EXISTS users_temp (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          userId TEXT UNIQUE NOT NULL
        )`,
        (createErr) => {
          if (createErr) {
            console.error(
              "Error creating temporary users table:",
              createErr.message
            );
            return;
          }

          // Copy data from the old table to the temporary table
          db.all(
            `SELECT id, name, email, password FROM users`,
            [],
            (selectErr, rows) => {
              if (selectErr) {
                console.error(
                  "Error selecting data from old users table:",
                  selectErr.message
                );
                return;
              }

              const insertStmt = db.prepare(
                `INSERT INTO users_temp (id, name, email, password, userId) VALUES (?, ?, ?, ?, ?)`
              );

              rows.forEach((row) => {
                const userId = uuidv4(); // Generate a unique userId
                insertStmt.run(
                  row.id,
                  row.name,
                  row.email,
                  row.password,
                  userId,
                  (insertErr) => {
                    if (insertErr) {
                      console.error(
                        "Error inserting data into temporary users table:",
                        insertErr.message
                      );
                    }
                  }
                );
              });

              insertStmt.finalize((finalizeErr) => {
                if (finalizeErr) {
                  console.error(
                    "Error finalizing insert statement:",
                    finalizeErr.message
                  );
                  return;
                }

                // Drop the old users table
                db.run(`DROP TABLE users`, (dropErr) => {
                  if (dropErr) {
                    console.error(
                      "Error dropping old users table:",
                      dropErr.message
                    );
                    return;
                  }

                  // Rename the temporary table to users
                  db.run(
                    `ALTER TABLE users_temp RENAME TO users`,
                    (renameErr) => {
                      if (renameErr) {
                        console.error(
                          "Error renaming temporary users table:",
                          renameErr.message
                        );
                      } else {
                        console.log(
                          "Recreated users table with userId column."
                        );
                      }
                    }
                  );
                });
              });
            }
          );
        }
      );
    });
  }
});

// Assign unique userId to existing users
db.all(`SELECT id FROM users WHERE userId IS NULL`, [], (err, rows) => {
  if (err) {
    console.error("Error fetching users:", err.message);
    return;
  }

  rows.forEach((row) => {
    const userId = uuidv4();
    db.run(
      `UPDATE users SET userId = ? WHERE id = ?`,
      [userId, row.id],
      (updateErr) => {
        if (updateErr) {
          console.error(
            `Error updating userId for user with id ${row.id}:`,
            updateErr.message
          );
        }
      }
    );
  });
});

// Ensure the personal_details table exists with the correct schema
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS personal_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (userId)
    )`,
    (err) => {
      if (err) {
        console.error("Error creating personal_details table:", err.message);
      }
    }
  );

  // Check if all required columns exist
  db.all(`PRAGMA table_info(personal_details)`, [], (_, columns) => {
    const columnNames = columns.map((col) => col.name);
    const requiredColumns = [
      "id",
      "userId",
      "name",
      "email",
      "phone",
      "dob",
      "gender",
      "address",
      "city",
      "state",
      "pincode",
    ];

    const missingColumns = requiredColumns.filter(
      (col) => !columnNames.includes(col)
    );

    if (missingColumns.length > 0) {
      console.log(
        `Recreating personal_details table to add missing columns: ${missingColumns.join(
          ", "
        )}`
      );

      db.serialize(() => {
        // Create a temporary table with the updated schema
        db.run(
          `CREATE TABLE IF NOT EXISTS personal_details_temp (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            dob TEXT NOT NULL,
            gender TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            pincode TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users (userId)
          )`,
          (createErr) => {
            if (createErr) {
              console.error(
                "Error creating temporary personal_details table:",
                createErr.message
              );
              return;
            }

            // Dynamically select only the existing columns from the old table
            const existingColumns = columnNames.filter((col) =>
              requiredColumns.includes(col)
            );
            const selectColumns = existingColumns
              .map((col) => col)
              .concat(
                requiredColumns
                  .filter((col) => !existingColumns.includes(col))
                  .map((col) => `NULL AS ${col}`)
              )
              .join(", ");

            // Copy data from the old table to the temporary table
            db.all(
              `SELECT ${selectColumns} FROM personal_details`,
              [],
              (selectErr, rows) => {
                if (selectErr) {
                  console.error(
                    "Error selecting data from old personal_details table:",
                    selectErr.message
                  );
                  return;
                }

                const insertStmt = db.prepare(
                  `INSERT INTO personal_details_temp (id, userId, name, email, phone, dob, gender, address, city, state, pincode) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                );

                rows.forEach((row) => {
                  insertStmt.run(
                    row.id,
                    row.userId || uuidv4(), // Generate a new userId if it doesn't exist
                    row.name,
                    row.email || "",
                    row.phone || "",
                    row.dob || "",
                    row.gender || "",
                    row.address || "",
                    row.city || "",
                    row.state || "",
                    row.pincode || "",
                    (insertErr) => {
                      if (insertErr) {
                        console.error(
                          "Error inserting data into temporary personal_details table:",
                          insertErr.message
                        );
                      }
                    }
                  );
                });

                insertStmt.finalize((finalizeErr) => {
                  if (finalizeErr) {
                    console.error(
                      "Error finalizing insert statement:",
                      finalizeErr.message
                    );
                    return;
                  }

                  // Drop the old personal_details table
                  db.run(`DROP TABLE personal_details`, (dropErr) => {
                    if (dropErr) {
                      console.error(
                        "Error dropping old personal_details table:",
                        dropErr.message
                      );
                      return;
                    }

                    // Rename the temporary table to personal_details
                    db.run(
                      `ALTER TABLE personal_details_temp RENAME TO personal_details`,
                      (renameErr) => {
                        if (renameErr) {
                          console.error(
                            "Error renaming temporary personal_details table:",
                            renameErr.message
                          );
                        } else {
                          console.log(
                            "Recreated personal_details table with missing columns."
                          );
                        }
                      }
                    );
                  });
                });
              }
            );
          }
        );
      });
    }
  });
});

// Ensure the income_details table exists with the correct schema
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS income_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      employmentType TEXT NOT NULL,
      employerName TEXT NOT NULL,
      monthlyIncome TEXT NOT NULL,
      yearsEmployed TEXT NOT NULL,
      existingLoans TEXT,
      loanAmount TEXT NOT NULL,
      loanPurpose TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (userId)
    )`,
    (err) => {
      if (err) {
        console.error("Error creating income_details table:", err.message);
      }
    }
  );

  // Check if all required columns exist
  db.all(`PRAGMA table_info(income_details)`, [], (_, columns) => {
    const columnNames = columns.map((col) => col.name);
    // Removed unused 'err'
    const requiredColumns = [
      "id",
      "userId",
      "employmentType",
      "employerName",
      "monthlyIncome",
      "yearsEmployed",
      "existingLoans",
      "loanAmount",
      "loanPurpose",
    ];

    const missingColumns = requiredColumns.filter(
      (col) => !columnNames.includes(col)
    );

    if (missingColumns.length > 0) {
      console.log(
        `Recreating income_details table to add missing columns: ${missingColumns.join(
          ", "
        )}`
      );

      db.serialize(() => {
        // Create a temporary table with the updated schema
        db.run(
          `CREATE TABLE IF NOT EXISTS income_details_temp (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            employmentType TEXT NOT NULL,
            employerName TEXT NOT NULL,
            monthlyIncome TEXT NOT NULL,
            yearsEmployed TEXT NOT NULL,
            existingLoans TEXT,
            loanAmount TEXT NOT NULL,
            loanPurpose TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users (userId)
          )`,
          (createErr) => {
            if (createErr) {
              console.error(
                "Error creating temporary income_details table:",
                createErr.message
              );
              return;
            }

            // Dynamically select only the existing columns from the old table
            const existingColumns = columnNames.filter((col) =>
              requiredColumns.includes(col)
            );
            const selectColumns = existingColumns
              .map((col) => col)
              .concat(
                requiredColumns
                  .filter((col) => !existingColumns.includes(col))
                  .map((col) => `NULL AS ${col}`)
              )
              .join(", ");

            // Copy data from the old table to the temporary table
            db.all(
              `SELECT ${selectColumns} FROM income_details`,
              [],
              (selectErr, rows) => {
                if (selectErr) {
                  console.error(
                    "Error selecting data from old income_details table:",
                    selectErr.message
                  );
                  return;
                }

                const insertStmt = db.prepare(
                  `INSERT INTO income_details_temp (id, userId, employmentType, employerName, monthlyIncome, yearsEmployed, existingLoans, loanAmount, loanPurpose) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
                );

                rows.forEach((row) => {
                  insertStmt.run(
                    row.id,
                    row.userId || null,
                    row.employmentType,
                    row.employerName,
                    row.monthlyIncome,
                    row.yearsEmployed,
                    row.existingLoans || "",
                    row.loanAmount,
                    row.loanPurpose,
                    (insertErr) => {
                      if (insertErr) {
                        console.error(
                          "Error inserting data into temporary income_details table:",
                          insertErr.message
                        );
                      }
                    }
                  );
                });

                insertStmt.finalize((finalizeErr) => {
                  if (finalizeErr) {
                    console.error(
                      "Error finalizing insert statement:",
                      finalizeErr.message
                    );
                    return;
                  }

                  // Drop the old income_details table
                  db.run(`DROP TABLE income_details`, (dropErr) => {
                    if (dropErr) {
                      console.error(
                        "Error dropping old income_details table:",
                        dropErr.message
                      );
                      return;
                    }

                    // Rename the temporary table to income_details
                    db.run(
                      `ALTER TABLE income_details_temp RENAME TO income_details`,
                      (renameErr) => {
                        if (renameErr) {
                          console.error(
                            "Error renaming temporary income_details table:",
                            renameErr.message
                          );
                        } else {
                          console.log(
                            "Recreated income_details table with missing columns."
                          );
                        }
                      }
                    );
                  });
                });
              }
            );
          }
        );
      });
    }
  });
});

// Ensure the income_details table includes the status column
db.serialize(() => {
  db.run(
    `ALTER TABLE income_details ADD COLUMN status TEXT DEFAULT 'Pending'`,
    (err) => {
      if (err && !err.message.includes("duplicate column name")) {
        console.error(
          "Error adding status column to income_details:",
          err.message
        );
      }
    }
  );
});

// Clear all pending applications when the server starts
db.serialize(() => {
  db.run(
    `UPDATE income_details SET status = 'Cleared' WHERE status = 'Pending'`,
    (err) => {
      if (err) {
        console.error(
          "Error clearing previous pending applications:",
          err.message
        );
      } else {
        console.log("Cleared all previous pending applications.");
      }
    }
  );
});

// File upload setup
const uploadFolder = path.join(__dirname, "Files");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    // Removed unused 'req' and 'file'
    cb(null, uploadFolder);
  },
  filename: (_, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Signup endpoint
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4(); // Generate a unique userId
    db.run(
      `INSERT INTO users (userId, name, email, password) VALUES (?, ?, ?, ?)`,
      [userId, name, email, hashedPassword],
      (err) => {
        if (err) {
          if (err.message.includes("UNIQUE constraint failed")) {
            return res.status(400).json({ error: "User already exists." });
          }
          return res.status(500).json({ error: "Error saving user." });
        }
        res.status(201).json({ message: "Signup successful!", userId });
      }
    );
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Login endpoint
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, "secret", {
      expiresIn: "1h",
    });
    console.log("Returning userId:", user.userId); // Debugging log
    res.json({ token, userId: user.userId, message: "Login successful!" });
  });
});

// Personal details endpoint
app.post("/api/personal-details", (req, res) => {
  const { email, name, phone, dob, gender, address, city, state, pincode } =
    req.body;

  console.log("Received personal details:", req.body); // Debugging log

  if (
    !email ||
    !name ||
    !phone ||
    !dob ||
    !gender ||
    !address ||
    !city ||
    !state ||
    !pincode
  ) {
    console.error("Validation failed: Missing required fields.");
    return res.status(400).json({ error: "All fields are required." });
  }

  db.get(`SELECT userId FROM users WHERE email = ?`, [email], (err, row) => {
    if (err) {
      console.error("Error fetching userId from users table:", err.message);
      return res.status(500).json({ error: "Failed to fetch userId." });
    }
    if (!row) {
      console.error("Email does not match any account:", email);
      return res
        .status(404)
        .json({ error: "Email does not match any account." });
    }

    const userId = row.userId;

    db.run(
      `INSERT INTO personal_details (userId, name, email, phone, dob, gender, address, city, state, pincode) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, email, phone, dob, gender, address, city, state, pincode],
      (err) => {
        if (err) {
          console.error(
            "Database error while saving personal details:",
            err.message
          );
          return res
            .status(500)
            .json({ error: "Failed to save personal details." });
        }
        console.log("Personal details saved successfully for userId:", userId);
        res
          .status(201)
          .json({ message: "Personal details saved successfully." });
      }
    );
  });
});

// Income details endpoint
app.post("/api/income-details", (req, res) => {
  const {
    employmentType,
    employerName,
    monthlyIncome,
    yearsEmployed,
    existingLoans,
    loanAmount,
    loanPurpose,
  } = req.body;

  const email = req.headers["x-user-email"]; // Assume email is sent in a custom header
  console.log("Received income details:", req.body); // Debugging log
  console.log("Received email from headers:", email); // Debugging log

  if (!email) {
    console.error("Unauthorized access: Missing email in headers.");
    return res.status(401).json({ error: "Unauthorized access." });
  }

  if (
    !employmentType ||
    !employerName ||
    !monthlyIncome ||
    !yearsEmployed ||
    !loanAmount ||
    !loanPurpose
  ) {
    console.error("Validation failed: Missing required fields.");
    return res.status(400).json({ error: "All fields are required." });
  }

  // Fetch userId from personal_details table using email
  db.get(
    `SELECT userId FROM personal_details WHERE email = ?`,
    [email],
    (err, row) => {
      if (err) {
        console.error(
          "Error fetching userId from personal_details table:",
          err.message
        );
        return res.status(500).json({ error: "Failed to fetch userId." });
      }
      if (!row) {
        console.error("Email does not match any personal details:", email);
        return res.status(404).json({ error: "User not found." });
      }

      const userId = row.userId;

      db.run(
        `INSERT INTO income_details (userId, employmentType, employerName, monthlyIncome, yearsEmployed, existingLoans, loanAmount, loanPurpose) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          employmentType,
          employerName,
          monthlyIncome,
          yearsEmployed,
          existingLoans || "", // Default to empty string if null
          loanAmount,
          loanPurpose,
        ],
        (err) => {
          if (err) {
            console.error(
              "Database error while saving income details:",
              err.message
            );
            return res
              .status(500)
              .json({ error: "Failed to save income details." });
          }
          console.log("Income details saved successfully for userId:", userId);
          res
            .status(201)
            .json({ message: "Income details saved successfully." });
        }
      );
    }
  );
});

// Update application status endpoint
app.post("/api/application-status", (req, res) => {
  const { userId, status } = req.body;

  if (!userId || !["Approved", "Rejected", "Pending"].includes(status)) {
    return res.status(400).json({ error: "Invalid userId or status." });
  }

  db.run(
    `UPDATE income_details SET status = ? WHERE userId = ?`,
    [status, userId],
    (err) => {
      if (err) {
        console.error("Error updating application status:", err.message);
        return res
          .status(500)
          .json({ error: "Failed to update application status." });
      }
      res
        .status(200)
        .json({ message: `Application status updated to ${status}.` });
    }
  );
});

// Review details endpoint
app.get("/api/review-details/:userId", (req, res) => {
  const { userId } = req.params;

  db.serialize(() => {
    db.get(
      `SELECT * FROM personal_details WHERE userId = ?`,
      [userId],
      (err, personalDetails) => {
        if (err) {
          console.error("Error fetching personal details:", err.message);
          return res
            .status(500)
            .json({ error: "Failed to fetch personal details." });
        }

        if (!personalDetails) {
          return res.json({ status: "Yet to Submit" }); // Return "Yet to Submit" if no personal details exist
        }

        db.get(
          `SELECT * FROM income_details WHERE userId = ?`,
          [userId],
          (err, incomeDetails) => {
            if (err) {
              console.error("Error fetching income details:", err.message);
              return res
                .status(500)
                .json({ error: "Failed to fetch income details." });
            }

            if (!incomeDetails) {
              return res.json({ status: "Yet to Submit" }); // Return "Yet to Submit" if no income details exist
            }

            res.json({
              personalDetails,
              incomeDetails,
              status: incomeDetails.status, // Return the actual status
            });
          }
        );
      }
    );
  });
});

// File upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  const { docType } = req.body;

  if (!req.file || !docType) {
    console.error("Missing required fields:", {
      file: !!req.file,
      docType,
    });
    return res.status(400).json({ error: "File and docType are required." });
  }

  const filePath = path.join(uploadFolder, req.file.filename);
  console.log(`File uploaded: ${filePath}`); // Debugging log

  res.status(201).json({ message: "File uploaded successfully.", filePath });
});

// OCR analysis endpoint
app.post("/api/ocr", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded for OCR" });
  }

  const filePath = req.file.path;

  try {
    const metadata = await sharp(filePath).metadata();
    console.log("Image Metadata:", metadata);

    if (!metadata.width || !metadata.height) {
      return res.status(400).json({
        error: "Unable to process the image. Please upload a valid image file.",
      });
    }

    if (metadata.width < 3 || metadata.height < 3) {
      return res.status(400).json({
        error: `Image dimensions are too small (${metadata.width}x${metadata.height}). Minimum size is 3x3 pixels.`,
      });
    }

    Tesseract.recognize(filePath, "eng")
      .then(({ data: { text } }) => {
        res.json({ text });
      })
      .catch((err) => {
        res.status(500).json({ error: "OCR analysis failed" }); // Re-added 'err'
      });
  } catch (err) {
    res.status(500).json({ error: "Error processing image for OCR." });
  }
});

// Function to handle the most recent application in real time
const handleApplicationStatus = () => {
  db.get(
    `SELECT userId, name, email FROM personal_details WHERE userId IN (SELECT userId FROM income_details WHERE status = 'Pending') ORDER BY id DESC LIMIT 1`,
    [],
    (err, row) => {
      if (err) {
        console.error(
          "Error fetching the most recent pending application:",
          err.message
        );
        return;
      }

      if (!row) {
        console.log("No pending applications.");
        return;
      }

      console.log("\nCurrent Pending Application:");
      console.log(
        `User ID: ${row.userId}, Name: ${row.name}, Email: ${row.email}`
      );

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        "Type 'approve' to approve or 'reject' to reject the application (or type 'exit' to quit): ",
        (action) => {
          if (action.toLowerCase() === "exit") {
            rl.close();
            return;
          }

          if (
            action.toLowerCase() === "approve" ||
            action.toLowerCase() === "reject"
          ) {
            const status =
              action.toLowerCase() === "approve" ? "Approved" : "Rejected";
            db.run(
              `UPDATE income_details SET status = ? WHERE userId = ?`,
              [status, row.userId],
              (updateErr) => {
                if (updateErr) {
                  console.error(
                    "Error updating application status:",
                    updateErr.message
                  );
                } else {
                  console.log(
                    `Application for User ID ${row.userId} has been ${status}.`
                  );
                  // Emit the status update to the frontend
                  io.emit("applicationStatusUpdate", {
                    userId: row.userId,
                    status,
                  });
                }
                rl.close();
                handleApplicationStatus(); // Check for the next application
              }
            );
          } else {
            console.log("Invalid action. Please try again.");
            rl.close();
            handleApplicationStatus();
          }
        }
      );
    }
  );
};

// Start the terminal interface after the server starts
const PORT = 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  handleApplicationStatus(); // Start handling applications
});

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:8080"], // Allow both origins
    methods: ["GET", "POST"],
  },
});

// Update CORS middleware to allow multiple origins
const allowedOrigins = ["http://localhost:3000", "http://localhost:8080"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Listen for new applications and handle them in real time
io.on("connection", (socket) => {
  console.log("Socket.IO client connected.");

  socket.on("newApplication", (userId) => {
    console.log(`New application received for User ID: ${userId}`);
    db.get(
      `SELECT status FROM income_details WHERE userId = ?`,
      [userId],
      (err, row) => {
        if (err) {
          console.error("Error fetching application status:", err.message);
          return;
        }

        if (row && row.status === "Pending") {
          console.log(
            "Application is already pending. Proceeding to approval/rejection..."
          );
          handleApplicationStatus(); // Call the function to handle approval/rejection
          return;
        }

        db.run(
          `UPDATE income_details SET status = 'Pending' WHERE userId = ?`,
          [userId],
          (updateErr) => {
            if (updateErr) {
              console.error(
                "Error updating application status:",
                updateErr.message
              );
              return;
            }
            console.log("Application status set to 'Pending'.");
            handleApplicationStatus(); // Call the function to handle approval/rejection
          }
        );
      }
    );
  });
});
