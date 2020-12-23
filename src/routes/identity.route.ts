import * as express from "express";
import {
  index,
  create,
  show,
  destroy,
  notification,
} from "../services/identities.service";
const router = express.Router();
router.get("/", index);
router.post("/", create);
router.get("/:id", show);
router.delete("/:id", destroy);
router.post("/:id/notification", notification);
export default router;
