import { showRollResult } from "../utils";

export const useFeat = async (actor, itemId) => {
  const item = actor.items.get(itemId);
  if (!item || !item.system.rollLabel) {
    return;
  }

  if (item.system.rollMacro) {
    // roll macro
    if (item.system.rollMacro.includes(",")) {
      // assume it's a CSV string for {pack},{macro name}
      const [packName, macroName] = item.system.rollMacro.split(",");
      const pack = game.packs.get(packName);
      if (pack) {
        const content = await pack.getDocuments();
        const macro = content.find((i) => i.name === macroName);
        if (macro) {
          macro.execute();
        } else {
          console.log(`Could not find macro ${macroName} in pack ${packName}.`);
        }
      } else {
        console.log(`Pack ${packName} not found.`);
      }
    } else {
      // assume it's the name of a macro in the current world/game
      const macro = game.macros.find((m) => m.name === item.system.rollMacro);
      if (macro) {
        macro.execute();
      } else {
        console.log(`Could not find macro ${item.system.rollMacro}.`);
      }
    }
  } else if (item.system.rollFormula) {
    // roll formula
    await showRollResult(
      actor,
      item.system.rollFormula,
      actor.getRollData(),
      item.system.rollLabel,
      () => ``
    );
  }
};
