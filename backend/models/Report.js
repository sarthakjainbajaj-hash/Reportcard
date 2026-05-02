const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  studentName: String,
  rollNo: String,
  className: String,
  subjects: [
    {
      name: String,
      marks: Number
    }
  ],
  total: Number,
  percentage: Number,
  grade: String,
  schoolName: String,
  principalName: String,
  directorName: String,
  fatherName: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

module.exports = mongoose.model("Report", reportSchema);