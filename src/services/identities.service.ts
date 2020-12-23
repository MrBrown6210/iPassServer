import { Request, Response, NextFunction } from "express";
import { transporter } from "../utils/nodemailer";
import { Identity } from "../models/identity.model";
export const index = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const identities = await Identity.find();
    res.json(identities);
  } catch (e) {
    next(e);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const identity = new Identity(req.body);
    await identity.save();
    res.json(identity);
  } catch (e) {
    next(e);
  }
};

export const show = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const identity = await Identity.findOne({ uuid: req.params.id });
    if (!identity) return res.sendStatus(404);
    res.json(identity);
  } catch (e) {
    next(e);
  }
};

export const destroy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await Identity.findOneAndDelete({ _id: req.params.id });
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
};

export const notification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const identity = await Identity.findOne({ uuid: req.params.id });
    if (!identity) return res.sendStatus(404);
    if (!identity.email) return res.sendStatus(404);
    //TODO: send email
    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: identity.email,
      subject: "คุณอาจมีความเสี่ยงติดเชื้อ COVID-19",
      html:
        "<h1>คุณอาจมีความเสี่ยงติดเชื้อ COVID-19</h1><p>กรุณาตรวจเชื้อเพื่อหยุดยั้งการแพร่ระบาดต่อไป</p>",
    });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};
