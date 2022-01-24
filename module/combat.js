import { diceSound, showDice } from "./dice.js";

const INDIVIDUAL_INITIATIVE_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/chat/individual-initiative-roll-card.html";
const PARTY_INITIATIVE_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/chat/party-initiative-roll-card.html";

export const rollPartyInitiative = async () => {
  let initiativeRoll = new Roll("d6", {});
  initiativeRoll.evaluate({async: false});
  await showDice(initiativeRoll);

  let outcomeText = "";
  if (initiativeRoll.total <= 3) {
    outcomeText = game.i18n.localize('MB.InitiativeEnemiesBegin');
  } else {
    outcomeText = game.i18n.localize('MB.InitiativePlayerCharactersBegin');
  }

  const rollResult = {
    initiativeRoll,
    outcomeText,
  };
  const html = await renderTemplate(PARTY_INITIATIVE_ROLL_CARD_TEMPLATE, rollResult)
  await ChatMessage.create({
    content : html,
    sound : diceSound(),
  });

  // if a combat/encounter is happening, apply player/enemy ordering
  if (game.combats && game.combat) {
    await game.combat.setPartyInitiative(initiativeRoll.total);
  }
};

export const rollIndividualInitiative = async (actor) => {
  if (game.combats && game.combat) {
    // there is an encounter started in the Combat Tracker
    const combatant = game.combat.combatants.find (i => i.data.actorId === actor.id);
    if (combatant) {
      // the actor is part of the combat, so roll initiative
      game.combat.rollInitiative(combatant.id);
    } else {
      // the actor hasn't been added to the combat
      ui.notifications.warn(`${game.i18n.localize('MB.ActorNotInEncounter')}!`);
    }
    return;
  }

  // no encounter going on, so just show chat cards
  let initiativeRoll = new Roll("d6+@abilities.agility.value", actor.getRollData());
  initiativeRoll.evaluate({async: false});
  await showDice(initiativeRoll);

  const rollResult = {
    initiativeRoll,
  };
  const html = await renderTemplate(INDIVIDUAL_INITIATIVE_ROLL_CARD_TEMPLATE, rollResult)
  ChatMessage.create({
    content : html,
    sound : diceSound(),
    speaker : ChatMessage.getSpeaker({actor: actor}),
  });
};

export class MBCombat extends Combat {

  async setPartyInitiative(rollTotal) {
    game.combat.partyInitiative = rollTotal;
    await game.combat.resortCombatants();
  }

  async resortCombatants() {
    // TODO: this seems like a stupidly-hacky way to do this. Is there no better way?
    const updates = this.turns.map((t) => {
      return {
          _id: t.id, 
          initiative: t.data.initiative,
      }
    });
    await game.combat.resetAll();
    await this.updateEmbeddedDocuments("Combatant", updates);
  }

  isFriendlyCombatant(combatant) {
    if (combatant._token) {
      // v8 compatible
      return combatant._token.data.disposition === 1;
    } else {
      // v9+
      return combatant.token.data.disposition === 1;
    }
  }

  /**
   * Define how the array of Combatants is sorted in the displayed list of the tracker.
   * This method can be overridden by a system or module which needs to display combatants in an alternative order.
   * By default sort by initiative, falling back to name
   * @private
   */
  _sortCombatants(a, b) {
    // .combat is a getter, so verify existence of combats array
    if (game.combats && game.combat.partyInitiative) {
      const isPartyA = game.combat.isFriendlyCombatant(a);
      const isPartyB = game.combat.isFriendlyCombatant(b);
      if (isPartyA !== isPartyB) {
        // only matters if they're different
        if (game.combat.partyInitiative > 3) {
          // players begin
          return isPartyA ? -1 : 1;
        } else {
          // enemies begin
          return isPartyA ? 1 : -1;
        }
      }
    }

    // combatants are both friendly or enemy, so sort by normal initiative
    const ia = Number.isNumeric(a.initiative) ? a.initiative : -9999;
    const ib = Number.isNumeric(b.initiative) ? b.initiative : -9999;
    let ci = ib - ia;
    if ( ci !== 0 ) return ci;
    let [an, bn] = [a.token?.name || "", b.token?.name || ""];
    let cn = an.localeCompare(bn);
    if ( cn !== 0 ) return cn;
    return a.tokenId - b.tokenId;
  }
};
