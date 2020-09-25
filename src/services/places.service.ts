import { Request, Response, NextFunction } from "express";
import { Place } from "../models/place.model";
export const index = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const places = await Place.find(req.query);
  res.json(places);
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const place = new Place(req.body);
    await place.save();
    res.json(place);
  } catch (err) {
    return next(err);
  }
};

export const show = async (req: Request, res: Response, next: NextFunction) => {
  const place = await Place.findOne({ _id: req.params.place });
  res.json(place);
};

export const destroy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await Place.findOneAndDelete({ _id: req.params.place });
};
