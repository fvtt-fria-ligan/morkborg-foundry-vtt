import { addShowDicePromise, diceSound, showDice } from "./dice.js";

const ATTACK_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/attack-roll-card.html";
const DEFEND_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/defend-roll-card.html";
const GET_BETTER_ABILITY_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/get-better-ability-roll-card.html";
const GET_BETTER_DEBRIS_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/get-better-debris-roll-card.html";
const GET_BETTER_HP_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/get-better-hp-roll-card.html";
const GET_BETTER_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/get-better-roll-card.html";
const MORALE_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/morale-roll-card.html";
const OUTCOME_ONLY_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/outcome-only-roll-card.html";
const OUTCOME_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/outcome-roll-card.html";
const REACTION_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/reaction-roll-card.html";
const TEST_ABILITY_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/test-ability-roll-card.html";
const WIELD_POWER_ROLL_CARD_TEMPLATE = "systems/morkborg/templates/wield-power-roll-card.html";

/**
 * @extends {Actor}
 */
export class MBActor extends Actor {
  /** @override */
  static async create(data, options={}) {
    data.token = data.token || {};
    if (data.type === "character") {
      mergeObject(data.token, {
        vision: true,
        dimSight: 30,
        brightSight: 0,
        actorLink: true,
        disposition: 1
      }, {overwrite: false});
    }
    return super.create(data, options);
  }

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  getRollData() {
    const data = super.getRollData();
    return data;
  }

  _firstEquipped(itemType) {
    for (const item of this.data.items) {
      if (item.type === itemType && item.data.equipped) {
        return item;
      }
    }
    return undefined;
  }

  equippedArmor() {
    return this._firstEquipped("armor");
  }

  equippedShield() {
    return this._firstEquipped("shield");
  }

  normalCarryingCapacity() {
    return this.data.data.abilities.strength.value + 8;
  }

  maxCarryingCapacity() {
    return 2 * this.normalCarryingCapacity();
  }

  carryingWeight() {
    let total = 0;
    for (const item of this.data.items) {
      if (CONFIG.MB.itemEquipmentTypes.includes(item.type) && item.data.carryWeight) {
        const roundedWeight = Math.ceil(item.data.carryWeight * item.data.quantity);
        total += roundedWeight;
      }
    }
    return total;
  }

  isEncumbered() {
    return this.carryingWeight() > this.normalCarryingCapacity();
  }

  containerSpace() {
    let total = 0;
    for (const item of this.data.items) {
      if (CONFIG.MB.itemEquipmentTypes.includes(item.type) && 
          item.type !== 'container' &&
          !item.data.equipped &&
          item.data.containerSpace) {  
          const roundedSpace = Math.ceil(item.data.containerSpace * item.data.quantity);
          total += roundedSpace;
      }
    }
    return total;
  }

  containerCapacity() {
    let total = 0;
    for (const item of this.data.items) {
      if (item.type === 'container' && item.data.capacity) {
        total += item.data.capacity;
      }
    }
    return total;
  }

  async _testAbility(ability, abilityKey, drModifiers) {
    let abilityRoll = new Roll(`1d20+@abilities.${ability}.value`, this.getRollData());
    abilityRoll.evaluate();
    await showDice(abilityRoll);
    const rollResult = {
      abilityKey: abilityKey,
      abilityRoll,
      drModifiers,
    }
    const html = await renderTemplate(TEST_ABILITY_ROLL_CARD_TEMPLATE, rollResult)
    ChatMessage.create({
      content : html,
      sound : diceSound(),
      speaker : ChatMessage.getSpeaker({actor: this}),
    });
  }

  async testStrength() {
    let drModifiers = [];
    if (this.isEncumbered()) {
      drModifiers.push(`${game.i18n.localize('MB.Encumbered')}: ${game.i18n.localize('MB.DR')} +2`);
    }
    await this._testAbility("strength", "MB.AbilityStrength", drModifiers);
  }

  async testAgility() {
    let drModifiers = [];
    const armor = this.equippedArmor();
    if (armor) {
      const armorTier = CONFIG.MB.armorTiers[armor.data.tier.max];
      if (armorTier.agilityModifier) {
        drModifiers.push(`${armor.name}: ${game.i18n.localize('MB.DR')} +${armorTier.agilityModifier}`);
      }
    }
    if (this.isEncumbered()) {
      drModifiers.push(`${game.i18n.localize('MB.Encumbered')}: ${game.i18n.localize('MB.DR')} +2`);
    }
    await this._testAbility("agility", "MB.AbilityAgility", drModifiers);
  }

