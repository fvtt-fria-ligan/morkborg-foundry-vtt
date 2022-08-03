import { addShowDicePromise, diceSound, showDice } from "../dice.js";
import ScvmDialog from "../scvm/scvm-dialog.js";
import { trackAmmo, trackCarryingCapacity } from "../settings.js";

const ATTACK_DIALOG_TEMPLATE =
  "systems/morkborg/templates/dialog/attack-dialog.html";
const ATTACK_ROLL_CARD_TEMPLATE =
  "systems/morkborg/templates/chat/attack-roll-card.html";
const BROKEN_ROLL_CARD_TEMPLATE =
  "systems/morkborg/templates/chat/broken-roll-card.html";
const DEFEND_DIALOG_TEMPLATE =
  "systems/morkborg/templates/dialog/defend-dialog.html";
const DEFEND_ROLL_CARD_TEMPLATE =
  "systems/morkborg/templates/chat/defend-roll-card.html";
const GET_BETTER_ROLL_CARD_TEMPLATE =
  "systems/morkborg/templates/chat/get-better-roll-card.html";
const MORALE_ROLL_CARD_TEMPLATE =
  "systems/morkborg/templates/chat/morale-roll-card.html";
const OUTCOME_ONLY_ROLL_CARD_TEMPLATE =
  "systems/morkborg/templates/chat/outcome-only-roll-card.html";
const OUTCOME_ROLL_CARD_TEMPLATE =
  "systems/morkborg/templates/chat/outcome-roll-card.html";
const REACTION_ROLL_CARD_TEMPLATE =
  "systems/morkborg/templates/chat/reaction-roll-card.html";
const TEST_ABILITY_ROLL_CARD_TEMPLATE =
  "systems/morkborg/templates/chat/test-ability-roll-card.html";
const WIELD_POWER_ROLL_CARD_TEMPLATE =
  "systems/morkborg/templates/chat/wield-power-roll-card.html";

/**
 * @extends {Actor}
 */
export class MBActor extends Actor {
  /** @override */
  static async create(data, options = {}) {
    data.token = data.token || {};
    let defaults = {};
    if (data.type === "character") {
      defaults = {
        actorLink: true,
        disposition: 1,
        vision: true,
      };
    } else if (data.type === "container") {
      defaults = {
        actorLink: false,
        disposition: 0,
        vision: false,
      };
    } else if (data.type === "creature") {
      defaults = {
        actorLink: false,
        disposition: -1,
        vision: false,
      };
    } else if (data.type === "follower") {
      defaults = {
        actorLink: true,
        disposition: 1,
        vision: true,
      };
    }
    mergeObject(data.token, defaults, { overwrite: false });
    return super.create(data, options);
  }

  /** @override */
  _onCreate(data, options, userId) {
    if (data.type === "character") {
      // give Characters a default class
      this._addDefaultClass();
    }
    super._onCreate(data, options, userId);
  }

  async _addDefaultClass() {
    if (game.packs) {
      const hasAClass =
        this.items.filter((i) => i.data.type === "class").length > 0;
      if (!hasAClass) {
        const pack = game.packs.get("morkborg.class-classless-adventurer");
        if (!pack) {
          console.error(
            "Could not find compendium morkborg.class-classless-adventurer"
          );
          return;
        }
        const index = await pack.getIndex();
        const entry = index.find((e) => e.name === "Adventurer");
        if (!entry) {
          console.error("Could not find Adventurer class in compendium.");
          return;
        }
        const entity = await pack.getDocument(entry._id);
        if (!entity) {
          console.error("Could not get document for Adventurer class.");
          return;
        }
        await this.createEmbeddedDocuments("Item", [duplicate(entity.data)]);
      }
    }
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();

    this.items.forEach((item) => item.prepareActorItemDerivedData(this));

    if (this.type === "character") {
      this.system.carryingWeight = this.carryingWeight();
      this.system.carryingCapacity = this.normalCarryingCapacity();
      this.system.encumbered = this.isEncumbered();
    }

    if (this.type === "container") {
      this.system.containerSpace = this.containerSpace();
    }
  }

