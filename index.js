const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const deleteOldFiles = require("./deleteOldFiles");
const session = require("express-session");
require('dotenv').config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: 5 * 60 * 1000 },
  })
);

app.use((req, res, next) => {
  if (!req.session.visitCount) {
    req.session.visitCount = 1;
  }
  req.session.visitCount++;
  if (req.session.visitCount > 10) {
    return res.status(400).json({ message: "You crossed the limit! Please try again after 5 minutes" });
  }
  next();
});

setInterval(deleteOldFiles, 5 * 60 * 1000);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + ":" + file.originalname);
  },
});

const upload = multer({
  storage,
});

app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res
      .status(400)
      .json({ message: "Please select file!" });
    }
    const link = `http://${req.get("host")}/download/${req.file.filename}`;

    res.send(`
        <h1>Here is your link!</h1>
        <p>Share this link below:</p>
        <a href="${link}" target="_blank">${link}</a>
    `);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "There was some error while uploading file" });
  }
});

app.get("/download/:filename", (req, res) => {
  const filepath = path.join(__dirname, "uploads", req.params.filename);
  const filenameToDownload = req.params.filename.split(":")[1];

  res.download(filepath, filenameToDownload, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "There was some error while downloading file" });
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(1000, () => {
  console.log("Server is listening at 1000");
});
