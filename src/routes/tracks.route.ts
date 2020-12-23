import * as express from "express";
import {
  index,
  create,
  createMultiple,
  destroy,
  exploreOne,
  explore,
  explorePerson,
  explorePlace,
} from "../services/tracks.service";
const router = express.Router();

router.get("/", index);
router.post("/", create);
router.post("/multiple", createMultiple);
router.delete("/:device", destroy);
router.get("/explore", explore);
router.get("/explore/:diseaseId", exploreOne);
router.get("/explore/place/:id", explorePlace);
router.get("/explore/person/:id", explorePerson);
// router.get("/explorea/:id", explorePerson);

export default router;
