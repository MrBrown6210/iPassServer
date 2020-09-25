// Group by key

import { ITrackPoint, GroupTracks, AnyObject } from "../types";

// export const groupBy: any = (arr: any[], key: string) => {
//   const group = arr.reduce((result, item) => {
//     result[item[key]] = [...(result[item[key]] || []), item];
//     return result;
//   }, {});
//   return group;
// };

export const groupBy = <T, K extends keyof any>(
  list: T[],
  getKey: (item: T) => K
) =>
  list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) previous[group] = [];
    previous[group].push(currentItem);
    return previous;
  }, {} as Record<K, T[]>);
