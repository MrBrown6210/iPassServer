import * as express from "express";
import { index, create, show, destroy } from "../services/persons.service";
const router = express.Router();
router.get("/", index);
router.post("/", create);
router.get("/:id", show);
router.delete("/:id", destroy);
export default router;
