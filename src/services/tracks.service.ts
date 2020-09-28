import config from "config";
import asyncMiddleware from "../middleware/async-middleware";
import { Track } from "../models/track.model";
import { Request, Response, NextFunction } from "express";

import createError from "http-errors";
import dayjs from "dayjs";
import {
  ITrackPoint,
  RequirePoint,
  GroupTracks,
  ITrack,
  AnyObject,
  BaseTable,
  IPlace,
} from "../types";
import { groupBy } from "../utils/group";
import { Place } from "../models/place.model";
import {
  dangerousPointFromRiskPoint,
  riskPlacePointFromDurationInMinutes,
} from "../utils/point";

export const index = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tracks = await Track.find(req.query);
  res.json(tracks);
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const track = new Track({
      owner: req.body.owner,
      found: req.body.found,
      leave_at: req.body.leave_at,
      stay: req.body.stay,
    });
    await track.save();
    res.json(track);
  } catch (err) {
    return next(err);
  }
};

export const createMultiple = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.body.items);
  if (!(req.body.items instanceof Array)) {
    return next(createError(400));
  }
  try {
    const items: any[] = req.body.items;
    const result = await Track.insertMany(items);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// export const show = async (req: Request, res: Response, next: NextFunction) => {
//   const record = await Record.findOne({ device: req.params.device });
//   if (!record) {
//     return res.sendStatus(404);
//   }
//   res.json(record);
// };

// export const update = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const record = await Record.findOneAndUpdate(
//     { device: req.body.device },
//     { $set: req.body },
//     { new: true }
//   );
//   res.json(record);
// };

export const destroy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await Track.findByIdAndDelete(req.body.id);
  res.sendStatus(200);
};

export const explore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const diseaseId: string = req.params.diseaseId as string;
  const day = Number(req.query.day) || 14;
  const start = Number(req.query.start) || Date.now() / 1000;

  const dayInSecond = 60 * 60 * 24;

  const places = await Place.find().select(["uuid", "name"]);

  // หาทุก track ที่เกี่ยวข้องกับผู้ติดเชื้อ
  // TODO: ต้อง query 14 วันล่าสุดด้วย ไม่ใช่ข้อมูลทั้งหมด
  const risksTracksFromInfectious = await Track.find({
    owner: diseaseId,
    // timestamp: { $gte: start - day * dayInSecond },
  }).sort("leave_at");

  const tracks = risksTracksFromInfectious.map((track) => {
    const dateTime = new Date(track.leave_at * 1000);
    const date = dateFormat(dateTime);
    const place = places.find((p) => p.uuid === track.found);
    return {
      ...track.toObject(),
      date,
      name: place ? place.name : track.found,
    };
  });

  res.json(groupBy(tracks, (t) => t.date));
};

export const exploreDangerPlace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const diseaseId: string = req.params.diseaseId as string;
  const places = await Place.find().select(["uuid", "name"]);
  const tracks = await Track.find({
    owner: diseaseId,
    found: { $in: places.map((place) => place.uuid) },
  });
  const _tracks: ITrackPoint[] = tracks.map((track) => {
    const point = riskPlacePointFromDurationInMinutes(track.stay / 1000);
    return { ...track.toObject(), point };
  });

  const results: any[] = [];

  const group = groupBy(_tracks, (t) => t.found);
  for (let key in group) {
    let initValue = 0;

    const place = places.find((p) => p.uuid === key);
    const point = group[key].reduce(
      (acc, current) => (acc += current.point),
      initValue
    );
    const alert = dangerousPointFromRiskPoint(point);
    results.push({
      id: key,
      point,
      alert,
      place,
    });
  }
  res.json(results);
};

export const exploreDangerPerson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const diseaseId: string = req.params.diseaseId as string;
  const places = await Place.find().select(["uuid", "name"]);
  const tracks = await Track.find({
    owner: diseaseId,
    found: { $nin: places.map((place) => place.uuid) },
  });
  const _tracks: ITrackPoint[] = tracks.map((track) => {
    const point = riskPlacePointFromDurationInMinutes(track.stay / 1000);
    return { ...track.toObject(), point };
  });

  const results: any[] = [];

  const group = groupBy(_tracks, (t) => t.found);
  for (let key in group) {
    let initValue = 0;

    const point = group[key].reduce(
      (acc, current) => (acc += current.point),
      initValue
    );
    const alert = dangerousPointFromRiskPoint(point);
    results.push({
      id: key,
      point,
      alert,
    });
  }
  res.json(results);
};

export const e = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const x = await Track.aggregate([
      {
        $group: {
          _id: "$owner",
          count: { $sum: 1 },
        },
      },
    ]);
    console.log(x);
    res.json(x);
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const dateFormat = (date: Date) => {
  return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
};
