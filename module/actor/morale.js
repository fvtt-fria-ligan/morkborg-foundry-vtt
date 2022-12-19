import { diceSound, showDice } from "../dice.js";

/**
 * Check morale!
 */
export const checkMorale = async (actor) => {
  const moraleRoll = new Roll("2d6");
  moraleRoll.evaluate({ async: false });
  await showDice(moraleRoll);

  let outcomeRoll = null;
  // must have a non-zero morale to possibly fail a morale check
  if (actor.system.morale && moraleRoll.total > actor.system.morale) {
    outcomeRoll = new Roll("1d6");
    outcomeRoll.evaluate({ async: false });
    await showDice(outcomeRoll);
  }
  await renderMoraleRollCard(actor, moraleRoll, outcomeRoll);
};

/**
 * Show morale roll/result in a chat roll card.
 */
const renderMoraleRollCard = async (actor, moraleRoll, outcomeRoll) => {
  let outcomeKey = null;
  if (outcomeRoll) {
    outcomeKey =
      outcomeRoll.total <= 3 ? "MB.MoraleFlees" : "MB.MoraleSurrenders";
  } else {
    outcomeKey = "MB.StandsFirm";
  }
  const outcomeText = game.i18n.localize(outcomeKey);
  const rollResult = {
    actor,
    outcomeRoll,
    outcomeText,
    moraleRoll,
  };
  const html = await renderTemplate(
    "systems/morkborg/templates/chat/morale-roll-card.hbs",
    rollResult
  );
  ChatMessage.create({
    content: html,
    sound: diceSound(),
    speaker: ChatMessage.getSpeaker({ actor }),
  });
};
