import * as express from "express";
import {
  index,
  create,
  createMultiple,
  destroy,
  explore,
} from "../services/tracks.service";
const router = express.Router();

router.get("/", index);
router.post("/", create);
router.post("/multiple", createMultiple);
router.delete("/:device", destroy);
router.get("/explore/:diseaseId", explore);

export default router;
