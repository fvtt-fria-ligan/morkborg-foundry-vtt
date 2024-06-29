import { MB } from "../config.js";
import { diceSound, showDice } from "../dice.js";
import { drawFromTable } from "../packutils.js";
import { showRollResult } from "../utils.js";

export async function rollPowersPerDay(actor) {
  const roll = await showRollResult(
    actor,
    "d4+@abilities.presence.value",
    actor.getRollData(),
    `${game.i18n.localize("MB.Powers")} ${game.i18n.localize("MB.PerDay")}`,
    (roll) =>
      ` ${game.i18n.localize("MB.PowerUsesRemaining")}: ${Math.max(
        0,
        roll.total
      )}`,
    `1d4 + ${game.i18n.localize("MB.AbilityPresenceAbbrev")}`
  );
  const newUses = Math.max(0, roll.total);
  await actor.update({
    ["system.powerUses"]: { max: newUses, value: newUses },
  });
};

export async function wieldPower(actor) {
  if (actor.system.powerUses.value < 1) {
    ui.notifications.warn(`${game.i18n.localize("MB.NoPowerUsesRemaining")}!`);
    return;
  }

  const wieldRoll = new Roll(
    "d20+@abilities.presence.value",
    actor.getRollData()
  );
  wieldRoll.evaluate({ async: false });
  await showDice(wieldRoll);

  const d20Result = wieldRoll.terms[0].results[0].result;
  const isFumble = d20Result <= MB.wieldPowerFumbleOn;
  const isCrit = d20Result >= MB.wieldPowerCritOn;
  const wieldDR = 12;

  let wieldOutcome = null;
  let damageRoll = null;
  let takeDamage = null;
  if (isCrit || wieldRoll.total >= wieldDR) {
    // SUCCESS!!!
    wieldOutcome = game.i18n.localize(
      isCrit ? "MB.CriticalSuccess" : "MB.Success"
    );
  } else {
    // FAILURE
    wieldOutcome = game.i18n.localize(
      isFumble ? "MB.WieldAPowerFumble" : "MB.Failure"
    );
    damageRoll = new Roll("1d2");
    damageRoll.evaluate({ async: false });
    await showDice(damageRoll);
    takeDamage = `${game.i18n.localize("MB.Take")} ${
      damageRoll.total
    } ${game.i18n.localize("MB.Damage")}, ${game.i18n.localize(
      "MB.WieldAPowerDizzy"
    )}`;
  }

  const wieldFormula = `1d20 + ${game.i18n.localize(
    "MB.AbilityPresenceAbbrev"
  )}`;
  const rollTitle = `${wieldFormula} ${game.i18n.localize(
    "MB.Vs"
  )} ${game.i18n.localize("MB.DR")} ${wieldDR}`;
  const outcomeLines = [wieldOutcome];
  if (takeDamage) {
    outcomeLines.push(takeDamage);
  }
  const rollResults = [
    {
      rollTitle,
      roll: wieldRoll,
      outcomeLines: [wieldOutcome],
    },
  ];
  if (damageRoll) {
    rollResults.push({
      rollTitle: `${game.i18n.localize("MB.Damage")}: ${damageRoll.formula}`,
      roll: damageRoll,
      outcomeLines: [takeDamage],
    });
  }
  const data = {
    cardTitle: game.i18n.localize("MB.WieldAPower"),
    rollResults,
  };
  const html = await renderTemplate(
    "systems/morkborg/templates/chat/roll-result-card.hbs",
    data
  );
  ChatMessage.create({
    content: html,
    sound: diceSound(),
    speaker: ChatMessage.getSpeaker({ actor: actor }),
  });

  if (isFumble && MB.wieldPowerFumblePack && MB.wieldPowerFumbleTable) {
    // Fumbles roll on the Arcane Catastrophes table
    await drawFromTable(
      MB.wieldPowerFumblePack,
      MB.wieldPowerFumbleTable,
      null,
      true
    );
  } else if (isCrit && MB.wieldPowerCritPack && MB.wieldPowerCritTable) {
    // Criticals roll on Eldritch Elevations table, if available
    await drawFromTable(
      MB.wieldPowerCritPack,
      MB.wieldPowerCritTable,
      null,
      true
    );
  }

  const newPowerUses = Math.max(0, actor.system.powerUses.value - 1);
  await actor.update({ ["system.powerUses.value"]: newPowerUses });
};
