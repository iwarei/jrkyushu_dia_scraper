import axios from 'axios';
import * as cheerio from 'cheerio';
import type { StationInfo, StopStationInfo, TrainInfo } from './../types';
import { searchStation } from './stationService';

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
  const trainCodes: string[] = [];
  // 列車ごとのコード値を取得
  for (const station of stations) {
    for (const code of await getTrainCode(station)) {
      if (!trainCodes.find((e) => e == code)) trainCodes.push(code);
    }
  }
  // 取得したコードをもとに、列車ページをスクレイピング
  for (const code of trainCodes) {
    await scrapeTrainInfo(code);
  }
};

/**
 * 駅ページから列車コードを取得する
 * @param  {StationInfo[]} 駅情報の配列
 * @return {Promise<string[]>} 列車コードの配列
 */
export const getTrainCode = async (station: StationInfo): Promise<string[]> => {
  try {
    const { data } = await axios.get(
      // `https://www.jrkyushu-timetable.jp/cgi-bin/jr-k_time/tt_dep.cgi?c=${station.code}`,
      `https://www.jrkyushu-timetable.jp/cgi-bin/jr-k_time/tt_dep.cgi?c=28283`,
    );
    const $ = cheerio.load(data);
    const codeList: string[] = [];

    const trains: TrainInfo[] = [];
    // 路線ごとにテーブル取得
    $('table.timetable > tbody > tr > td > table > tbody').each((i, e) => {
      const trs = $(e).children('tr');

      // 路線名取得 (現状未使用)
      // console.log($(trs[0]).text().trim());
      for (let j = 1; j < trs.length; j++) {
        // 時刻 デバッグ用
        // const hour = $($(trs[j]).find('th')[0]).text().trim();

        // 列車種別ごとのtdタグ取得 (特急/ローカル)
        const kinds = $(trs[j]).children('td');
        for (const kind of kinds) {
          // 種別ごとの列車情報取得
          const trains = $($(kind).find('td'));
          // 列車が存在しない場合coutinue
          if (trains && !$(trains[0]).find('a').length) continue;

          for (const train of trains) {
            const link: string = $($(train).find('a')[0]).attr('href')!;
            const code: string = link.split('?')[0].split('.')[0].split('/')[4];
            // console.log(code);
            if (!codeList.find((e) => e === code)) codeList.push(code);
          }
        }
      }
    });

    return codeList;
  } catch (e) {
    console.log(e);
    return [];
  }
};

/**
 * 各列車ページから列車情報を取得する
 * @param {code: string} 列車コード
//  * @return {Promise<TrainDetail[]>} 列車情報
 */
export const scrapeTrainInfo = async (
  code: string,
  // ): Promise<Promise<TrainDetail>> => {
) => {
  try {
    const trainDetails: TrainDetail[] = [];
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const { data } = await axios.get(
      `https://www.jrkyushu-timetable.jp/jr-k_time/${year}${month}/${code.slice(0, 4)}/${code}.html`,
    );
    const $ = cheerio.load(data);
    // 1ページの列車数 (併結, 列番ひらがわりで2以上の場合がある)
    let trainCount = 0;
    let debug_index = 0;

    $('body > table > tbody > tr > td > table > tbody').each(async (i, e) => {
      // 列車情報は最初のテーブル
      if (i === 0) {
        const trs = $(e).find('tr');
        let order = 0;
        console.log(`trs.length: ${trs.length}`);
        for (const tr of trs) {
          const tds = $(tr).find('td');
          const rowHeader = $(tds[0]).text().replace(/\r?\n/g, '');
          if (!trainCount) trainCount = tds.length - 1;
          const isStation = $(tds[0]).find('a').length >= 1;
          if (isStation) {
            console.log(
              `駅名: ${rowHeader} コード: ${$($(tds[0]).find('a')[0]).attr('href')!.split("'")[1]}`,
            );
          }
          const station = isStation
            ? await searchStation({
                code: $($(tds[0]).find('a')[0]).attr('href')!.split("'")[1],
              })
            : null;
          // たぶんnullになることはないが、おまじない
          if (isStation && !station) return [];
          for (let j = 1; j < tds.length; j++) {
            const text = $(tds[j])
              .text()
              .replace(/\r?\n/g, '')
              .replace(' ', '')
              .replace(' ', '')
              .trim();
            let index = j - 1;
            // undefinedの場合は初期化
            if (!trainDetails[index]) {
              trainDetails[index] = {
                trainInfo: {
                  shinkansen_flg: false,
                  kind: '',
                  code: '',
                  number: '',
                  drive_day: '',
                },
                stopStations: [],
              };
            }
            if (!isStation) {
              switch (rowHeader) {
                case '列車種':
                  if (text === '新幹線') {
                    trainDetails[index].trainInfo.shinkansen_flg = true;
                  } else {
                    trainDetails[index].trainInfo.shinkansen_flg = false;
                  }
                  trainDetails[index].trainInfo.kind = text;
                  break;
                case '列車名':
                  if (!text) break;
                  trainDetails[index].trainInfo.name = text;
                  break;
                case '列車番号':
                  trainDetails[index].trainInfo.number = text;
                  break;
                case '列車設備':
                  if (!text) break;
                  trainDetails[index].trainInfo.facility = text;
                  break;
                case '運転日':
                  trainDetails[index].trainInfo.drive_day = text;
                  break;
                case '備考':
                  if (!text) break;
                  trainDetails[index].trainInfo.remarks = text;
                  break;
                default:
                  // ヘッダの時刻、のりば、駅名をいじりたくなったらここを使う
                  break;
              }
            } else {
              // タイトルはcolSpan={2}だが時刻表は1列車2列
              index = Math.trunc((j - 1) / 2);
              // undefinedなら初期化しておく
              if (!trainDetails[index].stopStations) {
                trainDetails[index].stopStations = [];
              }
              if (!trainDetails[index].stopStations[order]) {
                trainDetails[index].stopStations[order] = {
                  station_id: 0,
                  passing_flag: false,
                  order: order,
                };
              }
              trainDetails[index].stopStations[order].station_id =
                station?.id ?? 0;
              if (j % 2) {
                // 奇数列目は着発時刻
                if (text === 'レ') {
                  trainDetails[index].stopStations[order].passing_flag = true;
                } else if (!text || text === '||') {
                  // 列番ひらがわりの際
                } else {
                  // 着時刻のみ/発時刻のみ/着発時刻の3パターンある
                  const tmp = text;
                  if (tmp.search('着') >= 0 && tmp.search('発') >= 0) {
                    const times = tmp
                      .replace('着', ',')
                      .replace('発', '')
                      .replace(' ', '')
                      .split(',');

                    trainDetails[index].stopStations[order].arrive_time =
                      times[0].trim();
                    trainDetails[index].stopStations[order].departure_time =
                      times[1].trim();
                  } else if (tmp.search('発') >= 0) {
                    trainDetails[index].stopStations[order].departure_time = tmp
                      .replace('発', '')
                      .trim();
                  } else {
                    trainDetails[index].stopStations[order].arrive_time = tmp
                      .replace('着', '')
                      .trim();
                  }
                }
              } else if (!(j % 2) && text) {
                // 偶数列目はのりば
                trainDetails[index].stopStations[order].platform = text;
              }
              debug_index = index;
            }
          }
          if (isStation) {
            console.log(trainDetails[debug_index].stopStations[order]);
            order++;
          }
        }
      }
    });
    // return {};
  } catch (e) {
    console.log(e);
    // return [];
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
