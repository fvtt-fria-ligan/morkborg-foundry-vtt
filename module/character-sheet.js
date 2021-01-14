/**
 * @extends {ActorSheet}
 */
export class MBActorSheetCharacter extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "actor", "character"],
      template: "systems/morkborg/templates/character-sheet.html",
      width: 720,
      height: 680,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "violence"}],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /** @override */
  getData() {
    const data = super.getData();
    data.config = CONFIG.MB;

    // Ability Scores
    for (let [a, abl] of Object.entries(data.actor.data.abilities)) {
      const translationKey = CONFIG.MB.abilities[a];
      abl.label = game.i18n.localize(translationKey);
    }

    // Prepare items.
    if (this.actor.data.type == 'character') {
      this._prepareCharacterItems(data);
    }

    return data;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} sheetData The sheet data to prepare.
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    let equipment = [];
    let equippedArmor = null;
    let equippedShield = null;
    let equippedWeapons = [];
    let scrolls = [];

    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;

      item.equippable = (i.type === 'armor' || i.type === 'shield' || i.type === 'weapon');
      if (item.equippable) {
        const isEquipped = getProperty(item, "equipped");
        item.toggleClass = isEquipped ? "equipped" : "";
        item.toggleTitle = game.i18n.localize(isEquipped ? "MB.Equipped" : "MB.Unequipped");
      }

      // TODO: use enum
      // TODO: use constants?
      if (i.type === 'armor' 
        || i.type === 'container'
        || i.type === 'misc'
        || i.type === 'scroll'
        || i.type === 'shield'
        || i.type === 'weapon') {
        equipment.push(i);
      }      
      if (i.type === 'armor') {
        item.damageReductionDie = CONFIG.MB.armorTierDamageReductionDie[item.currentTier];
        if (item.equipped) {
          // only one armor may be equipped at a time
          equippedArmor = i;
        }
      } else if (i.type === 'scroll') {
        scrolls.push(i);
      } else if (i.type === 'shield') {
        if (item.equipped) {
          // only one shield may be equipped at a time
          equippedShield = i;
        }
      } else if (i.type === 'weapon') {
        if (item.equipped) {
          equippedWeapons.push(i);
        }
      }
    }
    // TODO: figure out what we want to do wrt sorting, drag-drop reordering, etc
    //equipment.sort((a, b) => (a.sort > b.sort) ? 1 : ((b.sort > a.sort) ? -1 : 0)); 
    equipment.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    equippedWeapons.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

    // Assign to new properties
    sheetData.actor.data.equipment = equipment;
    sheetData.actor.data.equippedArmor = equippedArmor;
    sheetData.actor.data.equippedShield = equippedShield;
    sheetData.actor.data.equippedWeapons = equippedWeapons;
    sheetData.actor.data.scrolls = scrolls;

    // Calculate carried-in-container count - all non-container non-equipped equipment
    // let containerCount = equipment.filter(item => item.type !== 'container' && !item.data.equipped).length;
    // Calculate container capacity from containers
    // let containerCapacity = typeArrays['container'].reduce((total, item) => total + item.data.capacity, 0);

    // all equipment counts towards carried/encumberance
    let carryingCount = equipment.length;
    let carryingCapacity = sheetData.actor.data.abilities.strength.score + 8;
    sheetData.actor.data.carryingCount = carryingCount;
    sheetData.actor.data.carryingCapacity = carryingCapacity;
    let isEncumbered = carryingCount > carryingCapacity;
    sheetData.actor.data.encumbered = isEncumbered;
    sheetData.actor.data.encumberedClass = isEncumbered ? "encumbered" : "";
  }  

  /** @override */
  activateEditor(name, options={}, initialContent="") {
    options.relative_urls = true;
    options.skin_url = "/systems/morkborg/styles/skins/mb";
    options.skin = "morkborg";
    options.toolbar_location = 'bottom';
    options.plugins = 'lists table link image save';
    options.toolbar = 'formatselect | bold italic underline strikethrough bullist image link save';
    options.menubar = false;
    options.statusbar = false;
    super.activateEditor(name, options, initialContent);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Handle rollable items.
    html.find(".ability-row .rollable").on("click", this._onRoll.bind(this));
    html.find(".omens-row .rollable").on("click", this._onOmensRoll.bind(this));
    html.find(".attack-button").on("click", this._onAttackRoll.bind(this));
    html.find(".defend-button").on("click", this._onDefendRoll.bind(this));
    html.find(".wield-power-button").on("click", this._onRoll.bind(this));
    html.find(".powers-per-day-text").on("click", this._onPowersPerDayRoll.bind(this));
    html.find('.item-toggle').click(this._onToggleItem.bind(this));
    html.find('.tier-radio').click(this._onArmorTierRadio.bind(this));
  }

  _onOmensRoll(event) {
    event.preventDefault();
    let r = new Roll("@class.omenDie", this.actor.getRollData());
    r.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${game.i18n.localize('MB.Omens')}</h2>`
    });
    return this.actor.update({["data.omens"]: r.total});
  }

  _onPowersPerDayRoll(event) {
    event.preventDefault();
    let r = new Roll("d4+@abilities.presence.score", this.actor.getRollData());
    r.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${game.i18n.localize('MB.PowersPerDay')}</h2>`
    });
    return this.actor.update({["data.powerUsesRemaining"]: r.total});
  }

  /**
   * Handle creating a new Owned Item for the actor.
   *
   * @param {Event} event   The originating click event
   * @private
   */
 async _onItemCreate(event) {
    event.preventDefault();
    const template = "systems/morkborg/templates/add-item-dialog.html";
    let dialogData = {
      config: CONFIG.MorkBorg
    };
    const html = await renderTemplate(template, dialogData);
    return new Promise(resolve => {
      new Dialog({
         title: game.i18n.localize('MB.CreateNewItem'),
         content: html,
         buttons: {
            create: {
              icon: '<i class="fas fa-check"></i>',
              label: game.i18n.localize('MB.CreateNewItem'),
              callback: html => resolve(_createItem(this.actor, html[0].querySelector("form")))
            },
         },
         default: "create",
         close: () => resolve(null)
        }).render(true);
    });
  }

  /**
   * Handle toggling the state of an Owned Item within the Actor
   *
   * @param {Event} event   The triggering click event
   * @private
   */
  async _onToggleItem(event) {
    event.preventDefault();
    let anchor = $(event.currentTarget);
    const li = anchor.parents(".item");
    const itemId = li.data("itemId");
    const item = this.actor.getOwnedItem(itemId);
    const attr = "data.equipped";
    const currEquipped = getProperty(item.data, attr);
    if (!currEquipped) {
      // we're equipping something
      // if this is armor or shield, unequip any other equipped armor/shield
      if (item.type === 'armor' || item.type === 'shield') {
        for (const otherItem of this.actor.items) {
          if (otherItem.type === item.type && otherItem._id != item._id) {
            const otherEquipped = getProperty(otherItem.data, attr);
            if (otherEquipped) {
              await otherItem.update({[attr]: false});
            }
          }
        }
      }
    }
    return item.update({[attr]: !getProperty(item.data, attr)});
  }  

  /**
   * Listen for roll buttons on items.
   *
   * @param {MouseEvent} event    The originating left click event
   */
  _onItemRoll(event) {
    event.preventDefault();    
    let button = $(event.currentTarget);
    let r = new Roll(button.data('roll'), this.actor.getRollData());
    const li = button.parents(".item");
    const item = this.actor.getOwnedItem(li.data("itemId"));
    r.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3>`
    });
  }

  /**
   * Handle clickable rolls.
   *
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.data.data);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  /**
   * Handle weapon attack roll.
   *
   * @param {Event} event   The originating click event
   * @private
   */
  _onAttackRoll(event) {
    event.preventDefault();    
    let button = $(event.currentTarget);
    const li = button.parents(".item");
    const item = this.actor.getOwnedItem(li.data("itemId"));
    const itemRollData = item.getRollData();
    const actorRollData = this.actor.getRollData();

    // TODO: make these multiple rolls into a single roll sheet, a la BetterRolls5e

    // roll 1: attack
    // ranged weapons use agility; melee weapons use strength
    const isRanged = itemRollData.weaponType === 'ranged';
    const ability = isRanged ? 'agility' : 'strength';
    let attackRoll = new Roll(`d20+@abilities.${ability}.score`, actorRollData);
    const weaponTypeKey = isRanged ? 'MB.Ranged' : 'MB.Melee';
    const attackLabel = `${game.i18n.localize(weaponTypeKey)} ${game.i18n.localize('MB.Attack')}`;
    let weaponType = 
    attackRoll.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${item.name}</h2><h3>${attackLabel}</h3>`
    });

    // roll 2: damage
    let damageRoll = new Roll("@damageDie", itemRollData);
    let damageTitle = game.i18n.localize('MB.Damage');
    damageTitle = damageTitle.charAt(0).toUpperCase() + damageTitle.slice(1);
    damageRoll.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${item.name}</h2><h3>${damageTitle}</h2>`
    });

    // roll 3: target damage reduction
    console.log(this.actor.data.data.targetArmorDie);
    if (this.actor.data.data.targetArmorDie) {
      let targetArmorRoll = new Roll("@targetArmorDie", actorRollData);
      let targetArmorTitle = game.i18n.localize('MB.TargetArmor');
      targetArmorRoll.roll().toMessage({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `<h2>${item.name}</h2><h3><h3>${targetArmorTitle}</h3>`
      });
    }
  }

  /**
   * Handle a click on the armor current tier radio buttons.
   */
  _onArmorTierRadio(event) {
    event.preventDefault();
    let input = $(event.currentTarget);
    let newTier = parseInt(input[0].value);
    let li = input.parents(".item");
    const item = this.actor.getOwnedItem(li.data("itemId"));
    return item.update({["data.currentTier"]: newTier});
  }

  /**
   * Handle defend roll.
   *
   * @param {Event} event   The originating click event
   * @private
   */
  _onDefendRoll(event) {
    event.preventDefault();    
    let rollData = this.actor.getRollData();
    if (!rollData.incomingAttackDamageDie) {
      return;
    }

    // TODO: make a fancier unified roll message w/ 3 rolls

    // roll 1: defende
    // TODO: use armor and encumberance modifiers
    let defenseRoll = new Roll("d20+@abilities.agility.score", rollData);
    defenseRoll.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${game.i18n.localize('MB.IncomingAttack')}</h2><h3>${game.i18n.localize('MB.Defend')}</h3>`
    });

    // roll 2: incoming damage
    let damageRoll = new Roll("@incomingAttackDamageDie", rollData);
    let damageTitle = game.i18n.localize('MB.Damage');
    damageTitle = damageTitle.charAt(0).toUpperCase() + damageTitle.slice(1);
    damageRoll.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${game.i18n.localize('MB.IncomingAttack')}</h2><h3>${damageTitle}</h3>`
    });

    // roll 3: damage reduction from equipped armor and shield
    let damageReductionDie = "";
    // grab equipped armor/shield, set in getData()
    // TODO: verify getData() is the right way to do this
    let sheetData = this.getData();
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
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `<h2>${game.i18n.localize('MB.IncomingAttack')}</h2><h3>${game.i18n.localize('MB.DamageReduction')}</h3>`
      });
    }
  }
}

/**
 * Create a new Owned Item for the given actor, based on the name/type from the form.
 */
const _createItem = (actor, form) => {
  const itemData = {
    name: form.itemname.value,
    type: form.itemtype.value,
    data: {}
  };
  actor.createOwnedItem(itemData);
};