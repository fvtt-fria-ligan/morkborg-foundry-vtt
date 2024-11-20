import { MB } from "../config.js";
import { drawFromTable } from "../packutils.js";

export async function rollBroken() {
  if (MB.brokenPack && MB.brokenTable) {
    await drawFromTable(MB.brokenPack, MB.brokenTable, null, true);
  }
};
