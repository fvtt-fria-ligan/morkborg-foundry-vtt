import { showDice } from "../dice.js";
import { showRollResultCard } from "../utils.js";

export const rollBroken = async (actor) => {
  const brokenRoll = new Roll("1d4").evaluate({ async: false });
  await showDice(brokenRoll);

  let outcomeLines = [];
  if (brokenRoll.total === 1) {
    const unconsciousRoll = new Roll("1d4").evaluate({ async: false });
    const roundsWord = game.i18n.localize(
      unconsciousRoll.total > 1 ? "MB.Rounds" : "MB.Round"
    );
    const hpRoll = new Roll("1d4").evaluate({ async: false });
    outcomeLines = [
      game.i18n.format("MB.BrokenFallUnconscious", {
        rounds: unconsciousRoll.total,
        roundsWord,
        hp: hpRoll.total,
      }),
    ];
  } else if (brokenRoll.total === 2) {
    const limbRoll = new Roll("1d6").evaluate({ async: false });
    const actRoll = new Roll("1d4").evaluate({ async: false });
    const hpRoll = new Roll("1d4").evaluate({ async: false });
    const roundsWord = game.i18n.localize(
      actRoll.total > 1 ? "MB.Rounds" : "MB.Round"
    );
    if (limbRoll.total <= 5) {
      outcomeLines = [
        game.i18n.format("MB.BrokenSeveredLimb", {
          rounds: actRoll.total,
          roundsWord,
          hp: hpRoll.total,
        }),
      ];
    } else {
      outcomeLines = [
        game.i18n.format("MB.BrokenLostEye", {
          rounds: actRoll.total,
          roundsWord,
          hp: hpRoll.total,
        }),
      ];
    }
  } else if (brokenRoll.total === 3) {
    const hemorrhageRoll = new Roll("1d2").evaluate({ async: false });
    const hoursWord = game.i18n.localize(
      hemorrhageRoll.total > 1 ? "MB.Hours" : "MB.Hour"
    );
    const lastHour =
      hemorrhageRoll.total == 2
        ? game.i18n.localize("MB.BrokenHemorrhageLastHour")
        : "";
    outcomeLines = [
      game.i18n.format("MB.BrokenHemorrhage", {
        hours: hemorrhageRoll.total,
        hoursWord,
        lastHour,
      }),
    ];
  } else {
    outcomeLines = [game.i18n.localize("MB.BrokenYouAreDead")];
  }

  const data = {
    cardTitle: game.i18n.localize("MB.Broken"),
    rollResults: [
      {
        rollTitle: brokenRoll.formula,
        roll: brokenRoll,
        outcomeLines,
      },
    ],
  };
  await showRollResultCard(actor, data);
};
