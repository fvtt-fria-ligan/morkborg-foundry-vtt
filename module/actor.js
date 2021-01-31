const ATTACK_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/attack-roll-card.html";
const DEFEND_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/defend-roll-card.html";
const MORALE_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/morale-roll-card.html";
const REACTION_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/reaction-roll-card.html";

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
    const template = "systems/morkborg/templates/attack-dialog.html";
    let dialogData = {
      config: CONFIG.MorkBorg,
      itemId
    };
    const html = await renderTemplate(template, dialogData);
    return new Promise(resolve => {
      new Dialog({
         title: game.i18n.localize('MB.Attack'),
         content: html,
         buttons: {
            attack: {
              icon: '<i class="fas fa-dice-d20"></i>',
              label: game.i18n.localize('MB.Attack'),
              // callback: html => resolve(_createItem(this.actor, html[0].querySelector("form")))
              callback: html => this._attackDialogCallback(html)
            },
         },
         default: "create",
         close: () => resolve(null)
        }).render(true);
    });
  }

  _attackDialogCallback(html) {
    const form = html[0].querySelector("form");
    const itemId = form.itemid.value;
    const attackDr = parseInt(form.attackdr.value);
    const targetArmor = form.targetarmor.value;
    this._rollAttack(itemId, attackDr, targetArmor);
  }

  async _rollAttack(itemId, attackDr, targetArmor) {
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

    let attackComparison = `${game.i18n.localize('MB.Versus')} ${game.i18n.localize('MB.DR')}${attackDr}`;
    let attackOutcome = null;
    let damageRoll = null;
    let targetArmorRoll = null;
    let takeDamage = null;
    if (attackRoll.total >= attackDr) {
      // HIT!!!
      attackOutcome = game.i18n.localize('MB.Hit');
      // roll 2: damage
      damageRoll = new Roll("@damageDie", itemRollData);
      damageRoll.evaluate();
      let damage = damageRoll.total;
      // roll 3: target damage reduction
      if (targetArmor) {
        targetArmorRoll = new Roll(targetArmor, {});
        targetArmorRoll.evaluate();
        damage = Math.max(damage - targetArmorRoll.total, 0);
      }
      takeDamage = `${game.i18n.localize('MB.Take')} ${damage}`
    } else {
      // MISS!!!
      attackOutcome = game.i18n.localize('MB.Miss');
    }

    // TODO: decide key in handlebars/template?
    const weaponTypeKey = isRanged ? 'MB.WeaponTypeRanged' : 'MB.WeaponTypeMelee';
    const rollResult = {
      actor: this,
      attackComparison,
      attackRoll,
      attackOutcome,
      damageRoll,      
      items: [item],
      takeDamage,
      targetArmorRoll,
      weaponTypeKey
    };
    await this._renderAttackRollCard(rollResult);
  }

  async _renderAttackRollCard(rollResult) {
    const html = await renderTemplate(ATTACK_ROLL_CARD_TEMPLATE, rollResult)
    ChatMessage.create({
      content : html,
      sound : CONFIG.sounds.dice,
      speaker : ChatMessage.getSpeaker({actor: this}),
    });
  }

  async defend(sheetData) {
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

  async checkMorale(sheetData) {
    const actorRollData = this.getRollData();
    const moraleRoll = new Roll("2d6", actorRollData);
    moraleRoll.evaluate();
    let outcomeRoll = null;
    if (moraleRoll.total > this.data.data.morale) {
      outcomeRoll = new Roll("1d6", actorRollData);
      outcomeRoll.evaluate();
    }
    await this._renderMoraleRollCard(moraleRoll, outcomeRoll);
  }

  async _renderMoraleRollCard(moraleRoll, outcomeRoll) {
    let outcomeKey = null;
    if (outcomeRoll) {
      outcomeKey = outcomeRoll.total <= 3 ? "MB.MoraleFlees" : "MB.MoraleSurrenders";
    } else {
      outcomeKey = "MB.StandsFirm";
    }
    const outcomeText = game.i18n.localize(outcomeKey);
    const rollResult = {
      actor: this,
      outcomeRoll,
      outcomeText,
      moraleRoll,      
    };
    const html = await renderTemplate(MORALE_ROLL_CARD_TEMPLATE, rollResult)
    ChatMessage.create({
      content : html,
      sound : CONFIG.sounds.dice,
      speaker : ChatMessage.getSpeaker({actor: this}),
    });
  }

  async checkReaction(sheetData) {
    const actorRollData = this.getRollData();
    const reactionRoll = new Roll("2d6", actorRollData);
    reactionRoll.evaluate();
    await this._renderReactionRollCard(reactionRoll);
  }

  async _renderReactionRollCard(reactionRoll) {
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
    let reactionText = game.i18n.localize(key);
    const rollResult = {
      actor: this,
      reactionRoll,
      reactionText,
    };
    const html = await renderTemplate(REACTION_ROLL_CARD_TEMPLATE, rollResult)
    ChatMessage.create({
      content : html,
      sound : CONFIG.sounds.dice,
      speaker : ChatMessage.getSpeaker({actor: this}),
    });
  }
}  

