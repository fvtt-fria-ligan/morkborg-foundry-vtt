import { showDice } from "./dice.js";
import { playSound } from "./sounds.js";
import { showRollResultCard } from "./utils.js";

export function numMiseries(tracker) {
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

function playHornOfDoom() {
  playSound("systems/morkborg/assets/audio/horn-of-doom.ogg", true);
};

function uniquePsalmRoll(tracker) {
  let psalmRoll;
  keepRolling: for (;;) {
    psalmRoll = new Roll("d6*10+d6");
    psalmRoll.evaluate({ async: false });
    const psalm = Math.floor(psalmRoll.total / 10);
    const verse = psalmRoll.total - psalm * 10;
    // check if we've already rolled this misery
    for (let i = 1; i <= 6; i++) {
      const field = `misery${i}`;
      const misery = tracker.system[field];
      if (misery.psalm == psalm && misery.verse == verse) {
        // already rolled it, so roll again
        continue keepRolling;
      }
    }
    break keepRolling;
  }
  return psalmRoll;
};

export async function rollMisery(tracker) {
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
      const psalmRoll = uniquePsalmRoll(tracker);
      await showDice(psalmRoll);
      const psalm = Math.floor(psalmRoll.total / 10);
      const verse = psalmRoll.total - psalm * 10;
      const youRolled = `${game.i18n.localize(
        "MB.Psalm"
      )} ${psalm}, ${game.i18n.localize("MB.Verse")} ${verse}`;
      data.rollResults.push({
        rollTitle: " d66 ",
        roll: psalmRoll,
        outcomeLines: [youRolled],
      });
      const misery = tracker.system[emptyMiseryField];
      misery.psalm = psalm;
      misery.verse = verse;
      const updateObj = {};
      updateObj[`data.${emptyMiseryField}`] = misery;
      await tracker.update(updateObj);
    } else {
      // seventh misery... it is the end times.
      data.rollResults.push({
        outcomeLines: [game.i18n.localize("MB.SeventhMiseryWillAlwaysBe")],
      });
      await tracker.update({ "data.seventhMiseryActivated": true });
    }
    playHornOfDoom();
  }

  await showRollResultCard(null, data);
};
