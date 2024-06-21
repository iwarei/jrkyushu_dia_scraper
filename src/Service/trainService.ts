import axios from 'axios';
import * as cheerio from 'cheerio';
import type { StationInfo, StopStationInfo, TrainInfo } from './../types';

/** 登録用に一時的に使用する駅情報 */
type TrainInfoTemp = {
  id?: number;
  shinkansen_flg: boolean;
  kind: string;
  name?: string;
  number: string;
  facility?: string;
  drive_day: string;
  remarks?: string;
  created_at?: Date;
  updated_at?: Date;
};

type TrainDetail = {
  trainInfo: TrainInfo;
  stopStations: StopStationInfo[];
};

/**
 * 列車情報を取得し登録する
 */
export const getTrainInfo = async (stations: StationInfo[]) => {
  for (const station of stations) {
    await scrapeTrainInfo(station);
    // await registTrainInfo(await scrapeTrainInfo(station));
  }
};

/**
 * 駅ページから列車情報を取得する
 * @return {Promise<StationInfo[]>} 線名情報の配列
 */
export const scrapeTrainInfo = async (
  station: StationInfo,
): Promise<TrainInfo[]> => {
  try {
    const { data } = await axios.get(
      // `https://www.jrkyushu-timetable.jp/cgi-bin/jr-k_time/tt_dep.cgi?c=${station.code}`,
      `https://www.jrkyushu-timetable.jp/cgi-bin/jr-k_time/tt_dep.cgi?c=28283`,
    );
    const $ = cheerio.load(data);

    const trains: TrainInfo[] = [];
    // 路線ごとにテーブル取得
    $('table.timetable > tbody > tr > td > table > tbody').each((i, e) => {
      // console.log(e);
      const trs = $(e).children('tr');
      console.log(`${i}番目のテーブル`);
      // 路線名取得 (現状未使用)
      console.log($(trs[0]).text().trim());

      for (let j = 1; j < trs.length; j++) {
        const hour = $($(trs[j]).find('th')[0]).text().trim();

        // 列車種別ごとのtdタグ取得 (特急/ローカル)
        const kinds = $(trs[j]).children('td');
        console.log(`hour: ${hour}  kind: ${kinds.length}`);
        for (const kind of kinds) {
          // 種別ごとの列車情報取得
          const trains = $($(kind).find('td'));
          console.log(trains.length);
          for (const train of trains) {
          }
        }
      }

      // ほかのリンクも取得されるため.*線となるものを対象にする
      // if (
      //   lineName.includes('線') &&
      //   lineName.length === lineName.indexOf('線') + 1
      // ) {
      //   const lineLink = $(e).attr('href') ?? '';
      //   const lineCode = lineLink?.split('/').pop()?.replace('.html', '');

      //   // trains.push({ name: lineName, code: lineCode });
      // }
    });

    return trains;
  } catch (e) {
    console.log(e);
    return [];
  }
};

// /**
//  * 列車情報を登録する
//  * @param {TrainInfo[]} 列車情報の配列
//  */
// export const registTrainInfo = async (
//   lineInfo: LineInfo[],
// ): Promise<LineInfo[]> => {
//   const registered: LineInfo[] = [];

//   for (const line of lineInfo) {
//     // 既に登録されていないかチェック
//     const exist = await prisma.line.findUnique({
//       where: {
//         code: line.code,
//       },
//     });

//     if (exist && !registered.find((e) => e.id === exist.id)) {
//       registered.push(exist);
//       continue;
//     }

//     // 登録されていない場合は登録
//     const newLine = await prisma.line.create({
//       data: {
//         name: line.name,
//         code: line.code ?? '',
//       },
//     });
//     registered.push(newLine);
//   }
//   return registered;
// };
