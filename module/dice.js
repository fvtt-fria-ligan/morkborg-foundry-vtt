/**
 * Add a show-dice promise to the given array if Dice So Nice is available.
 */
export const addShowDicePromise = (promises, roll) => {
  if (game.dice3d) {
    // we pass synchronize=true so DSN dice appear on all players' screens
    promises.push(game.dice3d.showForRoll(roll, game.user, true, null, false));
  }
};

/**
 * Show roll in Dice So Nice if it's available.
 */
export const showDice = async (roll) => {
  if (game.dice3d) {
    // we pass synchronize=true so DSN dice appear on all players' screens
    await game.dice3d.showForRoll(roll, game.user, true, null, false);
  }
};

/**
 * Dice sound to use for ChatMessage.
 * False if Dice So Nice is available.
 */
export const diceSound = () => {
  if (game.dice3d) {
    // let Dice So Nice do it
    return null;
  } else {
    return CONFIG.sounds.dice;
  }
};
