import { showDice } from "../dice.js";
import { showRollResultCard } from "../utils.js";

export async function rollPartyInitiative(actor) {
  const roll = new Roll("1d6");
  await roll.evaluate();
  await showDice(roll);
  const outcomeKey =
    roll.total <= 3
      ? "MB.InitiativeEnemiesBegin"
      : "MB.InitiativePlayerCharactersBegin";
  const outcomeText = game.i18n.localize(outcomeKey);
  const data = {
    cardTitle: game.i18n.localize("MB.PartyInitiative"),
    rollResults: [
      {
        rollTitle: roll.formula,
        roll,
        outcomeLines: [outcomeText],
      },
    ],
  };
  await showRollResultCard(actor, data);
  // if a combat/encounter is happening, apply player/enemy ordering
  if (game.combats && game.combat) {
    await game.combat.setPartyInitiative(roll.total);
  }
}

export async function rollIndividualInitiative(actor) {
  if (game.combats && game.combat) {
    // there is an encounter started in the Combat Tracker
    const combatant = game.combat.combatants.find(
      (i) => i.data.actorId === actor.id
    );
    if (combatant) {
      // the actor is part of the combat, so roll initiative
      game.combat.rollInitiative(combatant.id);
    } else {
      // the actor hasn't been added to the combat
      ui.notifications.warn(`${game.i18n.localize("MB.ActorNotInEncounter")}!`);
    }
    return;
  }

  // no encounter going on, so just show chat cards
  const roll = new Roll("1d6+@abilities.agility.value", actor.getRollData());
  await roll.evaluate();
  await showDice(roll);
  const displayFormula = `1d6 + ${game.i18n.localize(
    "MB.AbilityAgilityAbbrev"
  )}`;
  const data = {
    cardTitle: game.i18n.localize("MB.Initiative"),
    rollResults: [
      {
        rollTitle: displayFormula,
        roll,
        outcomeLines: [],
      },
    ],
  };
  await showRollResultCard(actor, data);
}
