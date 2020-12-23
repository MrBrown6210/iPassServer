import { BaseTable } from "../types";

const riskPlacePointByMinutes: BaseTable[] = [
  {
    output: 1,
    input: 2,
  },
  {
    output: 1.5,
    input: 5,
  },
  {
    output: 2,
    input: 10,
  },
  {
    output: 3,
    input: 60,
  },
];

const riskPersonPointByMinutes = Object.assign(riskPlacePointByMinutes, {});

const riskPersonPointInRiskPlaceByMinutes: BaseTable[] = [
  {
    input: 2,
    output: 0.1,
  },
  {
    input: 5,
    output: 0.2,
  },
  {
    input: 10,
    output: 0.4,
  },
  {
    input: 60,
    output: 0.6,
  },
];

const defaultDangerousFromPoint: BaseTable[] = [
  {
    output: 1,
    input: 2,
  },
  {
    output: 2,
    input: 5,
  },
  {
    output: 3,
    input: 10,
  },
  {
    output: 4,
    input: 20,
  },
];

const convertValueFromTables = (
  _tables: BaseTable[],
  operator: (input: number, value: number) => boolean
) => (value: number) => {
  const tables = _tables.sort((lhf, rhf) => (lhf.input < rhf.input ? 1 : -1));
  const result = tables.find((table) => operator(table.input, value));
  return result?.output || 0;
};

export const riskPlacePointFromDurationInMinutes = convertValueFromTables(
  riskPlacePointByMinutes,
  (tableInput, value) => tableInput < value
);

export const riskPersonPointFromDurationInMinutes = convertValueFromTables(
  riskPersonPointByMinutes,
  (tableInput, value) => tableInput < value
);

export const riskPersonPointInRiskPlaceFromDurationInMinutes = convertValueFromTables(
  riskPersonPointInRiskPlaceByMinutes,
  (tableInput, value) => tableInput < value
);

export const dangerousPointFromRiskPoint = convertValueFromTables(
  defaultDangerousFromPoint,
  (tableInput, value) => tableInput < value
);
