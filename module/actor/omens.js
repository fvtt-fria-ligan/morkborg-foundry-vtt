import { showRollResult } from "../utils.js";

export async function rollOmens(actor) {
  const classItem = actor.items.filter((x) => x.type === "class").pop();
  if (!classItem) {
    return;
  }
  const roll = await showRollResult(
    actor,
    "@omenDie",
    classItem.getRollData(),
    `${game.i18n.localize("MB.Omens")}`,
    (roll) => ` ${game.i18n.localize("MB.Omens")}: ${Math.max(0, roll.total)}`
  );
  const newOmens = Math.max(0, roll.total);
  await actor.update({ ["system.omens"]: { max: newOmens, value: newOmens } });
};
