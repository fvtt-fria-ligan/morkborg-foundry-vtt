import { MB } from "../config.js";
import { drawFromTable } from "../packutils.js";

export const rollBroken = async () => {
  if (MB.brokenPack && MB.brokenTable) {
    await drawFromTable(MB.brokenPack, MB.brokenTable, null, true);
  }
};
