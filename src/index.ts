import { getLineCode } from "./Service/lineService";

const index = async(): Promise<void> =>  {
  const lines = await getLineCode();
}

index();