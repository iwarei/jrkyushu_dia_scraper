import { getLineInfo } from './Service/lineService';
import { getStationInfo } from './Service/stationService';
import { getTrainInfo } from './Service/trainService';

const index = async (): Promise<void> => {
  // 路線情報取得
  const lines = await getLineInfo();
  // 駅情報取得
  const stations = await getStationInfo(lines);
  // 列車情報取得
  await getTrainInfo(stations);
  // 区間快速 試すのにちょうどいい
  // await scrapeTrainInfo('00270001');
  //列番平替わり
  // await scrapeTrainInfo('00269701');
  // シーサイドライナー
  // await scrapeTrainInfo('00020401');
};

index();
