import axios from 'axios';
import * as cheerio from 'cheerio';
import prisma from './../prisma';
import type { LineInfo, LineStationRelation, StationInfo } from './../types';

/** 登録用に一時的に使用する駅情報 */
type StationInfoTemp = {
  name: string;
  name_kana: string;
  code: string;
  routes: string[];
};

/**
 * 線名情報を取得し登録する
 * @return {Promise<LineInfo[]>} 登録済の線名情報
 */
export const getStationInfo = async (
  lines: LineInfo[],
): Promise<StationInfo[]> => {
  const registered: StationInfo[] = [];
  for (const line of lines) {
    const stations = await registStationInfo(await scrapeStationInfo(line));
    for (const station of stations) {
      registLineStationRelation(lines, station);
    }
    registered.push(...stations);
  }
  return registered;
};

/**
 * 各路線ページから駅情報を取得する
 * @param {LineInfo} 路線情報
 * @return {Promise<tmpStationInfo[]>} 駅情報の配列
 */
export const scrapeStationInfo = async (
  lineInfo: LineInfo,
): Promise<StationInfoTemp[]> => {
  try {
    const { data } = await axios.get(
      `https://www.jrkyushu-timetable.jp/jr-k_time/${lineInfo.code}.html`,
    );
    const $ = cheerio.load(data);
    const stations: StationInfoTemp[] = [];

    $('table tr').each((_, e) => {
      const datas = $(e).find('td');
      if (datas.length >= 3) {
        const linkElement = datas.eq(0).find('a');
        const name = linkElement.text().trim();
        if (name.length === name.indexOf('）') + 1) {
          const link = linkElement.attr('href') ?? '';
          const code = link?.split('?').pop()?.replace('c=', '') ?? '';
          const routes = $(datas).eq(1).text().trim().split(' ');
          const routeList: string[] = [];
          for (const route of routes) {
            routeList.push(route);
          }
          const station: StationInfoTemp = {
            name: name.split('（')[0],
            name_kana: name.split('（')[1].replace('）', ''),
            code,
            routes: routeList,
          };
          stations.push(station);
        }
      }
    });
    return stations;
  } catch (e) {
    console.log(e);
    return [];
  }
};

/**
 * 駅情報を登録する
 * @param {StationInfoTemp[]} 登録用駅情報の配列
 * @return {Promise<StationInfo[]>} 線名情報の配列
 */
export const registStationInfo = async (
  stationInfo: StationInfoTemp[],
): Promise<StationInfo[]> => {
  const registered: StationInfo[] = [];

  for (const station of stationInfo) {
    // 既に登録されていないかチェック
    const exist = await prisma.station.findUnique({
      where: {
        code: station.code,
      },
    });
    if (exist && !registered.find((e) => e.id === exist.id)) {
      registered.push(exist);
      continue;
    }

    // 登録されていない場合は登録
    const newStation = await prisma.station.create({
      data: {
        name: station.name,
        name_kana: station.name_kana,
        code: station.code,
      },
    });
    registered.push(newStation);
  }
  return registered;
};

/**
 * 路線・駅リレーション情報を登録する
 * @param {lines: LineInfo[]} 登録する路線情報の配列
 * @param {station: StationInfo} 登録する駅情報の
 * @return {Promise<StationInfo[]>} 線名情報の配列
 */
const registLineStationRelation = async (
  lines: LineInfo[],
  station: StationInfo,
): Promise<LineStationRelation[]> => {
  const registered: LineStationRelation[] = [];
  for (const line of lines) {
    try {
      if (!line.id || !station.id) continue;
      const exist = await prisma.lineStation.findUnique({
        where: {
          line_id_station_id: {
            line_id: line.id,
            station_id: station.id,
          },
        },
      });
      if (exist && !registered.find((e) => e.id === exist.id)) {
        registered.push(exist);
        continue;
      }

      // 登録されていない場合は登録
      const newRelation = await prisma.lineStation.create({
        data: {
          line_id: line.id!,
          station_id: station.id!,
        },
      });
      registered.push(newRelation);
    } catch (e) {
      console.log(e);
    }
  }

  return registered;
};

/**
 * 駅IDまたは駅コードをもとに駅情報を取得する
 * @param {id?: number} 検索する駅ID
 * @param {code?: string} 検索する駅コード
 * @return {Promise<StationInfo | null>} 駅情報
 */
export const searchStation = async ({
  id,
  code,
}: {
  id?: number;
  code?: string;
}): Promise<StationInfo | null> => {
  if (!id && !code) {
    console.error('searchStation: 駅または駅コードのいずれかは必須です。');
    return null;
  }
  try {
    return await prisma.station.findUnique({
      where: {
        id: id ?? undefined,
        code: code ?? undefined,
      },
    });
  } catch (e) {
    console.error('searchStation: throw error', e);
    return null;
  }
};
