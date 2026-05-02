// If opening the file directly (file://), use localhost. Otherwise, use relative path for deployment.
const API = window.location.protocol === 'file:' ? 'http://localhost:5000' : '';

// --- Auth Functions ---
function checkAuth() {
  if (!localStorage.getItem("token")) {
    window.location = "login.html";
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location = "login.html";
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) return alert("Please fill all fields");

  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const err = await res.text();
      return alert("Login Failed: " + err);
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);
    window.location = "index.html";
  } catch (err) {
    alert("Server error");
  }
}

async function signup() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!name || !email || !password) return alert("Please fill all fields");

  try {
    const res = await fetch(`${API}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    if (!res.ok) {
      const err = await res.text();
      return alert("Signup Failed: " + err);
    }

    alert("Signup Success! Please login.");
    window.location = "login.html";
  } catch (err) {
    alert("Server error");
  }
}

// --- Dynamic Subjects Logic ---
let subjectCount = 0;

function addSubjectRow() {
  const container = document.getElementById("subjects-container");
  const id = `sub-${Date.now()}`;
  
  const div = document.createElement("div");
  div.className = "subject-row";
  div.id = id;
  
  div.innerHTML = `
    <input type="text" class="sub-name" placeholder="Subject Name" required>
    <input type="number" class="sub-marks" placeholder="Marks" min="0" max="100" required>
    <button class="danger" onclick="removeSubjectRow('${id}')">X</button>
  `;
  
  container.appendChild(div);
  subjectCount++;
}

function removeSubjectRow(id) {
  document.getElementById(id).remove();
  subjectCount--;
}

// Initialize with 3 empty subjects if on index
if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
  document.addEventListener("DOMContentLoaded", () => {
    addSubjectRow();
    addSubjectRow();
    addSubjectRow();
  });
}

// --- Report Generation & Rendering ---
async function generate() {
  const token = localStorage.getItem("token");
  if (!token) return logout();

  const studentName = document.getElementById("name").value;
  const fatherName = document.getElementById("father").value;
  const rollNo = document.getElementById("roll").value;
  const className = document.getElementById("class").value;
  
  const schoolName = document.getElementById("school").value || "School Name";
  const principalName = document.getElementById("principal").value || "Principal";
  const directorName = document.getElementById("director").value || "Director";

  // Gather subjects
  const subjects = [];
  const rows = document.querySelectorAll(".subject-row");
  rows.forEach(row => {
    const name = row.querySelector(".sub-name").value;
    const marks = Number(row.querySelector(".sub-marks").value);
    if (name && marks >= 0) {
      subjects.push({ name, marks });
    }
  });

  if (!studentName || !fatherName || !rollNo || !className || subjects.length === 0) {
    return alert("Please fill student details and add at least one subject.");
  }

  try {
    const res = await fetch(`${API}/api/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ studentName, fatherName, rollNo, className, subjects, schoolName, principalName, directorName })
    });

    if (!res.ok) throw new Error("Failed to generate report");

    const data = await res.json();
    window.location.href = `report.html?id=${data._id}`;
  } catch (err) {
    alert(err.message);
  }
}

async function fetchHistory() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API}/api/report`, {
      headers: { "Authorization": token }
    });

    if (!res.ok) return;

    const reports = await res.json();
    const container = document.getElementById("history-container");
    
    if (reports.length === 0) {
      container.innerHTML = "<p>No previous reports found.</p>";
      return;
    }

    container.innerHTML = reports.map(r => `
      <div class="glass-card history-card" style="padding: 1rem;" onclick="window.location.href='report.html?id=${r._id}'">
        <div style="font-weight: 600; margin-bottom: 0.5rem;">${r.studentName}</div>
        <div style="font-size: 0.85rem; color: #cbd5e1;">Class ${r.className} | Roll ${r.rollNo}</div>
        <div style="margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
          <span>${r.percentage.toFixed(1)}%</span>
          <span class="grade-badge grade-${r.grade}" style="padding: 0.1rem 0.5rem; font-size: 0.8rem;">${r.grade}</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}