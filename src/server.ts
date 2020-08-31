import cors from "cors";
// const cors = require('cors');
import bodyParser from "body-parser";
// const bodyParser = require('body-parser');
import helmet from "helmet";
// const helmet = require('helmet');
import morgan from "morgan";
// const morgan = require('morgan');
import config from "config";
// const config = require('config');
import errorHandler from "api-error-handler";
// const errorHandler = require('api-error-handler');
import logger from "./middleware/logger";
// const logger = require('./middleware/logger');
import mongoose from "mongoose";
// const mongoose = require('mongoose');
import express from "express";
// const express = require('express');
import multer from "multer";
// const multer = require('multer');
import records from "./routes/records.route";
import tracks from "./routes/tracks.route";
const app = express();

// require('dotenv').config();

// process.env.DATABASE_PASSWORD = ""

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is missing");
  process.exit(1);
}

process.on("uncaughtException", (ex) => {
  logger.log("error", "uncaughtException ", ex);
});
app.use(cors()); // for all routes
app.use(
  morgan(
    ":method :url HTTP/:http-version :status :res[content-length] - :response-time ms"
  )
);
app.use(helmet());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// upload file path
const FILE_PATH = "uploads";
const upload = multer({
  dest: `${FILE_PATH}/`,
});

const DATABASE_USERNAME = process.env.DATABASE_USERNAME || config.db.username;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || config.db.password;

const dbOptions: any = {
  useNewUrlParser: true,
  useCreateIndex: true,
  connectTimeoutMS: 100000,
  // user: DATABASE_USERNAME,
  // pass: DATABASE_PASSWORD,
  // autoIndex: false,
};

const DATABASE_URL = process.env.DATABASE_URL || config.db.url;
const DATABASE_PORT = process.env.DATABASE_PORT || config.db.port;
const dbUri = `mongodb://${DATABASE_URL}:${DATABASE_PORT}/${config.db.name}`;

mongoose.connect(dbUri, dbOptions).then(() => {
  console.log("connected");
  // console.log = function() {};
});

const dbConnection = mongoose.connection;

dbConnection.on("error", (error) => {
  if (
    error.message &&
    error.message.match(/failed to connect to server .* on first connect/)
  ) {
    setTimeout(function() {
      console.log("trying to reconnect...");
      mongoose
        .connect(dbUri, dbOptions)
        .then(() => {
          console.log("connected");
          console.log = function() {};
        })
        .catch(() => {
          // empty catch avoids unhandled rejections
        });
    }, 20 * 1000);
  } else {
    // Some other error occurred.  Log it.
    console.error(new Date(), String(error));
  }
});

// const users = require("./routes/users");
// const auth = require("./routes/auth");
// const registrations = require("./routes/registrations");
// const consents = require("./routes/consents");
// const consentForms = require("./routes/consentForms");
// const patients = require("./routes/patients");
// const families = require("./routes/families");
// const hospitals = require("./routes/hospitals");
// const projects = require("./routes/projects");
// const provinces = require("./routes/provinces");
// const stats = require("./routes/stats");
// const samples = require("./routes/samples");
// const home = require("./routes/home");

// app.use("/users", users);
// app.use("/login", auth);
// app.use("/registrations", registrations);
// app.use("/consents", consents);
// app.use("/consent-forms", consentForms);
// app.use("/patients", patients);
// app.use("/families", families);
// app.use("/hospitals", hospitals);
// app.use("/projects", projects);
// app.use("/provinces", provinces);
// app.use("/stats", stats);
// app.use("/samples", samples);
// app.use("/", home);

app.use("/records", records);
app.use("/tracks", tracks);

app.use(errorHandler());
app.use(express.static("public"));

const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(
    `Listening on port ${port} : start time -> ${new Date().toDateString()}`
  );
});
