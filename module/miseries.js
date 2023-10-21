import { showDice } from "./dice.js";
import { playSound } from "./sounds.js";
import { showRollResultCard } from "./utils.js";

export const numMiseries = (tracker) => {
  let count = 0;
  for (let i = 1; i <= 6; i++) {
    const field = `misery${i}`;
    const misery = tracker.system[field];
    if (!(misery.psalm && misery.verse)) {
      count++;
    }
  }
  return count;
};

const playHornOfDoom = () => {
  playSound("systems/morkborg/assets/audio/horn-of-doom.ogg", true);
};

export const rollMisery = async (tracker) => {
  const miseryRoll = new Roll(tracker.system.miseryDie || "1d6");
  miseryRoll.evaluate({ async: false });
  await showDice(miseryRoll);
  const isMisery = miseryRoll.total === 1;
  const outcomeKey = isMisery ? "MB.MiseryActivated" : "MB.MiseryNotActivated";
  const outcomeText = game.i18n.localize(outcomeKey);
  const data = {
    cardTitle: game.i18n.localize("MB.MiseryCheck"),
    rollResults: [
      {
        rollTitle: miseryRoll.formula,
        roll: miseryRoll,
        outcomeLines: [outcomeText],
      },
    ],
  };
  if (isMisery) {
    const psalmRoll = new Roll("2d6");
    psalmRoll.evaluate({ async: false });
    await showDice(psalmRoll);
    const psalm = psalmRoll.terms[0].results[0].result;
    const verse = psalmRoll.terms[0].results[1].result;
    const youRolled = `Psalm ${psalm}, Verse ${verse}`;
    data.rollResults.push({
      rollTitle: " d66 ",
      roll: psalmRoll,
      outcomeLines: [youRolled],
    });

    // find the next unfilled misery
    let emptyMiseryField;
    for (let i = 1; i <= 6; i++) {
      const field = `misery${i}`;
      const misery = tracker.system[field];
      if (!(misery.psalm && misery.verse)) {
        emptyMiseryField = field;
        break;
      }
    }
    if (emptyMiseryField) {
      const misery = tracker.system[emptyMiseryField];
      misery.psalm = psalm;
      misery.verse = verse;
      const updateObj = {};
      updateObj[`data.${emptyMiseryField}`] = misery;
      await tracker.update(updateObj);
    } else {
      // seventh misery... it is the end times.
      await tracker.update({ "data.seventhMiseryActivated": true });
    }
    playHornOfDoom();
  }

  await showRollResultCard(null, data);
};