  async testPresence() {
    await this._testAbility("presence", "MB.AbilityPresence", null);
  }

  async testToughness() {
    await this._testAbility("toughness", "MB.AbilityToughness", null);
  }

  /**
   * Attack!
   */
  async attack(itemId) {
    let attackDR = await this.getFlag(CONFIG.MB.flagScope, CONFIG.MB.flags.ATTACK_DR);
    if (!attackDR) {
      attackDR = 12;  // default
    }
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
    // ranged weapons use presence; melee weapons use strength
    const ability = isRanged ? 'presence' : 'strength';
    let attackRoll = new Roll(`d20+@abilities.${ability}.value`, actorRollData);
    attackRoll.evaluate();
    await showDice(attackRoll);

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
      let dicePromises = [];
      addShowDicePromise(dicePromises, damageRoll);
      let damage = damageRoll.total;
      // roll 3: target damage reduction
      if (targetArmor) {
        targetArmorRoll = new Roll(targetArmor, {});
        targetArmorRoll.evaluate();
        addShowDicePromise(dicePromises, targetArmorRoll);
        damage = Math.max(damage - targetArmorRoll.total, 0);
      }
      if (dicePromises) {
        await Promise.all(dicePromises);
      }
      takeDamage = `${game.i18n.localize('MB.Take')} ${damage} ${game.i18n.localize('MB.Damage')}`
    } else {
      // MISS!!!
      attackOutcome = game.i18n.localize(isFumble ? 'MB.AttackFumbleText' : 'MB.Miss');
    }

