import config from "config";
import asyncMiddleware from "../middleware/async-middleware";
import { Track, ITrack } from "../models/track.model";
import { Request, Response, NextFunction } from "express";

const places = ["test3"];

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
  const track = new Track({
    owner: req.body.owner,
    found: req.body.found,
    timestamp: req.body.timestamp,
    stay: req.body.stay,
  });

  await track.save();

  res.json(track);
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
  const diseaseId: string = req.query.diseaseId as string;
  const day = Number(req.query.day) || 14;
  const start = Number(req.query.start) || Date.now() / 1000;

  const dayInSecond = 60 * 60 * 24;

  // หาทุก track ที่เกี่ยวข้องกับผู้ติดเชื้อ
  // TODO: ต้อง query 14 วันล่าสุดด้วย ไม่ใช่ข้อมูลทั้งหมด
  const risksTracksFromInfectious = await Track.find({
    owner: diseaseId,
    timestamp: { $gte: start - day * dayInSecond },
  });

  // ให้คะแนนความเสี่ยงพื้นที่
  const placeTracks = risksTracksFromInfectious.filter((track) =>
    places.includes(track.found)
  );
  const placePointTracks: ITrackPoint[] = placeTracks.map((track) => {
    return {
      owner: track.owner,
      found: track.found,
      stay: track.stay,
      timestamp: track.timestamp,
      point: trackToPoint(track),
    };
  });

  // รวมคะแนนและประเมินความเสี่ยงพื้นที่
  const groupPlaceTracks = groupTrackById(placePointTracks);
  const groupPlaceTracksResult = groupPlaceTracks.map((group) => {
    return {
      ...group,
      alert: calculateDangerousFromPoint(group.point),
    };
  });

  //////////////////////////////////////////////////////////////////

  // หา id พื้นที่เสี่ยงจากผู้ติดเชื้อ
  const dangerPlaces = risksTracksFromInfectious
    .filter((track) => places.includes(track.found))
    .map((track) => track.found);

  // หาคนในพื้นที่เสี่ยงที่ไม่ใช่คนติดโรคเอง
  const personalInDangerousZoneTracks = await Track.find({
    owner: { $ne: diseaseId },
    found: { $in: dangerPlaces },
    timestamp: { $gte: start - day * dayInSecond },
  });

  // ให้คะแนนคนที่อยู่ในพื้นที่เสี่ยง
  const personalInDangerousZonePointTracks: ITrackPoint[] = personalInDangerousZoneTracks.map(
    (track) => {
      let point = 0;
      if (dangerPlaces.includes(track.found)) {
        const pointsInMinute: RequirePoint[] = [
          {
            require: 2,
            result: 0.1,
          },
          {
            require: 5,
            result: 0.2,
          },
          {
            require: 10,
            result: 0.4,
          },
          {
            require: 60,
            result: 0.6,
          },
        ];
        point = trackToPoint(track, pointsInMinute);
      }
      return {
        owner: track.owner,
        found: track.found,
        stay: track.stay,
        timestamp: track.timestamp,
        point,
      };
    }
  );

  const personalInDangerGroup = groupTrackById(
    personalInDangerousZonePointTracks,
    "owner"
  );
  console.log("xa", personalInDangerGroup);

  //////////////////////////////////////////////////

  const personalTracks = risksTracksFromInfectious.filter(
    (track) => !places.includes(track.found)
  );

  const personalPointTracks: ITrackPoint[] = personalTracks.map((track) => {
    return {
      owner: track.owner,
      found: track.found,
      stay: track.stay,
      timestamp: track.timestamp,
      point: trackToPoint(track),
    };
  });
  const groupPersonalTracks = groupTrackById(personalPointTracks);

  const groupPersonalTracksResult = groupPersonalTracks.map((group) => {
    const _group = personalInDangerGroup.find(
      (_group) => _group.id === group.id
    );
    const point = _group ? _group.point : 0;
    return {
      ...group,
      point: group.point + point,
      alert: calculateDangerousFromPoint(group.point),
    };
  });

  console.log(groupPlaceTracksResult);
  console.log(groupPersonalTracksResult);

  //   console.log(placePointTracks);
  //   console.log(personalPointTracks);

  return res.json({
    places: groupPlaceTracksResult,
    personals: groupPersonalTracksResult,
  });
};

// ใส่ค่าที่ต้องการเพื่อต้องการผลลัพธ์ที่ต้องการนั้นๆ
interface RequirePoint {
  result: number;
  require: number;
}

interface ITrackPoint extends ITrack {
  point: number;
}

interface GroupTracks {
  id: string;
  point: number;
}

const defaultPointInMinutes: RequirePoint[] = [
  {
    result: 1,
    require: 2,
  },
  {
    result: 1.5,
    require: 5,
  },
  {
    result: 2,
    require: 10,
  },
  {
    result: 3,
    require: 60,
  },
];

const defaultDangerousFromPoint: RequirePoint[] = [
  {
    result: 1,
    require: 2,
  },
  {
    result: 2,
    require: 5,
  },
  {
    result: 3,
    require: 10,
  },
  {
    result: 4,
    require: 20,
  },
];

const calculateDangerousFromPoint = (
  point: number,
  dangerousFromPoint: RequirePoint[] = defaultDangerousFromPoint
) => {
  const sortDangerousFromPoint = dangerousFromPoint.sort((lhf, rhf) =>
    lhf.require < rhf.require ? 1 : -1
  );
  // หาช่วงคะแนนจากเวลาที่ต้องการ
  const dangerRequirePoint = sortDangerousFromPoint.find(
    (pointInMinute) => point >= pointInMinute.require
  );
  const danger = dangerRequirePoint ? dangerRequirePoint.result : 0;
  return danger;
};

const groupTrackById = (tracks: ITrackPoint[], idKey: string = "found") => {
  const groupsTracks: GroupTracks[] = [];
  tracks.forEach((track) => {
    const groupIndex = groupsTracks.findIndex(
      (group) => group.id == track[idKey]
    );
    if (groupIndex >= 0) {
      groupsTracks[groupIndex].point += track.point;
    } else {
      groupsTracks.push({
        id: track[idKey],
        point: track.point,
      });
    }
  });
  return groupsTracks;
};

const trackToPoint = (
  track: ITrack,
  pointInMinutes: RequirePoint[] = defaultPointInMinutes
) => {
  const minuteInMillisecond = 1000 * 60;
  const stayInMinutes = track.stay / minuteInMillisecond;
  const sortPointInMinutes = pointInMinutes.sort((lhf, rhf) =>
    lhf.require < rhf.require ? 1 : -1
  );
  // หาช่วงคะแนนจากเวลาที่ต้องการ
  const pointInMinute = sortPointInMinutes.find(
    (pointInMinute) => stayInMinutes >= pointInMinute.require
  );
  const point = pointInMinute ? pointInMinute.result : 0;
  console.log(`${stayInMinutes} minutes will give ${point} point`);
  return point;
};
