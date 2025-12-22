const path = require("path");
const express = require("express");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態檔（public/output.css、public/js...）
app.use(express.static(path.join(__dirname, "public")));

// 直接回傳三個 HTML
app.get("/", (req, res) => res.redirect("/login"));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "views", "login.html")));
app.get("/teacher", (req, res) => res.sendFile(path.join(__dirname, "views", "teacher.html")));
app.get("/student", (req, res) => res.sendFile(path.join(__dirname, "views", "student.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("Server running on", PORT));
