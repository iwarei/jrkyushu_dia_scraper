import { getLineCode } from "./scraper";

const index = async(): Promise<void> =>  {
  const lines = await getLineCode();
}

index();