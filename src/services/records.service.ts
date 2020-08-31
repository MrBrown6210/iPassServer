import config from "config";
import asyncMiddleware from "../middleware/async-middleware";
import { Record } from "../models/record.model";
import { Request, Response, NextFunction } from "express";

export const index = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const records = await Record.find(req.query);
  res.json(records);
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const oldRecord = await Record.findOne({ device: req.body.device });
  if (oldRecord) {
    await oldRecord.remove();
  }

  const record = new Record({
    device: req.body.device,
    data: req.body.data,
  });

  await record.save();

  res.json(record);
};

export const show = async (req: Request, res: Response, next: NextFunction) => {
  const record = await Record.findOne({ device: req.params.device });
  if (!record) {
    return res.sendStatus(404);
  }
  res.json(record);
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const record = await Record.findOneAndUpdate(
    { device: req.body.device },
    { $set: req.body },
    { new: true }
  );
  res.json(record);
};

export const destroy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await Record.findOneAndDelete({ device: req.body.device });
  res.sendStatus(200);
};

export const explore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.query.id;
};

// exports.create = asyncMiddleware(async (req, res, next) => {
//   // const { error } = validateOnCreate(req.body);
//   // if (error) {
//   //     return res.status(400).send(error.details[0].message);
//   // }

//   let record = await Record.findOne({ name: req.body.name });
//   if (record) {
//     return res.status(400).send("Name already exists");
//   }

//   console.log("req.body", req.body);

//   record = new Record(
//     _.pick(req.body, ["name", "address", "phone", "email", "province"])
//   );
//   record = await record.save();

//   // const filter: any = { name: req.body.name, nameEn: req.body.nameEn };
//   // let record = await record.findOne(filter);
//   // // if (!record) {
//   // //     record = record.new(filter);
//   // //     record = await record.save();
//   // // }

//   res.json(record);
// });

// exports.show = asyncMiddleware(async (req, res, next) => {
//   const currentUser = await Record.findById(req.user._id).select("-password");

//   // const { error } = validate(req.body);
//   // if (error) {
//   //     return res.status(400).send(error.details[0].message);
//   // }

//   let record = await Record.findById(req.params.id);

//   if (!record) {
//     return res.status(404).send("record not found.");
//   }

//   res.json(record);
// });

// exports.update = asyncMiddleware(async (req, res, next) => {
//   let record = await Record.findById(req.params.id);
//   if (!record) {
//     return res.status(404).send("record not found.");
//   }

//   record = await Record.findOneAndUpdate(
//     { _id: req.params.id },
//     _.pick(req.body, ["name", "address", "email", "phone"]),
//     {
//       new: true,
//     }
//   );

//   res.json(record);
// });

// exports.destroy = asyncMiddleware(async (req, res, next) => {
//   let record = await Record.findById(req.params.id);
//   if (!record) {
//     return res.status(404).send("record not found.");
//   }

//   const result = await Record.deleteOne({ _id: record._id });

//   res.json({ message: "record has been deleted." });
// });

// export default {
//   index: exports.index,
//   create: exports.create,
//   show: exports.show,
//   update: exports.update,
//   destroy: exports.destroy,
// };
