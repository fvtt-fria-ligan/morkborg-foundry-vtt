import { showDice } from "../dice.js";
import { showRollResultCard } from "../utils.js";

/**
 * Check morale!
 */
export const checkMorale = async (actor) => {
  const moraleRoll = new Roll("2d6");
  moraleRoll.evaluate({ async: false });
  await showDice(moraleRoll);
  const rollResults = [
    {
      rollTitle: moraleRoll.formula,
      roll: moraleRoll,
      outcomeLines: [],
    },
  ];
  // must have a non-zero morale to possibly fail a morale check
  if (actor.system.morale && moraleRoll.total > actor.system.morale) {
    // failed morale check
    rollResults[0].outcomeLines.push(game.i18n.localize("MB.Failure"));
    const outcomeRoll = new Roll("1d6");
    outcomeRoll.evaluate({ async: false });
    await showDice(outcomeRoll);
    const outcomeKey =
      outcomeRoll.total <= 3 ? "MB.MoraleFlees" : "MB.MoraleSurrenders";
    const outcomeLine = `${actor.name} ${game.i18n.localize(outcomeKey)}`;
    rollResults.push({
      rollTitle: outcomeRoll.formula,
      roll: outcomeRoll,
      outcomeLines: [outcomeLine],
    });
  } else {
    // succeeded morale check
    const outcomeLine = `${actor.name} ${game.i18n.localize("MB.StandsFirm")}`;
    rollResults[0].outcomeLines.push(outcomeLine);
  }
  const data = {
    cardTitle: game.i18n.localize("MB.Morale"),
    rollResults,
  };
  await showRollResultCard(actor, data);
};
