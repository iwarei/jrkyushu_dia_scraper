export type LineInfo = {
  id?: number;
  name: string;
  code: string | undefined;
  created_at?: Date;
  updated_at?: Date;
};

export type StationInfo = {
  id?: number;
  name: string;
  code: string;
  name_kana: string;
  created_at?: Date;
  updated_at?: Date;
};

export type LineStationRelation = {
  id?: number;
  line_id: number;
  station_id: number;
  created_at?: Date;
  updated_at?: Date;
};
