const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const verifyToken = require("../middleware/auth");

// POST a new report (Protected)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { studentName, fatherName, rollNo, className, subjects, schoolName, principalName, directorName } = req.body;

    let total = 0;
    subjects.forEach(s => total += s.marks);

    const percentage = subjects.length > 0 ? (total / (subjects.length * 100)) * 100 : 0;

    // ✅ FIXED GRADE LOGIC
    let grade;
    if (percentage >= 90) grade = "A";
    else if (percentage >= 75) grade = "B";
    else if (percentage >= 50) grade = "C";
    else grade = "F";

    const newReport = new Report({
      studentName,
      fatherName,
      rollNo,
      className,
      subjects,
      total,
      percentage,
      grade,
      schoolName,
      principalName,
      directorName,
      createdBy: req.user.id
    });

    await newReport.save();

    res.json(newReport); // return the whole newly created object

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all reports for logged-in user (Protected)
router.get("/", verifyToken, async (req, res) => {
  try {
    const reports = await Report.find({ createdBy: req.user.id }).sort({ _id: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single report by ID (Protected)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;