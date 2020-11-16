import config from "config";
import asyncMiddleware from "../middleware/async-middleware";
import { Track } from "../models/track.model";
import { Request, Response, NextFunction } from "express";

import createError from "http-errors";
import { groupBy } from "../utils/group";
import { Place } from "../models/place.model";

export const index = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tracks = await Track.find(req.query);
    res.json(tracks);
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

export const destroy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await Track.findByIdAndDelete(req.body.id);
  res.sendStatus(200);
};

export const exploreOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const diseaseId: string = req.params.diseaseId as string;
  const day = Number(req.query.day) || 14;
  const start = Number(req.query.start) || Date.now() / 1000;

  // หาทุก track ที่เกี่ยวข้องกับผู้ติดเชื้อ
  // TODO: ต้อง query 14 วันล่าสุดด้วย ไม่ใช่ข้อมูลทั้งหมด
  const risksTracksFromInfectious = await Track.aggregate([
    {
      $match: {
        owner: diseaseId,
      },
    },
    {
      $lookup: {
        from: "identities",
        localField: "found",
        foreignField: "uuid",
        as: "identity",
      },
    },
    {
      $unwind: {
        path: "$identity",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        name: "$identity.name",
      },
    },
    {
      $unset: ["identity", "createdAt", "updatedAt", "__v", "owner"],
    },
    {
      $sort: {
        leave_at: 1,
      },
    },
  ]);
  console.log(risksTracksFromInfectious);
  // const risksTracksFromInfectious = await Track.find({
  //   owner: diseaseId,
  //   // timestamp: { $gte: start - day * dayInSecond },
  // }).sort("leave_at");

  const tracks = risksTracksFromInfectious.map((track) => {
    const dateTime = new Date(track.leave_at * 1000);
    const date = dateFormat(dateTime);
    // const place = places.find((p) => p.uuid === track.found);
    return {
      ...track,
      date,
    };
  });

  res.json(groupBy(tracks, (t) => t.date));
};

// export const exploreDangerPlace = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const diseaseId: string = req.params.diseaseId as string;
//   const places = await Place.find().select(["uuid", "name"]);
//   const tracks = await Track.find({
//     owner: diseaseId,
//     found: { $in: places.map((place) => place.uuid) },
//   });
//   const _tracks: ITrackPoint[] = tracks.map((track) => {
//     const point = riskPlacePointFromDurationInMinutes(track.stay / 1000);
//     return { ...track.toObject(), point };
//   });

//   const results: any[] = [];

//   const group = groupBy(_tracks, (t) => t.found);
//   for (let key in group) {
//     let initValue = 0;

//     const place = places.find((p) => p.uuid === key);
//     const point = group[key].reduce(
//       (acc, current) => (acc += current.point),
//       initValue
//     );
//     const alert = dangerousPointFromRiskPoint(point);
//     results.push({
//       id: key,
//       point,
//       alert,
//       place,
//     });
//   }
//   res.json(results);
// };

// export const exploreDangerPerson = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const diseaseId: string = req.params.diseaseId as string;
//   const places = await Place.find().select(["uuid", "name"]);
//   const tracks = await Track.find({
//     owner: diseaseId,
//     found: { $nin: places.map((place) => place.uuid) },
//   });
//   const _tracks: ITrackPoint[] = tracks.map((track) => {
//     const point = riskPersonPointFromDurationInMinutes(track.stay / 1000);
//     return { ...track.toObject(), point };
//   });

//   const results: any[] = [];

//   const group = groupBy(_tracks, (t) => t.found);
//   for (let key in group) {
//     let initValue = 0;

//     const point = group[key].reduce(
//       (acc, current) => (acc += current.point),
//       initValue
//     );
//     const alert = dangerousPointFromRiskPoint(point);
//     results.push({
//       id: key,
//       point,
//       alert,
//     });
//   }
//   res.json(results);
// };

const calculateAlertFromTrack = [
  {
    $unwind: {
      path: "$identity",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      point: {
        $switch: {
          branches: [
            { case: { $gte: ["$stay", 60 * 60 * 1000] }, then: 3 },
            { case: { $gte: ["$stay", 10 * 60 * 1000] }, then: 2 },
            { case: { $gte: ["$stay", 5 * 60 * 1000] }, then: 1.5 },
            { case: { $gte: ["$stay", 2 * 60 * 1000] }, then: 1 },
          ],
          default: 0,
        },
      },
      count: 1,
      owner: 1,
      name: {
        $ifNull: ["$identity.name", "$owner"],
      },
      type: "$identity.type",
    },
  },
  {
    $group: {
      _id: "$owner",
      found_count: { $sum: 1 },
      point: { $sum: "$point" },
      name: { $first: "$name" },
      type: { $first: "$type" },
    },
  },
  {
    $project: {
      found_count: 1,
      point: 1,
      name: 1,
      type: 1,
      alert: {
        $switch: {
          branches: [
            { case: { $gte: ["$point", 20] }, then: 4 },
            { case: { $gte: ["$point", 10] }, then: 3 },
            { case: { $gte: ["$point", 5] }, then: 2 },
            { case: { $gte: ["$point", 2] }, then: 1 },
          ],
          default: 0,
        },
      },
    },
  },
];

