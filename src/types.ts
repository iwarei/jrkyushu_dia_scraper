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

export type TrainInfo = {
  id?: number;
  shinkansen_flg: boolean;
  kind: string;
  name?: string;
  code: string;
  number: string;
  facility?: string;
  drive_day: string;
  remarks?: string;
  created_at?: Date;
  updated_at?: Date;
};

export type StopStationInfo = {
  id?: number;
  train_id: number;
  station_id: number;
  arrive_time?: string;
  departure_time?: string;
  passing_flag: boolean;
  platform?: string;
  order: number;
  created_at?: Date;
  updated_at?: Date;
};
