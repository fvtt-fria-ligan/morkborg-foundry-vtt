import { diceSound, showDice } from "../dice.js";

/**
 * Check reaction!
 */
export const checkReaction = async (actor) => {
  const reactionRoll = new Roll("2d6");
  reactionRoll.evaluate({ async: false });
  await showDice(reactionRoll);
  await renderReactionRollCard(actor, reactionRoll);
};

/**
 * Show reaction roll/result in a chat roll card.
 */
const renderReactionRollCard = async (actor, reactionRoll) => {
  let key = "";
  if (reactionRoll.total <= 3) {
    key = "MB.ReactionKill";
  } else if (reactionRoll.total <= 6) {
    key = "MB.ReactionAngered";
  } else if (reactionRoll.total <= 8) {
    key = "MB.ReactionIndifferent";
  } else if (reactionRoll.total <= 10) {
    key = "MB.ReactionAlmostFriendly";
  } else {
    key = "MB.ReactionHelpful";
  }
  const reactionText = game.i18n.localize(key);
  const rollResult = {
    actor: this,
    reactionRoll,
    reactionText,
  };
  const html = await renderTemplate(
    "systems/morkborg/templates/chat/reaction-roll-card.hbs",
    rollResult
  );
  ChatMessage.create({
    content: html,
    sound: diceSound(),
    speaker: ChatMessage.getSpeaker({ actor }),
  });
};
