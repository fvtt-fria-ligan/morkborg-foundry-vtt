import { diceSound, showDice } from "./dice.js";

const PARTY_INITIATIVE_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/chat/party-initiative-roll-card.html";

export class MBCombat extends Combat {

  async rollPartyInitiative() {
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
    ChatMessage.create({
      content : html,
      sound : diceSound(),
    });

    game.combat.partyInitiative = initiativeRoll.total;
    await game.combat.resortCombatants();
  }  

  async resortCombatants() {
    // TODO: this seems like a stupidly-hacky way to do this. Is there no better way?
    const updates = this.turns.map((t) => {
      return {
          id: t.id, 
          initiative: t.initiative,
      }
    });
    await game.combat.resetAll();
    await this.updateEmbeddedEntity("Combatant", updates);
  }

  isFriendlyCombatant(t) {
    return t.token.disposition === 1;
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
      // only matters if they're different
      if (isPartyA !== isPartyB) {
        if (game.combat.partyInitiative > 3) {
          // players begin
          return isPartyA ? -1 : 1;
        } else {
          // enemies begin
          return isPartyA ? 1 : -1;
        }
      }
    }

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

