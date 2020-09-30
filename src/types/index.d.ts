// ใส่ค่าที่ต้องการเพื่อต้องการผลลัพธ์ที่ต้องการนั้นๆ

export interface ITrack {
  owner: string;
  found: string;
  leave_at: number;
  stay: number;
  point?: number;
  type?: string;
}

export interface IPlace {
  uuid: string;
  name: string;
  lat: number;
  lng: number;
}

export interface IPerson {
  uuid: string;
  name: string;
}

export interface IIdentity {
  uuid: string;
  name: string;
  type: string;
  lat?: number;
  lng?: number;
}

export interface BaseTable {
  input: number;
  output: number;
}

interface RequirePoint {
  result: number;
  require: number;
}

interface ITrackPoint extends ITrack {
  point: number;
  alert?: number;
  place?: IPlace;
}

interface GroupTracks {
  id: string;
  point: number;
}

export interface AnyObject {
  [key: string]: any;
}
