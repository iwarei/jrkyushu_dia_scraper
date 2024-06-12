import { getLineInfo } from './Service/lineService';
import { getStationInfo } from './Service/stationService';

const index = async (): Promise<void> => {
  // 路線情報取得
  const lines = await getLineInfo();
  // 駅情報取得
  const stations = await getStationInfo(lines);
};

index();
