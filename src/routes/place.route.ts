import * as express from "express";
import {
  index,
  create,
  show,
  //   update,
  destroy,
} from "../services/places.service";
const router = express.Router();

router.get("/", index);
router.post("/", create);
router.get("/:place", show);
// router.patch("/:place", update);
router.delete("/:place", destroy);

export default router;
