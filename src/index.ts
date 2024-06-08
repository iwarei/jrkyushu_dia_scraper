import { getLineInfo } from './Service/lineService';

const index = async (): Promise<void> => {
  const lines = await getLineInfo();
};

index();
