export type LineInfo = {
  id?: number;
  name: string;
  code: string | undefined;
  created_at?: Date;
  updated_at?: Date;
};

export type StationInfo = {
  id?: number;
  stationName: string;
  stationCode: string;
  stationNameKana: string;
  created_at?: Date;
  updated_at?: Date;
};