export const explore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tracks = await Track.aggregate([
      {
        $lookup: {
          from: "identities",
          localField: "owner",
          foreignField: "uuid",
          as: "identity",
        },
      },
      ...calculateAlertFromTrack,
    ]);
    console.log(tracks);
    res.json(tracks);
  } catch (e) {
    next(e);
  }
};

const alertFromFoundTrack = [
  {
    $lookup: {
      from: "identities",
      localField: "found",
      foreignField: "uuid",
      as: "identity",
    },
  },
  {
    $unwind: {
      path: "$identity",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      name: {
        $ifNull: ["$identity.name", "$found"],
      },
      point: {
        $switch: {
          branches: [
            { case: { $gte: ["$stay", 60 * 60 * 1000] }, then: 3 },
            { case: { $gte: ["$stay", 10 * 60 * 1000] }, then: 2 },
            { case: { $gte: ["$stay", 5 * 60 * 1000] }, then: 1.5 },
            { case: { $gte: ["$stay", 2 * 60 * 1000] }, then: 1 },
          ],
          default: 0,
        },
      },
    },
  },
  {
    $group: {
      _id: "$found",
      found_count: { $sum: 1 },
      point: { $sum: "$point" },
      name: { $first: "$name" },
      type: { $first: "$identity.type" },
    },
  },
  {
    $addFields: {
      alert: {
        $switch: {
          branches: [
            { case: { $gte: ["$point", 20] }, then: 4 },
            { case: { $gte: ["$point", 10] }, then: 3 },
            { case: { $gte: ["$point", 5] }, then: 2 },
            { case: { $gte: ["$point", 2] }, then: 1 },
          ],
          default: 0,
        },
      },
    },
  },
];

export const explorePerson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tracks = await Track.aggregate([
      {
        $match: {
          owner: req.params.id,
        },
      },
      {
        $lookup: {
          from: "identities",
          localField: "found",
          foreignField: "uuid",
          as: "identity",
        },
      },
      {
        $unwind: {
          path: "$identity",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          name: {
            $ifNull: ["$identity.name", "$found"],
          },
          point: {
            $switch: {
              branches: [
                { case: { $gte: ["$stay", 60 * 60 * 1000] }, then: 3 },
                { case: { $gte: ["$stay", 10 * 60 * 1000] }, then: 2 },
                { case: { $gte: ["$stay", 5 * 60 * 1000] }, then: 1.5 },
                { case: { $gte: ["$stay", 2 * 60 * 1000] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: "$found",
          found_count: { $sum: 1 },
          point: { $sum: "$point" },
          name: { $first: "$name" },
          type: { $first: "$identity.type" },
        },
      },
      {
        $match: {
          type: "person",
        },
      },
      {
        $addFields: {
          alert: {
            $switch: {
              branches: [
                { case: { $gte: ["$point", 20] }, then: 4 },
                { case: { $gte: ["$point", 10] }, then: 3 },
                { case: { $gte: ["$point", 5] }, then: 2 },
                { case: { $gte: ["$point", 2] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
    ]);
    res.json(tracks);
  } catch (e) {
    next(e);
  }
};

export const explorePlace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tracks = await Track.aggregate([
      {
        $match: {
          owner: req.params.id,
        },
      },
      {
        $lookup: {
          from: "identities",
          localField: "found",
          foreignField: "uuid",
          as: "identity",
        },
      },
      {
        $unwind: {
          path: "$identity",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          name: {
            $ifNull: ["$identity.name", "$found"],
          },
          point: {
            $switch: {
              branches: [
                { case: { $gte: ["$stay", 60 * 60 * 1000] }, then: 3 },
                { case: { $gte: ["$stay", 10 * 60 * 1000] }, then: 2 },
                { case: { $gte: ["$stay", 5 * 60 * 1000] }, then: 1.5 },
                { case: { $gte: ["$stay", 2 * 60 * 1000] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: "$found",
          found_count: { $sum: 1 },
          point: { $sum: "$point" },
          name: { $first: "$name" },
          type: { $first: "$identity.type" },
        },
      },
      {
        $match: {
          type: "place",
        },
      },
      {
        $addFields: {
          alert: {
            $switch: {
              branches: [
                { case: { $gte: ["$point", 20] }, then: 4 },
                { case: { $gte: ["$point", 10] }, then: 3 },
                { case: { $gte: ["$point", 5] }, then: 2 },
                { case: { $gte: ["$point", 2] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
    ]);
    res.json(tracks);
  } catch (e) {
    next(e);
  }
};

const dateFormat = (date: Date) => {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};
