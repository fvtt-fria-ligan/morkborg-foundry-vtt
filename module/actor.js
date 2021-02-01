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

  /**
   * Attack!
   */
  async attack(itemId) {
    const attackDR = await this.getFlag(CONFIG.MB.flagScope, CONFIG.MB.flags.ATTACK_DR);
    const targetArmor = await this.getFlag(CONFIG.MB.flagScope, CONFIG.MB.flags.TARGET_ARMOR);    
    const template = "systems/morkborg/templates/attack-dialog.html";
    let dialogData = {
      attackDR,
      config: CONFIG.MorkBorg,
      itemId,
      targetArmor
    };
    const html = await renderTemplate(template, dialogData);
    return new Promise(resolve => {
      new Dialog({
         title: game.i18n.localize('MB.Attack'),
         content: html,
         buttons: {
            roll: {
              icon: '<i class="fas fa-dice-d20"></i>',
              label: game.i18n.localize('MB.Roll'),
              // callback: html => resolve(_createItem(this.actor, html[0].querySelector("form")))
              callback: html => this._attackDialogCallback(html)
            },
         },
         default: "roll",
         close: () => resolve(null)
        }).render(true);
    });
  }

  /**
   * Callback from attack dialog.
   */
  async _attackDialogCallback(html) {
    const form = html[0].querySelector("form");
    const itemId = form.itemid.value;
    const attackDR = parseInt(form.attackdr.value);
    const targetArmor = form.targetarmor.value;
    if (!itemId || !attackDR) {
      // TODO: prevent form submit via required fields
      return;
    }
    await this.setFlag(CONFIG.MB.flagScope, CONFIG.MB.flags.ATTACK_DR, attackDR);
    await this.setFlag(CONFIG.MB.flagScope, CONFIG.MB.flags.TARGET_ARMOR, targetArmor);
    this._rollAttack(itemId, attackDR, targetArmor);
  }

  /**
   * Do the actual attack rolls and resolution.
   */
  async _rollAttack(itemId, attackDR, targetArmor) {
    const item = this.getOwnedItem(itemId);
    const itemRollData = item.getRollData();
    const actorRollData = this.getRollData();

    // roll 1: attack
    const isRanged = itemRollData.weaponType === 'ranged';
    // ranged weapons use agility; melee weapons use strength
    const ability = isRanged ? 'agility' : 'strength';
    let attackRoll = new Roll(`d20+@abilities.${ability}.score`, actorRollData);
    attackRoll.evaluate();
    const d20Result = attackRoll.results[0];
    const isFumble = (d20Result === 1);
    const isCrit = (d20Result === 20);

    let attackOutcome = null;
    let damageRoll = null;
    let targetArmorRoll = null;
    let takeDamage = null;
    if (attackRoll.total >= attackDR) {
      // HIT!!!
      attackOutcome = game.i18n.localize(isCrit ? 'MB.AttackCritText' : 'MB.Hit');
      // roll 2: damage
      const damageFormula = isCrit ? "@damageDie * 2" : "@damageDie";
      damageRoll = new Roll(damageFormula, itemRollData);
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
      attackOutcome = game.i18n.localize(isFumble ? 'MB.AttackFumbleText' : 'MB.Miss');
    }

    // TODO: decide key in handlebars/template?
    const weaponTypeKey = isRanged ? 'MB.WeaponTypeRanged' : 'MB.WeaponTypeMelee';
    const rollResult = {
      actor: this,
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

  /**
   * Show attack rolls/result in a chat roll card.
   */
  async _renderAttackRollCard(rollResult) {
    const html = await renderTemplate(ATTACK_ROLL_CARD_TEMPLATE, rollResult)
    ChatMessage.create({
      content : html,
      sound : CONFIG.sounds.dice,
      speaker : ChatMessage.getSpeaker({actor: this}),
    });
  }

  /**
   * Defend!
   */
  async defend(armorItemId, shieldItemId) {
    // look up any previous DR or incoming attack value
    const defendDR = await this.getFlag(CONFIG.MB.flagScope, CONFIG.MB.flags.DEFEND_DR);
    const incomingAttack = await this.getFlag(CONFIG.MB.flagScope, CONFIG.MB.flags.INCOMING_ATTACK);
    const template = "systems/morkborg/templates/defend-dialog.html";
    let dialogData = {
      armorItemId,
      defendDR,
      incomingAttack,
      shieldItemId
    };
    const html = await renderTemplate(template, dialogData);
    return new Promise(resolve => {
      new Dialog({
         title: game.i18n.localize('MB.Defend'),
         content: html,
         buttons: {
            roll: {
              icon: '<i class="fas fa-dice-d20"></i>',
              label: game.i18n.localize('MB.Roll'),
              callback: html => this._defendDialogCallback(html)
            },
         },
         default: "roll",
         close: () => resolve(null)
        }).render(true);
    });
  }

  /**
   * Callback from defend dialog.
   */
  async _defendDialogCallback(html) {
    const form = html[0].querySelector("form");
    const armorItemId = form.armoritemid.value;
    const shieldItemId = form.shielditemid.value;
    const defendDR = parseInt(form.defenddr.value);
    const incomingAttack = form.incomingattack.value;
    if (!defendDR || !incomingAttack) {
      // TODO: prevent dialog/form submission w/ required field(s)
      return;
    }
    await this.setFlag(CONFIG.MB.flagScope, CONFIG.MB.flags.DEFEND_DR, defendDR);
    await this.setFlag(CONFIG.MB.flagScope, CONFIG.MB.flags.INCOMING_ATTACK, incomingAttack);
    this._rollDefend(armorItemId, shieldItemId, defendDR, incomingAttack);
  }

  /**
   * Do the actual defend rolls and resolution.
   */
  async _rollDefend(armorItemId, shieldItemId, defendDR, incomingAttack) {
    const rollData = this.getRollData();
    const armor = this.getOwnedItem(armorItemId);
    const shield = this.getOwnedItem(shieldItemId);
    
    // roll 1: defend
    // TODO: use armor and encumberance modifiers
    let defendRoll = new Roll("d20+@abilities.agility.score", rollData);
    defendRoll.evaluate();
    const d20Result = defendRoll.results[0];
    const isFumble = (d20Result === 1);
    const isCrit = (d20Result === 20);

    let items = [];
    let damageRoll = null;
    let armorRoll = null;
    let defendOutcome = null;
    let takeDamage = null;

    if (isCrit) {
      // critical success
      defendOutcome = game.i18n.localize('MB.DefendCritText');
    } else if (defendRoll.total >= defendDR) {
      // success
      defendOutcome = game.i18n.localize('MB.Dodge');
    } else {
      // failure
      if (isFumble) {
        defendOutcome = game.i18n.localize('MB.DefendFumbleText');
      } else {
        defendOutcome = game.i18n.localize('MB.Hit');
      }

      // roll 2: incoming damage
      let damageFormula = incomingAttack;
      if (isFumble) {
        damageFormula += " * 2";
      }
      damageRoll = new Roll(damageFormula, {});
      damageRoll.evaluate();
      let damage = damageRoll.total;

      // roll 3: damage reduction from equipped armor and shield
      let damageReductionDie = "";
      if (armor) {
        damageReductionDie = CONFIG.MB.armorTierDamageReductionDie[armor.data.data.currentTier];
        items.push(armor);
      }    
      if (shield) {
        damageReductionDie += "+1";
        items.push(shield);
      }
      if (damageReductionDie) {
        armorRoll = new Roll("@die", {die: damageReductionDie});
        armorRoll.evaluate();
        damage = Math.max(damage - armorRoll.total, 0);
      }
      takeDamage = `${game.i18n.localize('MB.Take')} ${damage}`
    }

    const rollResult = {
      actor: this,
      armorRoll,
      damageRoll,      
      defendOutcome,
      defendRoll,
      items,
      takeDamage
    };
    await this._renderDefendRollCard(rollResult);
  }

  /**
   * Show attack rolls/result in a chat roll card.
   */
  async _renderDefendRollCard(rollResult) {
    const html = await renderTemplate(DEFEND_ROLL_CARD_TEMPLATE, rollResult)
    ChatMessage.create({
      content : html,
      sound : CONFIG.sounds.dice,
      speaker : ChatMessage.getSpeaker({actor: this}),
    });
  }

  /**
   * Check morale!
   */
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

  /**
   * Show morale roll/result in a chat roll card.
   */
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

  /**
   * Check reaction!
   */
  async checkReaction(sheetData) {
    const actorRollData = this.getRollData();
    const reactionRoll = new Roll("2d6", actorRollData);
    reactionRoll.evaluate();
    await this._renderReactionRollCard(reactionRoll);
  }

  /**
   * Show reaction roll/result in a chat roll card.
   */
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

