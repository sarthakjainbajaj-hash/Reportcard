const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const reportRoutes = require("./routes/report");

const app = express(); // 👈 pehle app banao

app.use(cors());
app.use(express.json());

// Serve API Routes
app.use("/api/auth", authRoutes);
app.use("/api/report", reportRoutes); // 👈 ab yahan use karo

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, "../frontend")));

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/reportcard")
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

// Fallback to index.html for unknown routes (SPA behavior)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});