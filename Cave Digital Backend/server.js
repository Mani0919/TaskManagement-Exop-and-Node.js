require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const Users = require("./models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const EmailValidation = require("./middleware/emailvalidation");
const passwordValidator = require("./middleware/passwordvalidation");
const verifyToken = require("./middleware/verifyToken");
const Task = require("./models/tasks");
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: "*" }));
// Middleware to parse URL-encoded data
// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Allows parsing of JSON requests
app.use(cors()); // Enables CORS

// Check if MONGO_URI is loaded
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not defined. Check your .env file.");
  process.exit(1); // Stop the server if MongoDB URI is missing
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
const SECRET_KEY = "cavedigital";
// User Registration Route
app.post(
  "/api/register",
  EmailValidation,
  passwordValidator,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name) return res.status(400).send({ message: "Name is required" });
      if (!email) return res.status(400).send({ message: "Email is required" });
      if (!password)
        return res.status(400).send({ message: "Password is required" });
      if (name.length < 3)
        return res.status(400).send({ message: "Name is too short" });
      // Check if user already exists
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new Users({
        name,
        email,
        password: hashedPassword,
      });

      await newUser.save();
      res
        .status(201)
        .send({ message: "User added successfully", user: newUser });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  }
);
app.post("/api/login", EmailValidation, passwordValidator, async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const user = await Users.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
    expiresIn: "1h",
  });
  res.status(201).json({ message: "Login successful", token });
});
app.post("/api/forgotpassword", EmailValidation, async (req, res) => {
  const { email } = req.body;
  const user = await Users.findOne({
    email,
  });
  if (!user) return res.status(400).json({ message: "User not found" });

  return res.status(200).json({ message: "Email verified successfully" });
});
app.post(
  "/api/resetpassword",
  EmailValidation,
  passwordValidator,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });
      if (!password)
        return res.status(400).json({ message: "Password is required" });
      const user = await Users.findOne({ email });
      if (!user) return res.status(400).json({ message: "User not found" });
      const hashedPassword = await bcrypt.hash(password, 10);
      await Users.updateOne({ email }, { password: hashedPassword });
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
  }
);
app.post("/api/profile", verifyToken, async (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Welcome to your profile!", user: req.user });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

//task api's

app.post("/api/addtask", verifyToken, async (req, res) => {
  try {
    console.log(req.body);
    const { taskname, desc, priority } = req.body;
    if (!taskname)
      return res.status(400).json({ message: "Task name is required" });
    if (!desc)
      return res.status(400).json({ message: "Description is required" });
    if (!priority)
      return res.status(400).json({ message: "Priority is required" });

    const newTask = new Task({
      taskname,
      desc,
      priority,
    });

    await newTask.save();
    res.status(200).json({ message: "Task added successfully", task: newTask });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

app.post("/api/alltasks", verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});
app.post("/api/singletask/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id", id);
    // Check if ID is provided
    if (!id) {
      return res.status(400).json({ message: "Task ID is required" });
    }
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid Task ID format" });
    }
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ task });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});
app.delete("/api/deletetask/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Check if ID is provided
    if (!id) {
      return res.status(400).json({ message: "Task ID is required" });
    }
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid Task ID format" });
    }
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});
app.put("/api/updatetask/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { taskname, desc, priority } = req.body;
    // Check if ID is provided
    if (!id) {
      return res.status(400).json({ message: "Task ID is required" });
    }
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid Task ID format" });
    }
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    await Task.updateOne(
      { _id: id },
      {
        taskname,
        desc,
        priority,
      }
    );
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
