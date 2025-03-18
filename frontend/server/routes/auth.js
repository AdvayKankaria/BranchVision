import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const router = express.Router();
const usersFile = path.join(path.resolve(), "frontend/server/data/users.json"); // Adjusted path

// Ensure users file exists
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([]));
}

// Signup route
router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const users = JSON.parse(fs.readFileSync(usersFile));
  if (users.find((user) => user.email === email)) {
    return res.status(400).json({ error: "User already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword, name });
  fs.writeFileSync(usersFile, JSON.stringify(users));

  res.status(201).json({ message: "User registered successfully." });
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const users = JSON.parse(fs.readFileSync(usersFile));
  const user = users.find((user) => user.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const token = jwt.sign({ email: user.email, name: user.name }, "secret", {
    expiresIn: "1h",
  });
  res.json({ token, message: "Login successful." });
});

export default router;
