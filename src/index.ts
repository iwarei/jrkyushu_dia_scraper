// import { getLineInfo } from './Service/lineService';
// import { getStationInfo } from './Service/stationService';
import { scrapeTrainInfo } from './Service/trainService';

const index = async (): Promise<void> => {
  // 路線情報取得
  // const lines = await getLineInfo();
  // 駅情報取得
  // const stations = await getStationInfo(lines);
  // 列車情報取得
  // await getTrainInfo([stations.find((e) => e.code === '28283')!]);
  await scrapeTrainInfo('00270001');
};

index();