  /** @override */
  _onCreateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
    if (documents[0].data.type === CONFIG.MB.itemTypes.class) {
      this._deleteEarlierItems(CONFIG.MB.itemTypes.class);
    }
    super._onCreateEmbeddedDocuments(
      embeddedName,
      documents,
      result,
      options,
      userId
    );
  }

  _onDeleteEmbeddedDocuments(embeddedName, documents, result, options, userId) {
    for (const document of documents) {
      if (document.isContainer) {
        this.deleteEmbeddedDocuments("Item", document.items);
      }
      if (document.hasContainer) {
        document.container.removeItem(document.id);
      }
    }

    super._onDeleteEmbeddedDocuments(
      embeddedName,
      documents,
      result,
      options,
      userId
    );
  }

  async _deleteEarlierItems(itemType) {
    const itemsOfType = this.items.filter((i) => i.data.type === itemType);
    itemsOfType.pop(); // don't delete the last one
    const deletions = itemsOfType.map((i) => i.id);
    // not awaiting this async call, just fire it off
    this.deleteEmbeddedDocuments("Item", deletions);
  }

  /** @override */
  getRollData() {
    const data = super.getRollData();
    return data;
  }

  _firstEquipped(itemType) {
    for (const item of this.items) {
      if (item.type === itemType && item.system.equipped) {
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

  async equipItem(item) {
    if (
      [CONFIG.MB.itemTypes.armor, CONFIG.MB.itemTypes.shield].includes(
        item.type
      )
    ) {
      for (const otherItem of this.items) {
        if (otherItem.type === item.type) {
          await otherItem.unequip();
        }
      }
    }
    await item.equip();
  }

  async unequipItem(item) {
    await item.unequip();
  }

  normalCarryingCapacity() {
    return this.system.abilities.strength.value + 8;
  }

  maxCarryingCapacity() {
    return 2 * this.normalCarryingCapacity();
  }

  carryingWeight() {
    return this.items
      .filter((item) => item.isEquipment && item.carried && !item.hasContainer)
      .reduce((weight, item) => weight + item.totalCarryWeight, 0);
  }

  isEncumbered() {
    if (!trackCarryingCapacity()) {
      return false;
    }
    return this.carryingWeight() > this.normalCarryingCapacity();
  }

  containerSpace() {
    return this.items
      .filter((item) => item.isEquipment && !item.hasContainer)
      .reduce((containerSpace, item) => containerSpace + item.totalSpace, 0);
  }

  async _testAbility(ability, abilityKey, abilityAbbrevKey, drModifiers) {
    const abilityRoll = new Roll(
      `1d20+@abilities.${ability}.value`,
      this.getRollData()
    );
    abilityRoll.evaluate({ async: false });
    await showDice(abilityRoll);
    const rollResult = {
      abilityKey,
      abilityRoll,
      displayFormula: `1d20 + ${game.i18n.localize(abilityAbbrevKey)}`,
      drModifiers,
    };
    const html = await renderTemplate(
      TEST_ABILITY_ROLL_CARD_TEMPLATE,
      rollResult
    );
    ChatMessage.create({
      content: html,
      sound: diceSound(),
      speaker: ChatMessage.getSpeaker({ actor: this }),
    });
  }

  async testStrength() {
    const drModifiers = [];
    if (this.isEncumbered()) {
      drModifiers.push(
        `${game.i18n.localize("MB.Encumbered")}: ${game.i18n.localize(
          "MB.DR"
        )} +2`
      );
    }
    await this._testAbility(
      "strength",
      "MB.AbilityStrength",
      "MB.AbilityStrengthAbbrev",
      drModifiers
    );
  }

  async testAgility() {
    const drModifiers = [];
    const armor = this.equippedArmor();
    if (armor) {
      const armorTier = CONFIG.MB.armorTiers[armor.system.tier.max];
      if (armorTier.agilityModifier) {
        drModifiers.push(
          `${armor.name}: ${game.i18n.localize("MB.DR")} +${
            armorTier.agilityModifier
          }`
        );
      }
    }
    if (this.isEncumbered()) {
      drModifiers.push(
        `${game.i18n.localize("MB.Encumbered")}: ${game.i18n.localize(
          "MB.DR"
        )} +2`
      );
    }
    await this._testAbility(
      "agility",
      "MB.AbilityAgility",
      "MB.AbilityAgilityAbbrev",
      drModifiers
    );
  }

  async testPresence() {
    await this._testAbility(
      "presence",
      "MB.AbilityPresence",
      "MB.AbilityPresenceAbbrev",
      null
    );
  }

  async testToughness() {
    await this._testAbility(
      "toughness",
      "MB.AbilityToughness",
      "MB.AbilityToughnessAbbrev",
      null
    );
  }

  /**
   * Attack!
   */
  async attack(itemId) {
    let attackDR = await this.getFlag(
      CONFIG.MB.flagScope,
      CONFIG.MB.flags.ATTACK_DR
    );
    if (!attackDR) {
      attackDR = 12; // default
    }
    const targetArmor = await this.getFlag(
      CONFIG.MB.flagScope,
      CONFIG.MB.flags.TARGET_ARMOR
    );
    const dialogData = {
      attackDR,
      config: CONFIG.MorkBorg,
      itemId,
      targetArmor,
    };
    const html = await renderTemplate(ATTACK_DIALOG_TEMPLATE, dialogData);
    return new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("MB.Attack"),
        content: html,
        buttons: {
          roll: {
            icon: '<i class="fas fa-dice-d20"></i>',
            label: game.i18n.localize("MB.Roll"),
            // callback: html => resolve(_createItem(this.actor, html[0].querySelector("form")))
            callback: (html) => this._attackDialogCallback(html),
          },
        },
        default: "roll",
        close: () => resolve(null),
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
    await this.setFlag(
      CONFIG.MB.flagScope,
      CONFIG.MB.flags.ATTACK_DR,
      attackDR
    );
    await this.setFlag(
      CONFIG.MB.flagScope,
      CONFIG.MB.flags.TARGET_ARMOR,
      targetArmor
    );
    this._rollAttack(itemId, attackDR, targetArmor);
  }

  /**
   * Do the actual attack rolls and resolution.
   */
  async _rollAttack(itemId, attackDR, targetArmor) {
    const item = this.items.get(itemId);
    const itemRollData = item.getRollData();
    const actorRollData = this.getRollData();

    // roll 1: attack
    const isRanged = itemRollData.weaponType === "ranged";
    // ranged weapons use presence; melee weapons use strength
    const ability = isRanged ? "presence" : "strength";
    const attackRoll = new Roll(
      `d20+@abilities.${ability}.value`,
      actorRollData
    );
    attackRoll.evaluate({ async: false });
    await showDice(attackRoll);

    const d20Result = attackRoll.terms[0].results[0].result;
    const fumbleTarget = itemRollData.fumbleOn ?? 1;
    const critTarget = itemRollData.critOn ?? 20;
    const isFumble = d20Result <= fumbleTarget;
    const isCrit = d20Result >= critTarget;
    // nat 1 is always a miss, nat 20 is always a hit, otherwise check vs DR
    const isHit =
      attackRoll.total !== 1 &&
      (attackRoll.total === 20 || attackRoll.total >= attackDR);

    let attackOutcome = null;
    let damageRoll = null;
    let targetArmorRoll = null;
    let takeDamage = null;
    if (isHit) {
      // HIT!!!
      attackOutcome = game.i18n.localize(
        isCrit ? "MB.AttackCritText" : "MB.Hit"
      );
      // roll 2: damage.
      // Use parentheses for critical 2x in case damage die something like 1d6+1
      const damageFormula = isCrit ? "(@damageDie) * 2" : "@damageDie";
      damageRoll = new Roll(damageFormula, itemRollData);
      damageRoll.evaluate({ async: false });
      const dicePromises = [];
      addShowDicePromise(dicePromises, damageRoll);
      let damage = damageRoll.total;
      // roll 3: target damage reduction
      if (targetArmor) {
        targetArmorRoll = new Roll(targetArmor, {});
        targetArmorRoll.evaluate({ async: false });
        addShowDicePromise(dicePromises, targetArmorRoll);
        damage = Math.max(damage - targetArmorRoll.total, 0);
      }
      if (dicePromises) {
        await Promise.all(dicePromises);
      }
      takeDamage = `${game.i18n.localize(
        "MB.Inflict"
      )} ${damage} ${game.i18n.localize("MB.Damage")}`;
    } else {
      // MISS!!!
      attackOutcome = game.i18n.localize(
        isFumble ? "MB.AttackFumbleText" : "MB.Miss"
      );
    }

    // TODO: decide keys in handlebars/template?
    const abilityAbbrevKey = isRanged
      ? "MB.AbilityPresenceAbbrev"
      : "MB.AbilityStrengthAbbrev";
    const weaponTypeKey = isRanged
      ? "MB.WeaponTypeRanged"
      : "MB.WeaponTypeMelee";
    const rollResult = {
      actor: this,
      attackDR,
      attackFormula: `1d20 + ${game.i18n.localize(abilityAbbrevKey)}`,
      attackRoll,
      attackOutcome,
      damageRoll,
      items: [item],
      takeDamage,
      targetArmorRoll,
      weaponTypeKey,
    };
    await this._decrementWeaponAmmo(item);
    await this._renderAttackRollCard(rollResult);
  }

  async _decrementWeaponAmmo(weapon) {
    if (weapon.system.usesAmmo && weapon.system.ammoId && trackAmmo()) {
      const ammo = this.items.get(weapon.system.ammoId);
      if (ammo) {
        const attr = "data.quantity";
        const currQuantity = getProperty(ammo.data, attr);
        if (currQuantity > 1) {
          // decrement quantity by 1
          await ammo.update({ [attr]: currQuantity - 1 });
        } else {
          // quantity is now zero, so delete ammo item
          await this.deleteEmbeddedDocuments("Item", [ammo.id]);
        }
      }
    }
  }

  /**
   * Show attack rolls/result in a chat roll card.
   */
  async _renderAttackRollCard(rollResult) {
    const html = await renderTemplate(ATTACK_ROLL_CARD_TEMPLATE, rollResult);
    ChatMessage.create({
      content: html,
      sound: diceSound(),
      speaker: ChatMessage.getSpeaker({ actor: this }),
    });
  }

  /**
   * Defend!
   */
  async defend() {
    // look up any previous DR or incoming attack value
    let defendDR = await this.getFlag(
      CONFIG.MB.flagScope,
      CONFIG.MB.flags.DEFEND_DR
    );
    if (!defendDR) {
      defendDR = 12; // default
    }
    let incomingAttack = await this.getFlag(
      CONFIG.MB.flagScope,
      CONFIG.MB.flags.INCOMING_ATTACK
    );
    if (!incomingAttack) {
      incomingAttack = "1d4"; // default
    }

    const armor = this.equippedArmor();
    const drModifiers = [];
    if (armor) {
      // armor defense adjustment is based on its max tier, not current
      // TODO: maxTier is getting stored as a string
      const maxTier = parseInt(armor.system.tier.max);
      const defenseModifier = CONFIG.MB.armorTiers[maxTier].defenseModifier;
      if (defenseModifier) {
        drModifiers.push(
          `${armor.name}: ${game.i18n.localize("MB.DR")} +${defenseModifier}`
        );
      }
    }
    if (this.isEncumbered()) {
      drModifiers.push(
        `${game.i18n.localize("MB.Encumbered")}: ${game.i18n.localize(
          "MB.DR"
        )} +2`
      );
    }

    const dialogData = {
      defendDR,
      drModifiers,
      incomingAttack,
    };
    const html = await renderTemplate(DEFEND_DIALOG_TEMPLATE, dialogData);

    return new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("MB.Defend"),
        content: html,
        buttons: {
          roll: {
            icon: '<i class="fas fa-dice-d20"></i>',
            label: game.i18n.localize("MB.Roll"),
            callback: (html) => this._defendDialogCallback(html),
          },
        },
        default: "roll",
        render: (html) => {
          html
            .find("input[name='defensebasedr']")
            .on("change", this._onDefenseBaseDRChange.bind(this));
          html.find("input[name='defensebasedr']").trigger("change");
        },
        close: () => resolve(null),
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
      const maxTier = parseInt(armor.system.tier.max);
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
    const modifiedInput = baseInput
      .parent()
      .parent()
      .find("input[name='defensemodifieddr']");
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
    await this.setFlag(
      CONFIG.MB.flagScope,
      CONFIG.MB.flags.INCOMING_ATTACK,
      incomingAttack
    );
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
    const defendRoll = new Roll("d20+@abilities.agility.value", rollData);
    defendRoll.evaluate({ async: false });
    await showDice(defendRoll);

    const d20Result = defendRoll.terms[0].results[0].result;
    const isFumble = d20Result === 1;
    const isCrit = d20Result === 20;

    const items = [];
    let damageRoll = null;
    let armorRoll = null;
    let defendOutcome = null;
    let takeDamage = null;

    if (isCrit) {
      // critical success
      defendOutcome = game.i18n.localize("MB.DefendCritText");
    } else if (defendRoll.total >= defendDR) {
      // success
      defendOutcome = game.i18n.localize("MB.Dodge");
    } else {
      // failure
      if (isFumble) {
        defendOutcome = game.i18n.localize("MB.DefendFumbleText");
      } else {
        defendOutcome = game.i18n.localize("MB.YouAreHit");
      }

      // roll 2: incoming damage
      let damageFormula = incomingAttack;
      if (isFumble) {
        damageFormula += " * 2";
      }
      damageRoll = new Roll(damageFormula, {});
      damageRoll.evaluate({ async: false });
      const dicePromises = [];
      addShowDicePromise(dicePromises, damageRoll);
      let damage = damageRoll.total;

      // roll 3: damage reduction from equipped armor and shield
      let damageReductionDie = "";
      if (armor) {
        damageReductionDie =
          CONFIG.MB.armorTiers[armor.system.tier.value].damageReductionDie;
        items.push(armor);
      }
      if (shield) {
        damageReductionDie += "+1";
        items.push(shield);
      }
      if (damageReductionDie) {
        armorRoll = new Roll("@die", { die: damageReductionDie });
        armorRoll.evaluate({ async: false });
        addShowDicePromise(dicePromises, armorRoll);
        damage = Math.max(damage - armorRoll.total, 0);
      }
      if (dicePromises) {
        await Promise.all(dicePromises);
      }
      takeDamage = `${game.i18n.localize(
        "MB.Take"
      )} ${damage} ${game.i18n.localize("MB.Damage")}`;
    }

    const rollResult = {
      actor: this,
      armorRoll,
      damageRoll,
      defendDR,
      defendFormula: `1d20 + ${game.i18n.localize("MB.AbilityAgilityAbbrev")}`,
      defendOutcome,
      defendRoll,
      items,
      takeDamage,
    };
    await this._renderDefendRollCard(rollResult);
  }

  /**
   * Show attack rolls/result in a chat roll card.
   */
  async _renderDefendRollCard(rollResult) {
    const html = await renderTemplate(DEFEND_ROLL_CARD_TEMPLATE, rollResult);
    ChatMessage.create({
      content: html,
      sound: diceSound(),
      speaker: ChatMessage.getSpeaker({ actor: this }),
    });
  }

  /**
   * Check morale!
   */
  async checkMorale() {
    const actorRollData = this.getRollData();
    const moraleRoll = new Roll("2d6", actorRollData);
    moraleRoll.evaluate({ async: false });
    await showDice(moraleRoll);

    let outcomeRoll = null;
    // must have a non-zero morale to possibly fail a morale check
    if (this.system.morale && moraleRoll.total > this.system.morale) {
      outcomeRoll = new Roll("1d6", actorRollData);
      outcomeRoll.evaluate({ async: false });
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
      outcomeKey =
        outcomeRoll.total <= 3 ? "MB.MoraleFlees" : "MB.MoraleSurrenders";
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
    const html = await renderTemplate(MORALE_ROLL_CARD_TEMPLATE, rollResult);
    ChatMessage.create({
      content: html,
      sound: diceSound(),
      speaker: ChatMessage.getSpeaker({ actor: this }),
    });
  }

  /**
   * Check reaction!
   */
  async checkReaction() {
    const actorRollData = this.getRollData();
    const reactionRoll = new Roll("2d6", actorRollData);
    reactionRoll.evaluate({ async: false });
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
    const reactionText = game.i18n.localize(key);
    const rollResult = {
      actor: this,
      reactionRoll,
      reactionText,
    };
    const html = await renderTemplate(REACTION_ROLL_CARD_TEMPLATE, rollResult);
    ChatMessage.create({
      content: html,
      sound: diceSound(),
      speaker: ChatMessage.getSpeaker({ actor: this }),
    });
  }

  async wieldPower() {
    if (this.system.powerUses.value < 1) {
      ui.notifications.warn(
        `${game.i18n.localize("MB.NoPowerUsesRemaining")}!`
      );
      return;
    }

    const wieldRoll = new Roll(
      "d20+@abilities.presence.value",
      this.getRollData()
    );
    wieldRoll.evaluate({ async: false });
    await showDice(wieldRoll);

    const d20Result = wieldRoll.terms[0].results[0].result;
    const isFumble = d20Result === 1;
    const isCrit = d20Result === 20;
    const wieldDR = 12;

    let wieldOutcome = null;
    let damageRoll = null;
    let takeDamage = null;
    if (wieldRoll.total >= wieldDR) {
      // SUCCESS!!!
      wieldOutcome = game.i18n.localize(
        isCrit ? "MB.CriticalSuccess" : "MB.Success"
      );
    } else {
      // FAILURE
      wieldOutcome = game.i18n.localize(
        isFumble ? "MB.WieldAPowerFumble" : "MB.Failure"
      );
      damageRoll = new Roll("1d2", this.getRollData());
      damageRoll.evaluate({ async: false });
      await showDice(damageRoll);
      takeDamage = `${game.i18n.localize("MB.Take")} ${
        damageRoll.total
      } ${game.i18n.localize("MB.Damage")}, ${game.i18n.localize(
        "MB.WieldAPowerDizzy"
      )}`;
    }

    const rollResult = {
      damageRoll,
      wieldDR,
      wieldFormula: `1d20 + ${game.i18n.localize("MB.AbilityPresenceAbbrev")}`,
      wieldOutcome,
      wieldRoll,
      takeDamage,
    };
    const html = await renderTemplate(
      WIELD_POWER_ROLL_CARD_TEMPLATE,
      rollResult
    );
    ChatMessage.create({
      content: html,
      sound: diceSound(),
      speaker: ChatMessage.getSpeaker({ actor: this }),
    });

    if (isFumble) {
      // Fumbles roll on the Arcane Catastrophes table
      const pack = game.packs.get("morkborg.random-scrolls");
      const content = await pack.getDocuments();
      const table = content.find((i) => i.name === "Arcane Catastrophes");
      await table.draw();
    } else if (isCrit) {
      // Criticals roll on Eldritch Elevations table, if available
      // TODO: this could be moved into the 3p module and implemented as a hook
      const pack = game.packs.get("morkborg-3p.eldritch-elevations");
      if (pack) {
        const content = await pack.getDocuments();
        const table = content.find((i) => i.name === "Eldritch Elevations");
        if (table) {
          await table.draw();
        }
      }
    }

    const newPowerUses = Math.max(0, this.system.powerUses.value - 1);
    await this.update({ ["data.powerUses.value"]: newPowerUses });
  }

  async useFeat(itemId) {
    const item = this.items.get(itemId);
    if (!item || !item.system.rollLabel) {
      return;
    }

    if (item.system.rollMacro) {
      // roll macro
      if (item.system.rollMacro.includes(",")) {
        // assume it's a CSV string for {pack},{macro name}
        const [packName, macroName] = item.system.rollMacro.split(",");
        const pack = game.packs.get(packName);
        if (pack) {
          const content = await pack.getDocuments();
          const macro = content.find((i) => i.name === macroName);
          if (macro) {
            macro.execute();
          } else {
            console.log(
              `Could not find macro ${macroName} in pack ${packName}.`
            );
          }
        } else {
          console.log(`Pack ${packName} not found.`);
        }
      } else {
        // assume it's the name of a macro in the current world/game
        const macro = game.macros.find((m) => m.name === item.system.rollMacro);
        if (macro) {
          macro.execute();
        } else {
          console.log(`Could not find macro ${item.system.rollMacro}.`);
        }
      }
    } else if (item.system.rollFormula) {
      // roll formula
      await this._rollOutcome(
        item.system.rollFormula,
        this.getRollData(),
        item.system.rollLabel,
        () => ``
      );
    }
  }

  async _rollOutcome(
    dieRoll,
    rollData,
    cardTitle,
    outcomeTextFn,
    rollFormula = null
  ) {
    const roll = new Roll(dieRoll, rollData);
    roll.evaluate({ async: false });
    await showDice(roll);
    const rollResult = {
      cardTitle: cardTitle,
      outcomeText: outcomeTextFn(roll),
      roll,
      rollFormula: rollFormula ?? roll.formula,
    };
    const html = await renderTemplate(OUTCOME_ROLL_CARD_TEMPLATE, rollResult);
    ChatMessage.create({
      content: html,
      sound: diceSound(),
      speaker: ChatMessage.getSpeaker({ actor: this }),
    });
    return roll;
  }

  async rollOmens() {
    const classItem = this.items.filter((x) => x.type === "class").pop();
    if (!classItem) {
      return;
    }
    const roll = await this._rollOutcome(
      "@omenDie",
      classItem.getRollData(),
      `${game.i18n.localize("MB.Omens")}`,
      (roll) => ` ${game.i18n.localize("MB.Omens")}: ${Math.max(0, roll.total)}`
    );
    const newOmens = Math.max(0, roll.total);
    await this.update({ ["data.omens"]: { max: newOmens, value: newOmens } });
  }

  async rollPowersPerDay() {
    const roll = await this._rollOutcome(
      "d4+@abilities.presence.value",
      this.getRollData(),
      `${game.i18n.localize("MB.Powers")} ${game.i18n.localize("MB.PerDay")}`,
      (roll) =>
        ` ${game.i18n.localize("MB.PowerUsesRemaining")}: ${Math.max(
          0,
          roll.total
        )}`,
      `1d4 + ${game.i18n.localize("MB.AbilityPresenceAbbrev")}`
    );
    const newUses = Math.max(0, roll.total);
    await this.update({
      ["data.powerUses"]: { max: newUses, value: newUses },
    });
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
        if (this.system.omens.value === 0) {
          await this.rollOmens();
        }
      } else if (canRestore && foodAndDrink === "donteat") {
        await this.showRestNoEffect();
      }
    }
  }

  async showRestNoEffect() {
    const result = {
      cardTitle: game.i18n.localize("MB.Rest"),
      outcomeText: game.i18n.localize("MB.NoEffect"),
    };
    const html = await renderTemplate(OUTCOME_ONLY_ROLL_CARD_TEMPLATE, result);
    await ChatMessage.create({
      content: html,
      sound: diceSound(),
      speaker: ChatMessage.getSpeaker({ actor: this }),
    });
  }

  async rollHealHitPoints(dieRoll) {
    const roll = await this._rollOutcome(
      dieRoll,
      this.getRollData(),
      game.i18n.localize("MB.Rest"),
      (roll) =>
        `${game.i18n.localize("MB.Heal")} ${roll.total} ${game.i18n.localize(
          "MB.HP"
        )}`
    );
    const newHP = Math.min(
      this.system.hp.max,
      this.system.hp.value + roll.total
    );
    await this.update({ ["data.hp.value"]: newHP });
  }

  async rollStarvation() {
    const roll = await this._rollOutcome(
      "d4",
      this.getRollData(),
      game.i18n.localize("MB.Starvation"),
      (roll) =>
        `${game.i18n.localize("MB.Take")} ${roll.total} ${game.i18n.localize(
          "MB.Damage"
        )}`
    );
    const newHP = this.system.hp.value - roll.total;
    await this.update({ ["data.hp.value"]: newHP });
  }

  async rollInfection() {
    const roll = await this._rollOutcome(
      "d6",
      this.getRollData(),
      game.i18n.localize("MB.Infection"),
      (roll) =>
        `${game.i18n.localize("MB.Take")} ${roll.total} ${game.i18n.localize(
          "MB.Damage"
        )}`
    );
    const newHP = this.system.hp.value - roll.total;
    await this.update({ ["data.hp.value"]: newHP });
  }

  async getBetter() {
    const oldHp = this.system.hp.max;
    const newHp = this._betterHp(oldHp);
    const oldStr = this.system.abilities.strength.value;
    const newStr = this._betterAbility(oldStr);
    const oldAgi = this.system.abilities.agility.value;
    const newAgi = this._betterAbility(oldAgi);
    const oldPre = this.system.abilities.presence.value;
    const newPre = this._betterAbility(oldPre);
    const oldTou = this.system.abilities.toughness.value;
    const newTou = this._betterAbility(oldTou);
    let newSilver = this.system.silver;

    const hpOutcome = this._abilityOutcome(
      game.i18n.localize("MB.HP"),
      oldHp,
      newHp
    );
    const strOutcome = this._abilityOutcome(
      game.i18n.localize("MB.AbilityStrength"),
      oldStr,
      newStr
    );
    const agiOutcome = this._abilityOutcome(
      game.i18n.localize("MB.AbilityAgility"),
      oldAgi,
      newAgi
    );
    const preOutcome = this._abilityOutcome(
      game.i18n.localize("MB.AbilityPresence"),
      oldPre,
      newPre
    );
    const touOutcome = this._abilityOutcome(
      game.i18n.localize("MB.AbilityToughness"),
      oldTou,
      newTou
    );

    // Left in the debris you find...
    let debrisOutcome = null;
    let scrollTableName = null;
    const debrisRoll = new Roll("1d6", this.getRollData()).evaluate({
      async: false,
    });
    if (debrisRoll.total < 4) {
      debrisOutcome = "Nothing";
    } else if (debrisRoll.total === 4) {
      const silverRoll = new Roll("3d10", this.getRollData()).evaluate({
        async: false,
      });
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
      content: html,
      sound: CONFIG.sounds.dice, // make a single dice sound
      speaker: ChatMessage.getSpeaker({ actor: this }),
    });

    if (scrollTableName) {
      // roll a scroll
      const pack = game.packs.get("morkborg.random-scrolls");
      const content = await pack.getDocuments();
      const table = content.find((i) => i.name === scrollTableName);
      await table.draw();
    }

    // set new stats on the actor

    await this.update({
      ["data.abilities.strength.value"]: newStr,
      ["data.abilities.agility.value"]: newAgi,
      ["data.abilities.presence.value"]: newPre,
      ["data.abilities.toughness.value"]: newTou,
      ["data.hp.max"]: newHp,
      ["data.silver"]: newSilver,
    });
  }

  _betterHp(oldHp) {
    const hpRoll = new Roll("6d10", this.getRollData()).evaluate({
      async: false,
    });
    if (hpRoll.total >= oldHp) {
      // success, increase HP
      const howMuchRoll = new Roll("1d6", this.getRollData()).evaluate({
        async: false,
      });
      return oldHp + howMuchRoll.total;
    } else {
      // no soup for you
      return oldHp;
    }
  }

  _betterAbility(oldVal) {
    const roll = new Roll("1d6", this.getRollData()).evaluate({ async: false });
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

  async scvmify() {
    new ScvmDialog(this).render(true);
  }

  async rollBroken() {
    const brokenRoll = new Roll("1d4").evaluate({ async: false });
    await showDice(brokenRoll);

    let outcomeLines = [];
    let additionalRolls = [];
    if (brokenRoll.total === 1) {
      const unconsciousRoll = new Roll("1d4").evaluate({ async: false });
      const roundsWord = game.i18n.localize(
        unconsciousRoll.total > 1 ? "MB.Rounds" : "MB.Round"
      );
      const hpRoll = new Roll("1d4").evaluate({ async: false });
      outcomeLines = [
        game.i18n.format("MB.BrokenFallUnconscious", {
          rounds: unconsciousRoll.total,
          roundsWord,
          hp: hpRoll.total,
        }),
      ];
      additionalRolls = [unconsciousRoll, hpRoll];
    } else if (brokenRoll.total === 2) {
      const limbRoll = new Roll("1d6").evaluate({ async: false });
      const actRoll = new Roll("1d4").evaluate({ async: false });
      const hpRoll = new Roll("1d4").evaluate({ async: false });
      const roundsWord = game.i18n.localize(
        actRoll.total > 1 ? "MB.Rounds" : "MB.Round"
      );
      if (limbRoll.total <= 5) {
        outcomeLines = [
          game.i18n.format("MB.BrokenSeveredLimb", {
            rounds: actRoll.total,
            roundsWord,
            hp: hpRoll.total,
          }),
        ];
      } else {
        outcomeLines = [
          game.i18n.format("MB.BrokenLostEye", {
            rounds: actRoll.total,
            roundsWord,
            hp: hpRoll.total,
          }),
        ];
      }
      additionalRolls = [limbRoll, actRoll, hpRoll];
    } else if (brokenRoll.total === 3) {
      const hemorrhageRoll = new Roll("1d2").evaluate({ async: false });
      const hoursWord = game.i18n.localize(
        hemorrhageRoll.total > 1 ? "MB.Hours" : "MB.Hour"
      );
      const lastHour =
        hemorrhageRoll.total == 2
          ? game.i18n.localize("MB.BrokenHemorrhageLastHour")
          : "";
      outcomeLines = [
        game.i18n.format("MB.BrokenHemorrhage", {
          hours: hemorrhageRoll.total,
          hoursWord,
          lastHour,
        }),
      ];
      additionalRolls = [hemorrhageRoll];
    } else {
      outcomeLines = [game.i18n.localize("MB.BrokenYouAreDead")];
    }

    const data = {
      additionalRolls,
      brokenRoll,
      outcomeLines,
    };
    const html = await renderTemplate(BROKEN_ROLL_CARD_TEMPLATE, data);
    ChatMessage.create({
      content: html,
      sound: diceSound(),
      speaker: ChatMessage.getSpeaker({ actor: this }),
    });
  }
}
