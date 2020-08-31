import jwt from "jsonwebtoken";
import { decode } from "punycode";
import config from "config";

export default function(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: "No credentials sent!" });
  }
  // const token = req.header('x-auth-token');
  const token = req.get("authorization").replace("Bearer ", "");
  console.log("token", token);

  if (!token) {
    return res.status(401).send("Access denied. No token privide.");
  }
  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    if (
      ["nurse", "doctor", "h-admin", "admin", "super"].includes(decode["role"])
    ) {
      return res.status(403).send("Access denied.");
    }
    console.log("decoded", decoded);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send(`Invalid access token`);
  }
}
