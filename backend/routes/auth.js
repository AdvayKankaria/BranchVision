import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

// Signup endpoint
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    await bcrypt.hash(password, 10);
    // Replace this with SQLite logic to save the user
    // Example:
    // db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, hashedPassword], (err) => {
    //   if (err) return res.status(500).json({ error: "Error saving user." });
    //   res.status(201).json({ message: "Signup successful!" });
    // });
    res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // Replace this with SQLite logic to fetch the user
    // Example:
    // db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    //   if (err || !user || !(await bcrypt.compare(password, user.password))) {
    //     return res.status(401).json({ error: "Invalid credentials." });
    //   }
    //   const token = jwt.sign({ id: user.id, email: user.email }, "secret", { expiresIn: "1h" });
    //   res.json({ token, message: "Login successful!" });
    // });
    res.json({ token: "dummy-token", message: "Login successful!" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
