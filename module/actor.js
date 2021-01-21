const ATTACK_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/attack-roll-card.html";
const DEFEND_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/defend-roll-card.html";

/**
 * @extends {Actor}
 */
export class MBActor extends Actor {
  /** @override */
  prepareData() {
    super.prepareData();

    // TODO: tweak data.data, data.flags, etc
    switch(this.data.type) {
      case "character":
        break;
      case "creature":
        break;
      case "follower":
        break;
      default:
        break;
    }
  }

  /** @override */
  getRollData() {
    const data = super.getRollData();
    return data;
  }

  async attack(itemId) {
    const item = this.getOwnedItem(itemId);
    const itemRollData = item.getRollData();
    const actorRollData = this.getRollData();

    // TODO: make these multiple rolls into a single roll sheet, a la BetterRolls5e

    // roll 1: attack
    const isRanged = itemRollData.weaponType === 'ranged';
    // ranged weapons use agility; melee weapons use strength
    const ability = isRanged ? 'agility' : 'strength';
    let attackRoll = new Roll(`d20+@abilities.${ability}.score`, actorRollData);
    attackRoll.evaluate();

    // roll 2: damage
    let damageRoll = new Roll("@damageDie", itemRollData);
    damageRoll.evaluate();

    // roll 3: target damage reduction
    let targetArmorRoll = null;
    if (this.data.data.targetArmorDie) {
      targetArmorRoll = new Roll("@targetArmorDie", actorRollData);
      targetArmorRoll.evaluate();
    }

    // TODO: decide key in handlebars/template?
    const weaponTypeKey = isRanged ? 'MB.WeaponTypeRanged' : 'MB.WeaponTypeMelee';
    await this._renderAttackRollCard([item], weaponTypeKey, attackRoll, damageRoll, targetArmorRoll);
  }

  async _renderAttackRollCard(items, weaponTypeKey, attackRoll, damageRoll, targetArmorRoll) {
    const rollResult = {
      actor: this,
      attackRoll,
      // config: CONFIG.MorkBorg
      damageRoll,      
      items,
      targetArmorRoll,
      weaponTypeKey
    };
    const html = await renderTemplate(ATTACK_ROLL_CARD_TEMPLATE, rollResult)
    ChatMessage.create({
      content : html,
      sound : CONFIG.sounds.dice,
      speaker : ChatMessage.getSpeaker({actor: this}),
    });
  }

  async defend(sheetData) {
    console.log(sheetData.data.equippedArmor);

    let rollData = this.getRollData();
    if (!rollData.incomingAttackDamageDie) {
      return;
    }

    // roll 1: defend
    // TODO: use armor and encumberance modifiers
    let defenseRoll = new Roll("d20+@abilities.agility.score", rollData);
    defenseRoll.evaluate();

    // roll 2: incoming damage
    let damageRoll = new Roll("@incomingAttackDamageDie", rollData);
    damageRoll.evaluate();

    // roll 3: damage reduction from equipped armor and shield
    let damageReductionDie = "";
    let armorRoll = null;
    let items = [];
    // grab equipped armor/shield, set in getData()
    if (sheetData.data.equippedArmor) {
      damageReductionDie = sheetData.data.equippedArmor.data.damageReductionDie;
      items.push(sheetData.data.equippedArmor);
    }
    if (sheetData.data.equippedShield) {
      damageReductionDie += "+1";
      items.push(sheetData.data.equippedShield);
    }
    if (damageReductionDie) {
      armorRoll = new Roll("@die", {die: damageReductionDie});
      armorRoll.evaluate();
    }

    await this._renderDefendRollCard(items, defenseRoll, damageRoll, armorRoll);
  }

  async _renderDefendRollCard(items, defenseRoll, damageRoll, armorRoll) {
    const rollResult = {
      actor: this,
      defenseRoll,
      damageRoll,      
      items,
      armorRoll,
    };
    const html = await renderTemplate(DEFEND_ROLL_CARD_TEMPLATE, rollResult)
    ChatMessage.create({
      content : html,
      sound : CONFIG.sounds.dice,
      speaker : ChatMessage.getSpeaker({actor: this}),
    });
  }

}  

