import { diceSound, showDice } from "./dice.js";

export const byName = (a, b) =>
  a.name > b.name ? 1 : b.name > a.name ? -1 : 0;

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

export const d20Formula = (modifier) => {
  return rollFormula("d20", modifier);
};

export const rollFormula = (roll, modifier) => {
  if (modifier < 0) {
    return `${roll}-${-modifier}`;
  } else if (modifier > 0) {
    return `${roll}+${modifier}`;
  } else {
    return roll;
  }
};

export const evalRoll = (formula) => {
  return new Roll(formula).evaluate({ async: false });
};

export const rollTotal = (formula) => {
  return new Roll(formula).evaluate({ async: false }).total;
};

export const showRollResult = async (
  actor,
  dieRoll,
  rollData,
  cardTitle,
  outcomeTextFn,
  rollFormula = null
) => {
  const roll = new Roll(dieRoll, rollData);
  roll.evaluate({ async: false });
  await showDice(roll);
  const data = {
    cardTitle,
    rollResults: [
      {
        rollTitle: rollFormula ?? roll.formula,
        roll,
        outcomeLines: [outcomeTextFn(roll)],
      },
    ],
  };
  await showRollResultCard(actor, data);
  return roll;
};

export const showRollResultCard = async (actor, data) => {
  const html = await renderTemplate(
    "systems/morkborg/templates/chat/roll-result-card.hbs",
    data
  );
  ChatMessage.create({
    content: html,
    sound: diceSound(),
    speaker: ChatMessage.getSpeaker({ actor }),
  });
};
