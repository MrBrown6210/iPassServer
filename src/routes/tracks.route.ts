import * as express from "express";
import {
  index,
  create,
  createMultiple,
  destroy,
  explore,
  exploreDangerPlace,
  exploreDangerPerson,
  e,
} from "../services/tracks.service";
const router = express.Router();

router.get("/", index);
router.post("/", create);
router.post("/multiple", createMultiple);
router.delete("/:device", destroy);
router.get("/explore/:diseaseId", explore);
router.get("/explore/place/:diseaseId", exploreDangerPlace);
router.get("/explore/person/:diseaseId", exploreDangerPerson);
router.get("/explore/e/:diseaseId", e);

export default router;