    // TODO: decide key in handlebars/template?
    const weaponTypeKey = isRanged ? 'MB.WeaponTypeRanged' : 'MB.WeaponTypeMelee';
    const rollResult = {
      actor: this,
      attackDR,
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
      sound : diceSound(),
      speaker : ChatMessage.getSpeaker({actor: this}),
    });
  }

  /**
   * Defend!
   */
  async defend() {
    // look up any previous DR or incoming attack value
    let defendDR = await this.getFlag(CONFIG.MB.flagScope, CONFIG.MB.flags.DEFEND_DR);
    if (!defendDR) {
      defendDR = 12;  // default
    }
    let incomingAttack = await this.getFlag(CONFIG.MB.flagScope, CONFIG.MB.flags.INCOMING_ATTACK);
    if (!incomingAttack) {
      incomingAttack = "1d4";  // default
    }
    const template = "systems/morkborg/templates/defend-dialog.html";

    const armor = this.equippedArmor();
    let drModifiers = [];
    if (armor) {
      // armor defense adjustment is based on its max tier, not current
      // TODO: maxTier is getting stored as a string
      const maxTier = parseInt(armor.data.tier.max);
      const defenseModifier = CONFIG.MB.armorTiers[maxTier].defenseModifier;
      if (defenseModifier) { 
        drModifiers.push(`${armor.name}: ${game.i18n.localize('MB.DR')} +${defenseModifier}`);       
      }
    }
    if (this.isEncumbered()) {
      drModifiers.push(`${game.i18n.localize('MB.Encumbered')}: ${game.i18n.localize('MB.DR')} +2`);
    }

    let dialogData = {
      defendDR,
      drModifiers,
      incomingAttack,
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
         render: (html) => {
          html.find("input[name='defensebasedr']").on("change", this._onDefenseBaseDRChange.bind(this));
          html.find("input[name='defensebasedr']").trigger("change");
        },
         close: () => resolve(null)
        }).render(true);
    });
  }

  _onDefenseBaseDRChange(event) {
    event.preventDefault();
    const baseInput = $(event.currentTarget);
    let drModifier = 0;
    const armor = this.equippedArmor();
    if (armor) {
      // TODO: maxTier is getting stored as a string
      const maxTier = parseInt(armor.data.tier.max);
      const defenseModifier = CONFIG.MB.armorTiers[maxTier].defenseModifier;
      if (defenseModifier) { 
        drModifier += defenseModifier;
      }
    }
    if (this.isEncumbered()) {
      drModifier += 2;
    }
    const modifiedDr = parseInt(baseInput[0].value) + drModifier;
    // TODO: this is a fragile way to find the other input field
    const modifiedInput = baseInput.parent().parent().find("input[name='defensemodifieddr']");
    modifiedInput.val(modifiedDr.toString());
  }

  /**
   * Callback from defend dialog.
   */
  async _defendDialogCallback(html) {
    const form = html[0].querySelector("form");
    const baseDR = parseInt(form.defensebasedr.value);
    const modifiedDR = parseInt(form.defensemodifieddr.value);
    const incomingAttack = form.incomingattack.value;
    if (!baseDR || !modifiedDR || !incomingAttack) {
      // TODO: prevent dialog/form submission w/ required field(s)
      return;
    }
    await this.setFlag(CONFIG.MB.flagScope, CONFIG.MB.flags.DEFEND_DR, baseDR);
    await this.setFlag(CONFIG.MB.flagScope, CONFIG.MB.flags.INCOMING_ATTACK, incomingAttack);
    this._rollDefend(modifiedDR, incomingAttack);
  }

  /**
   * Do the actual defend rolls and resolution.
   */
  async _rollDefend(defendDR, incomingAttack) {
    const rollData = this.getRollData();
    const armor = this.equippedArmor();
    const shield = this.equippedShield();

    // roll 1: defend
    let defendRoll = new Roll("d20+@abilities.agility.value", rollData);
    defendRoll.evaluate();
    await showDice(defendRoll);

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
      let dicePromises = [];
      addShowDicePromise(dicePromises, damageRoll);
      let damage = damageRoll.total;

      // roll 3: damage reduction from equipped armor and shield
      let damageReductionDie = "";
      if (armor) {
        damageReductionDie = CONFIG.MB.armorTiers[armor.data.tier.value].damageReductionDie;
        items.push(armor);
      }    
      if (shield) {
        damageReductionDie += "+1";
        items.push(shield);
      }
      if (damageReductionDie) {
        armorRoll = new Roll("@die", {die: damageReductionDie});
        armorRoll.evaluate();
        addShowDicePromise(dicePromises, armorRoll);
        damage = Math.max(damage - armorRoll.total, 0);
      }
      if (dicePromises) {
        await Promise.all(dicePromises);
      }
      takeDamage = `${game.i18n.localize('MB.Take')} ${damage} ${game.i18n.localize('MB.Damage')}`
    }

    const rollResult = {
      actor: this,
      armorRoll,
      damageRoll,
      defendDR,
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
      sound : diceSound(),
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
    await showDice(moraleRoll);

    let outcomeRoll = null;
    if (moraleRoll.total > this.data.data.morale) {
      outcomeRoll = new Roll("1d6", actorRollData);
      outcomeRoll.evaluate();
      await showDice(outcomeRoll);
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
      sound : diceSound(),
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
    await showDice(reactionRoll);
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
      sound : diceSound(),
      speaker : ChatMessage.getSpeaker({actor: this}),
    });
  }

  async wieldPower() {
    if (this.data.data.powerUses.value < 1) {
      ui.notifications.warn(`${game.i18n.localize('MB.NoPowerUsesRemaining')}!`);
      return;
    }

    const wieldRoll = new Roll("d20+@abilities.presence.value", this.getRollData());
    wieldRoll.evaluate();
    await showDice(wieldRoll);

    const d20Result = wieldRoll.results[0];
    const isFumble = (d20Result === 1);
    const isCrit = (d20Result === 20);
    const wieldDR = 12;

    let wieldOutcome = null;
    let damageRoll = null;
    let takeDamage = null;
    if (wieldRoll.total >= wieldDR) {
      // SUCCESS!!!
      wieldOutcome = game.i18n.localize(isCrit ? 'MB.CriticalSuccess' : 'MB.Success');
    } else {
      // FAILURE
      wieldOutcome = game.i18n.localize(isFumble ? 'MB.WieldAPowerFumble' : 'MB.Failure');
      damageRoll = new Roll("1d2", this.getRollData());
      damageRoll.evaluate();
      await showDice(damageRoll);
      takeDamage = `${game.i18n.localize('MB.Take')} ${damageRoll.total} ${game.i18n.localize('MB.Damage')}, ${game.i18n.localize('MB.WieldAPowerDizzy')}`;
    }

    const rollResult = {
      damageRoll,
      wieldDR,
      wieldOutcome,
      wieldRoll,
      takeDamage,
    };
    const html = await renderTemplate(WIELD_POWER_ROLL_CARD_TEMPLATE, rollResult)
    ChatMessage.create({
      content : html,
      sound : diceSound(),
      speaker : ChatMessage.getSpeaker({actor: this}),
    });

    const newPowerUses = Math.max(0, this.data.data.powerUses.value - 1);
    return this.update({["data.powerUses.value"]: newPowerUses});
  }

  async useFeat(itemId) {
    const item = this.getOwnedItem(itemId);
    if (!item || !item.data.data.rollLabel || !item.data.data.rollFormula) {
      return;
    }
    await this._rollOutcome(
      item.data.data.rollFormula,
      this.getRollData(),
      item.data.data.rollLabel,
      (roll) => ``);
  }

  async _rollOutcome(dieRoll, rollData, cardTitle, outcomeTextFn) {
    let roll = new Roll(dieRoll, rollData);
    roll.evaluate();
    await showDice(roll);
    const rollResult = {
      cardTitle: cardTitle,
      outcomeText: outcomeTextFn(roll),
      roll,
    };
    const html = await renderTemplate(OUTCOME_ROLL_CARD_TEMPLATE, rollResult)
    ChatMessage.create({
      content : html,
      sound : diceSound(),
      speaker : ChatMessage.getSpeaker({actor: this}),
    });    
    return roll;
  }

  async rollOmens() {
    const classItem = this.items.filter(x => x.type === "class").pop();
    if (!classItem) {
      return;
    }
    const roll = await this._rollOutcome(
      "@omenDie",
      classItem.getRollData(),
      `${game.i18n.localize('MB.Omens')}`, 
      (roll) => ` ${game.i18n.localize('MB.Omens')}: ${Math.max(0, roll.total)}`);
    const newOmens = Math.max(0, roll.total);
    return this.update({["data.omens"]: {max: newOmens, value: newOmens}});
  }

  async rollPowersPerDay() {
    const roll = await this._rollOutcome(
      "d4+@abilities.presence.value",
      this.getRollData(),
      `${game.i18n.localize('MB.Powers')} ${game.i18n.localize('MB.PerDay')}`, 
      (roll) => ` ${game.i18n.localize('MB.PowerUsesRemaining')}: ${Math.max(0, roll.total)}`);
    const newUses = Math.max(0, roll.total);
    return this.update({["data.powerUses"]: {max: newUses, value: newUses}});
  }

  /**
   * 
   * @param {*} restLength "short" or "long"
   * @param {*} foodAndDrink "eat", "donteat", or "starve"
   * @param {*} infected true/false
   */
  async rest(restLength, foodAndDrink, infected) {
    if (restLength === "short") {
      if (foodAndDrink === "eat" && !infected) {
        await this.rollHealHitPoints("d4");
      } else {
        await this.showRestNoEffect();
      }
    } else if (restLength === "long") {
      let canRestore = true;
      if (foodAndDrink === "starve") {
        await this.rollStarvation();
        canRestore = false;
      }
      if (infected) {
        await this.rollInfection();
        canRestore = false;
      }
      if (canRestore && foodAndDrink === "eat") {
        await this.rollHealHitPoints("d6");
        await this.rollPowersPerDay();
        if (this.data.data.omens.value === 0) {
          await this.rollOmens();
        }
      } else if (canRestore && foodAndDrink === "donteat") {
        await this.showRestNoEffect();
      }
    }
  }

  async showRestNoEffect() {
    const result = {
      cardTitle: game.i18n.localize('MB.Rest'),
      outcomeText: game.i18n.localize('MB.NoEffect'),
    };
    const html = await renderTemplate(OUTCOME_ONLY_ROLL_CARD_TEMPLATE, result);
    await ChatMessage.create({
      content : html,
      sound : diceSound(),
      speaker : ChatMessage.getSpeaker({actor: this}),
    });
  }

  async rollHealHitPoints(dieRoll) {
    const roll = await this._rollOutcome(
      dieRoll,
      this.getRollData(),
      game.i18n.localize('MB.Rest'), 
      (roll) => `${game.i18n.localize('MB.Heal')} ${roll.total} ${game.i18n.localize('MB.HP')}`);
    const newHP = Math.min(this.data.data.hp.max, this.data.data.hp.value + roll.total);
    return this.update({["data.hp.value"]: newHP});
  }

  async rollStarvation() {
    const roll = await this._rollOutcome(
      "d4",
      this.getRollData(),
      game.i18n.localize('MB.Starvation'), 
      (roll) => `${game.i18n.localize('MB.Take')} ${roll.total} ${game.i18n.localize('MB.Damage')}`);
    const newHP = this.data.data.hp.value - roll.total;
    return this.update({["data.hp.value"]: newHP});
  }

  async rollInfection() {
    const roll = await this._rollOutcome(
      "d6",
      this.getRollData(),
      game.i18n.localize('MB.Infection'), 
      (roll) => `${game.i18n.localize('MB.Take')} ${roll.total} ${game.i18n.localize('MB.Damage')}`);
    const newHP = this.data.data.hp.value - roll.total;
    return this.update({["data.hp.value"]: newHP});
  }

  async getBetter() {
    const oldHp = this.data.data.hp.max;
    const newHp = this._betterHp(oldHp);
    const oldStr = this.data.data.abilities.strength.value;
    const newStr = this._betterAbility(oldStr);
    const oldAgi = this.data.data.abilities.agility.value;
    const newAgi = this._betterAbility(oldAgi);
    const oldPre = this.data.data.abilities.presence.value
    const newPre = this._betterAbility(oldPre);
    const oldTou = this.data.data.abilities.toughness.value;
    const newTou = this._betterAbility(oldTou);
    let newSilver = this.data.data.silver;

    let hpOutcome = this._abilityOutcome(game.i18n.localize('MB.HP'), oldHp, newHp);
    let strOutcome = this._abilityOutcome(game.i18n.localize('MB.AbilityStrength'), oldStr, newStr);
    let agiOutcome = this._abilityOutcome(game.i18n.localize('MB.AbilityAgility'), oldAgi, newAgi);
    let preOutcome = this._abilityOutcome(game.i18n.localize('MB.AbilityPresence'), oldPre, newPre);
    let touOutcome = this._abilityOutcome(game.i18n.localize('MB.AbilityToughness'), oldTou, newTou);

    // Left in the debris you find...
    let debrisOutcome = null;
    let scrollTableName = null;
    const debrisRoll = new Roll("1d6", this.getRollData()).evaluate();
    if (debrisRoll.total < 4) {
      debrisOutcome = "Nothing";
    } else if (debrisRoll.total === 4) {
      const silverRoll = new Roll("3d10", this.getRollData()).evaluate();
      debrisOutcome = `${silverRoll.total} silver`;
      newSilver += silverRoll.total;
    } else if (debrisRoll.total === 5) {
      debrisOutcome = "an unclean scroll";
      scrollTableName = "Unclean Scrolls";
    } else {
      debrisOutcome = "a sacred scroll";
      scrollTableName = "Sacred Scrolls";
    }

    // show a single chat message for everything
    const data = {
      agiOutcome,
      debrisOutcome,
      hpOutcome,
      preOutcome,
      strOutcome,
      touOutcome,
    };
    const html = await renderTemplate(GET_BETTER_ROLL_CARD_TEMPLATE, data);
    ChatMessage.create({
      content : html,
      sound : CONFIG.sounds.dice,  // make a single dice sound
      speaker : ChatMessage.getSpeaker({actor: this}),
    });

    if (scrollTableName) {
      // roll a scroll
      const pack = game.packs.get('morkborg.random-scrolls');
      const content = await pack.getContent();
      const table = content.find(i => i.name === scrollTableName);
      await table.draw();
    }

    // set new stats on the actor
    return this.update({
      ["data.abilities.strength.value"]: newStr,
      ["data.abilities.agility.value"]: newAgi,
      ["data.abilities.presence.value"]: newPre,
      ["data.abilities.toughness.value"]: newTou,
      ["data.hp.max"]: newHp,
      ["data.silver"]: newSilver,
    });
  }

  _betterHp(oldHp) {
    const hpRoll = new Roll("6d10", this.getRollData()).evaluate();
    if (hpRoll.total >= oldHp) {
      // success, increase HP
      const howMuchRoll = new Roll("1d6", this.getRollData()).evaluate();
      return oldHp + howMuchRoll.total;
    } else {
      // no soup for you
      return oldHp;
    }
  }

  _betterAbility(oldVal) {
    const roll = new Roll("1d6", this.getRollData()).evaluate();
    if (roll.total === 1 || roll.total < oldVal) {
      // decrease, to a minimum of -3
      return Math.max(-3, oldVal - 1);
    } else {
      // increase, to a max of +6
      return Math.min(6, oldVal + 1);
    }
  }

  _abilityOutcome(abilityName, oldVal, newVal) {
    if (newVal < oldVal) {
      return `Lose ${oldVal - newVal} ${abilityName}`;
    } else if (newVal > oldVal) {
      return `Gain ${newVal - oldVal} ${abilityName}`;
    } else {
      return `${abilityName} unchanged`;
    }
  }
}  
