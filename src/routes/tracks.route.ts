import * as express from "express";
import { index, create, destroy, explore } from "../services/tracks.service";
const router = express.Router();

router.get("/", index);
router.post("/", create);
router.delete("/:device", destroy);
router.get("/explore", explore);

export default router;
