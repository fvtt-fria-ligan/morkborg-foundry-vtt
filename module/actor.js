
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

  attack(itemId) {
    const item = this.getOwnedItem(itemId);
    const itemRollData = item.getRollData();
    const actorRollData = this.getRollData();

    // TODO: make these multiple rolls into a single roll sheet, a la BetterRolls5e

    // roll 1: attack
    // ranged weapons use agility; melee weapons use strength
    const isRanged = itemRollData.weaponType === 'ranged';
    const ability = isRanged ? 'agility' : 'strength';
    let attackRoll = new Roll(`d20+@abilities.${ability}.score`, actorRollData);
    const weaponTypeKey = isRanged ? 'MB.WeaponTypeRanged' : 'MB.WeaponTypeMelee';
    const attackLabel = `${game.i18n.localize(weaponTypeKey)} ${game.i18n.localize('MB.Attack')}`;
    let weaponType = 
    attackRoll.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `<h2>${item.name}</h2><h3>${attackLabel}</h3>`
    });

    // roll 2: damage
    let damageRoll = new Roll("@damageDie", itemRollData);
    let damageTitle = game.i18n.localize('MB.Damage');
    damageTitle = damageTitle.charAt(0).toUpperCase() + damageTitle.slice(1);
    damageRoll.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `<h2>${item.name}</h2><h3>${damageTitle}</h2>`
    });

    // roll 3: target damage reduction
    console.log(this.data.data.targetArmorDie);
    if (this.data.data.targetArmorDie) {
      let targetArmorRoll = new Roll("@targetArmorDie", actorRollData);
      let targetArmorTitle = game.i18n.localize('MB.TargetArmor');
      targetArmorRoll.roll().toMessage({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `<h2>${item.name}</h2><h3><h3>${targetArmorTitle}</h3>`
      });
    }
  }

  defend(sheetData) {
    let rollData = this.getRollData();
    if (!rollData.incomingAttackDamageDie) {
      return;
    }

    // TODO: make a fancier unified roll message w/ 3 rolls

    // roll 1: defend
    // TODO: use armor and encumberance modifiers
    let defenseRoll = new Roll("d20+@abilities.agility.score", rollData);
    defenseRoll.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `<h2>${game.i18n.localize('MB.IncomingAttack')}</h2><h3>${game.i18n.localize('MB.Defend')}</h3>`
    });

    // roll 2: incoming damage
    let damageRoll = new Roll("@incomingAttackDamageDie", rollData);
    let damageTitle = game.i18n.localize('MB.Damage');
    damageTitle = damageTitle.charAt(0).toUpperCase() + damageTitle.slice(1);
    damageRoll.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `<h2>${game.i18n.localize('MB.IncomingAttack')}</h2><h3>${damageTitle}</h3>`
    });

    // roll 3: damage reduction from equipped armor and shield
    let damageReductionDie = "";
    // grab equipped armor/shield, set in getData()
    if (sheetData.data.equippedArmor) {
      damageReductionDie = sheetData.data.equippedArmor.data.damageReductionDie;
    }
    if (sheetData.data.equippedShield) {
      damageReductionDie += "+1";
    }
    if (damageReductionDie) {
      let reductionRoll = new Roll("@die", {die: damageReductionDie});
      reductionRoll.roll().toMessage({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `<h2>${game.i18n.localize('MB.IncomingAttack')}</h2><h3>${game.i18n.localize('MB.DamageReduction')}</h3>`
      });
    }
  }


}  

