import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import morgan from "morgan";
import config from "config";
import errorHandler from "api-error-handler";
import logger from "./middleware/logger";
import mongoose from "mongoose";
import express from "express";
import multer from "multer";

import dotenv from "dotenv";

dotenv.config();

import records from "./routes/records.route";
import tracks from "./routes/tracks.route";
import places from "./routes/place.route";
import persons from "./routes/person.route";
import identities from "./routes/identity.route";
const app = express();

// require('dotenv').config();

// process.env.DATABASE_PASSWORD = ""

// if (!config.get("jwtPrivateKey")) {
//   console.error("FATAL ERROR: jwtPrivateKey is missing");
//   process.exit(1);
// }

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

app.use("/records", records);
app.use("/tracks", tracks);
app.use("/places", places);
app.use("/persons", persons);
app.use("/identities", identities);

// handle mongoose-unique-validator
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key) {
        errors[key] = err.errors[key].message;

        return errors;
      }, {}),
    });
  }

  return next(err);
});

app.use(express.static("public"));
app.use(errorHandler());

const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(
    `Listening on port ${port} : start time -> ${new Date().toDateString()}`
  );
});
