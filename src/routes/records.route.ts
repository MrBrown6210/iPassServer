import * as express from "express";
import {
  index,
  create,
  show,
  update,
  destroy,
} from "../services/records.service";
import auth from "../middleware/auth";
import admin from "../middleware/admin";
// import mongoose from 'mongoose';
const router = express.Router();
// const hospitalController = require('../services/hospitals');
// const { User, validate } = require('../models/user');
// const auth = require("../middleware/auth");
// const admin = require("../middleware/admin");

router.get("/", index);
router.post("/", create);
router.get("/:device", show);
router.patch("/:device", update);
router.delete("/:device", destroy);

export default router;
