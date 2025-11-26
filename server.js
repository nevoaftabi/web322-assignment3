/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Nevo Aftabi Student ID: 172865214 Date: 11/25/2025
*
********************************************************************************/

require("dotenv").config();
const connectMongo = require("./db/mongo");
const User = require("./models/User");
const { connectPostgreSQL, Task } = require("./models");
const path = require('path');

const clientSessions = require("client-sessions");
const bcrypt = require("bcryptjs");
const express = require("express");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(
  clientSessions({
    cookieName: "session",
    secret: process.env.SESSION_SECRET,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
  })
);

(async () => {
  try {
    await connectMongo();     
    await connectPostgreSQL();             
  } 
  catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
})();

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hash,
    });

    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    return res.redirect("/dashboard");
  } 
  catch (err) {
    console.error("Register error:", err);
    return res.redirect("/register");
  }
});

app.get("/login", (req, res) => {
  const invalidCredentials = req.query.error === "1";

  res.render("login", { invalidCredentials });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const dbUser = await User.findOne({ username });

    if (!dbUser) {
      return res.redirect("/login?error=1");
    }

    const match = await bcrypt.compare(password, dbUser.password);

    if (!match) {
      return res.redirect("/login?error=1");
    }

    req.session.user = {
      id: dbUser._id.toString(),
      username: dbUser.username,
      email: dbUser.email,
    };

    return res.redirect("/dashboard");
  } 
  catch (err) {
    console.error("Login error:", err);
    return res.redirect("/login?error=1");
  }
});

app.get("/logout", (req, res) => {
  req.session.reset();
  return res.redirect("/login");
});

app.get("/dashboard", ensureLogin, (req, res) => {
  res.render("dashboard", { user: req.session.user });
});

app.get("/tasks", ensureLogin, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const tasks = await Task.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    res.render("tasks", {
      user: req.session.user,
      tasks,
    });
  } 
  catch (err) {
    console.error("Error retrieving tasks:", err);
    res.render("tasks", {
      user: req.session.user,
      tasks: [],
    });
  }
});

app.get("/tasks/add", ensureLogin, (req, res) => {
  res.render("addTask", { user: req.session.user });
});

app.post("/tasks/add", ensureLogin, async (req, res) => {
  const { title, description, dueDate } = req.body;

  try {
    await Task.create({
      title,
      description,
      dueDate: dueDate || null,
      status: "Pending",
      userId: req.session.user.id,
    });

    return res.redirect("/tasks");
  } 
  catch (err) {
    console.error("Error creating task:", err);
    return res.redirect("/tasks/add");
  }
});

app.get("/tasks/edit/:id", ensureLogin, async (req, res) => {
  const userId = req.session.user.id;
  const taskId = req.params.id;

  const task = await Task.findByPk(taskId);

  if (!task || task.userId !== userId) {
    return res.redirect("/tasks");
  }

  res.render("editTask", { user: req.session.user, task });
});

app.post("/tasks/edit/:id", ensureLogin, async (req, res) => {
  const taskId = req.params.id;
  const userId = req.session.user.id;
  const { title, description, dueDate, status } = req.body;

  try {
    const task = await Task.findByPk(taskId);

    if (!task || task.userId !== userId) {
      return res.redirect("/tasks");
    }

    await task.update({
      title,
      description,
      dueDate: dueDate || null,
      status,
    });

    return res.redirect("/tasks");
  } 
  catch (err) {
    console.error("Task update error:", err);
    return res.redirect(`/tasks/edit/${taskId}`);
  }
});

app.post("/tasks/delete/:id", ensureLogin, async (req, res) => {
  const taskId = req.params.id;
  const userId = req.session.user.id;

  try {
    const task = await Task.findByPk(taskId);

    if (!task || task.userId !== userId) {
      return res.redirect("/tasks");
    }

    await task.destroy();
    return res.redirect("/tasks");
  } 
  catch (err) {
    console.error("Task delete error:", err);
    return res.redirect("/tasks");
  }
});

app.post("/tasks/status/:id", ensureLogin, async (req, res) => {
  const taskId = req.params.id;
  const userId = req.session.user.id;
  const { status } = req.body; 

  try {
    const task = await Task.findByPk(taskId);

    if (!task || task.userId !== userId) {
      return res.redirect("/tasks");
    }

    await task.update({ status });

    return res.redirect("/tasks");
  } 
  catch (err) {
    console.error("Task status update error:", err);
    return res.redirect("/tasks");
  }
});
 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
