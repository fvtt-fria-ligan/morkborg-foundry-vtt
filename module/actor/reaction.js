import { showDice } from "../dice.js";
import { showRollResultCard } from "../utils.js";

/**
 * Check reaction!
 */
export async function checkReaction(actor) {
  const reactionRoll = new Roll("2d6");
  reactionRoll.evaluate({ async: false });
  await showDice(reactionRoll);
  const reactionText = game.i18n.localize(reactionKey(reactionRoll.total));
  const outcomeLine = `${actor.name} ${game.i18n.localize(
    "MB.Is"
  )} ${reactionText}`;
  const data = {
    cardTitle: game.i18n.localize("MB.Reaction"),
    rollResults: [
      {
        rollTitle: reactionRoll.formula,
        roll: reactionRoll,
        outcomeLines: [outcomeLine],
      },
    ],
  };
  await showRollResultCard(actor, data);
};

function reactionKey(total) {
  let key = "";
  if (total <= 3) {
    key = "MB.ReactionKill";
  } else if (total <= 6) {
    key = "MB.ReactionAngered";
  } else if (total <= 8) {
    key = "MB.ReactionIndifferent";
  } else if (total <= 10) {
    key = "MB.ReactionAlmostFriendly";
  } else {
    key = "MB.ReactionHelpful";
  }
  return key;
};
