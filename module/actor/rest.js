import { rollOmens } from "./omens.js";
import { rollPowersPerDay } from "./powers.js";
import { diceSound } from "../dice.js";
import { showRollResult } from "../utils.js";

/**
 * @param {*} restLength "short" or "long"
 * @param {*} foodAndDrink "eat", "donteat", or "starve"
 * @param {*} infected true/false
 */
export async function rest(actor, restLength, foodAndDrink, infected) {
  if (restLength === "short") {
    if (foodAndDrink === "eat" && !infected) {
      await rollHealHitPoints(actor, "d4");
    } else {
      await showRestNoEffect();
    }
  } else if (restLength === "long") {
    let canRestore = true;
    if (foodAndDrink === "starve") {
      await rollStarvation(actor);
      canRestore = false;
    }
    if (infected) {
      await rollInfection(actor);
      canRestore = false;
    }
    if (canRestore && foodAndDrink === "eat") {
      await rollHealHitPoints(actor, "d6");
      await rollPowersPerDay(actor);
      if (actor.system.omens.value === 0) {
        await rollOmens(actor);
      }
    } else if (canRestore && foodAndDrink === "donteat") {
      await showRestNoEffect(actor);
    }
  }
};

async function showRestNoEffect(actor) {
  const result = {
    cardTitle: game.i18n.localize("MB.Rest"),
    outcomeText: game.i18n.localize("MB.NoEffect"),
  };
  const html = await renderTemplate(
    "systems/crysborg/templates/chat/outcome-only-roll-card.hbs",
    result
  );
  await ChatMessage.create({
    content: html,
    sound: diceSound(),
    speaker: ChatMessage.getSpeaker({ actor }),
  });
};

async function rollHealHitPoints(actor, dieRoll) {
  const roll = await showRollResult(
    actor,
    dieRoll,
    actor.getRollData(),
    game.i18n.localize("MB.Rest"),
    (roll) =>
      `${game.i18n.localize("MB.Heal")} ${roll.total} ${game.i18n.localize(
        "MB.HP"
      )}`
  );
  const newHP = Math.min(
    actor.system.hp.max,
    actor.system.hp.value + roll.total
  );
  await actor.update({ ["system.hp.value"]: newHP });
};

async function rollStarvation(actor) {
  const roll = await showRollResult(
    actor,
    "d4",
    actor.getRollData(),
    game.i18n.localize("MB.Starvation"),
    (roll) =>
      `${game.i18n.localize("MB.Take")} ${roll.total} ${game.i18n.localize(
        "MB.Damage"
      )}`
  );
  const newHP = actor.system.hp.value - roll.total;
  await actor.update({ ["system.hp.value"]: newHP });
};

async function rollInfection(actor) {
  const roll = await showRollResult(
    actor,
    "d6",
    actor.getRollData(),
    game.i18n.localize("MB.Infection"),
    (roll) =>
      `${game.i18n.localize("MB.Take")} ${roll.total} ${game.i18n.localize(
        "MB.Damage"
      )}`
  );
  const newHP = actor.system.hp.value - roll.total;
  await actor.update({ ["system.hp.value"]: newHP });
};
