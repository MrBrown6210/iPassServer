import { json } from "body-parser";
import { Request, Response, NextFunction } from "express";
import { Person } from "../models/person.model";

export const index = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const persons = await Person.find();
  res.json(persons);
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const person = new Person(req.body);
    await person.save();
    res.json(person);
  } catch (error) {
    next(error);
  }
};

export const show = async (req: Request, res: Response, next: NextFunction) => {
  const person = await Person.findOne({ _id: req.params.id });
  res.json(person);
};

export const destroy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await Person.findOneAndDelete({ _id: req.params.id });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
