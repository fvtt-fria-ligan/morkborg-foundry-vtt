/**
 * @extends {ActorSheet}
 */
export class MBActorSheetCharacter extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "actor"],
      template: "systems/morkborg/templates/character-sheet.html",
      width: 720,
      height: 680,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "equipment"}],
      // is dragDrop needed?
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /** @override */
  getData() {
    const data = super.getData();
    data.config = CONFIG.MB;

    // Ability Scores
    for (let [a, abl] of Object.entries(data.actor.data.abilities)) {
      // abl.icon = this._getProficiencyIcon(abl.proficient);
      const translationKey = CONFIG.MB.abilities[a];
      // abl.translationKey = CONFIG.MB.abilities[a];
      abl.label = game.i18n.localize(translationKey);
    }

    // data.dtypes = ["String", "Number", "Boolean"];
    // for (let attr of Object.values(data.data.attributes)) {
    //   attr.isCheckbox = attr.dtype === "Boolean";
    // }

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
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    // TODO: just iterate over the config constants
    // Initialize containers.
    var typeArrays = {
      'armor': [],
      'container': [],
      'misc': [],
      'scroll': [],
      'shield': [],
      'weapon': [],
    };

    var equipment = [];
    var equippedWeapons = [];
    sheetData.actor.data.equippedArmor = null;
    sheetData.actor.data.equippedShield = null;

    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      typeArrays[i.type].push(i);

      // TODO: use constants?
      if (i.type === 'armor' 
        || i.type === 'container'
        || i.type === 'misc'
        || i.type === 'scroll'
        || i.type === 'shield'
        || i.type === 'weapon') {
        equipment.push(i);
      }
      if (item.equippable) {
        const isEquipped = getProperty(item, "equipped");
        item.toggleClass = isEquipped ? "equipped" : "";
        item.toggleTitle = game.i18n.localize(isEquipped ? "MB.Equipped" : "MB.Unequipped");
      }

      // TODO: use enum
      if (i.type === 'weapon') {
        // TODO: turns out we didn't need these labels. Delete?
        // localize rollable labels
        // item.attackLabel = game.i18n.localize(CONFIG.MB.weaponTypes[item.weaponType]) + ' ' + game.i18n.localize('MB.Attack');
        //item.damageLabel = item.damageDie + ' ' + game.i18n.localize('MB.Damage');
        if (item.equipped) {
          equippedWeapons.push(i);
        }
      } else if (i.type === 'armor') {
        item.damageReductionDie = CONFIG.MB.armorTierDamageReductionDie[item.tier];
        if (item.equipped) {
          // only one armor may be equipped at a time
          sheetData.actor.data.equippedArmor = i;
        }
      } else if (i.type === 'shield') {
        if (item.equipped) {
          // only one shield may be equipped at a time
          sheetData.actor.data.equippedShield = i;
        }
      }
    }

    // Assign to new properties
    sheetData.actor.weapons = typeArrays['weapon'];
    sheetData.actor.armor = typeArrays['armor'].concat(typeArrays['shield'])
    // TODO: figure out how we want to handle containers
    sheetData.actor.misc = typeArrays['container'].concat(typeArrays['misc']);
    sheetData.actor.scrolls = typeArrays['scroll'];

    sheetData.actor.data.equipment = equipment;
    sheetData.actor.data.equippedWeapons = equippedWeapons;

    // Calculate carrying capacity from containers
    sheetData.actor.data.carryingCapacity = typeArrays['container'].reduce((total, item) => total + item.data.capacity, 0);

    // TODO:  we could calculate how many carried, too - all non-container non-equipped things
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
    // TODO: handle everything with one onRoll method?
    // html.find('.rollable').click(this._onRoll.bind(this));
    // TODO: figure out what we want to do for items/rolls
    //html.find(".items .rollable").on("click", this._onItemRoll.bind(this));  
    html.find(".ability-row .rollable").on("click", this._onRoll.bind(this));    
    html.find(".omens-row .rollable").on("click", this._onRoll.bind(this));    
    // TODO: fix/cleanup
    html.find(".wield-power-button").on("click", this._onRoll.bind(this));
    html.find(".attack-button").on("click", this._onAttackRoll.bind(this));
    html.find(".defend-button").on("click", this._onDefendRoll.bind(this));
    html.find('.item-toggle').click(this._onToggleItem.bind(this));
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    console.log("**************1");
    console.log(header);
    const header = event.currentTarget;
    console.log("**************2");
    console.log(header);
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  /**
   * Listen for roll buttons on items.
   * @param {MouseEvent} event    The originating left click event
   */
  _onItemRoll(event) {
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
   * @param {Event} event   The originating click event
   * @private
   */
  // _onRoll(event) {
  //   event.preventDefault();
  //   const element = event.currentTarget;
  //   const dataset = element.dataset;

  //   if (dataset.roll) {
  //     let roll = new Roll(dataset.roll, this.actor.data.data);
  //     let label = dataset.label ? `Rolling ${dataset.label}` : '';
  //     roll.roll().toMessage({
  //       speaker: ChatMessage.getSpeaker({ actor: this.actor }),
  //       flavor: label
  //     });
  //   }
  // }
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

  _onAttackRoll(event) {
    let button = $(event.currentTarget);
    const li = button.parents(".item");
    const item = this.actor.getOwnedItem(li.data("itemId"));

    // TODO: make these two rolls into a single roll sheet, a la BetterRolls5e
    let attackRoll = new Roll("d20+@abilities.strength.score", this.actor.getRollData());
    attackRoll.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3>`
    });

    let damageRoll = new Roll("@damageDie", item.getRollData());
    let damageTitle = game.i18n.localize('MB.Damage');
    damageTitle = damageTitle.charAt(0).toUpperCase() + damageTitle.slice(1);
    damageRoll.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${item.name}</h2><h3>${damageTitle}</h3>`
    });
  }  

  _onDefendRoll(event) {
    let button = $(event.currentTarget);
    const li = button.parents(".item");
    // TODO: item is currently null because our underarmor-row isn't within the .item <li> tag
    // hmm - can we just set the itemId somewhere for our button, and pull it here?
    // that would mean we'd still need to be within the handlebars each iterator
    // Maybe we need to move to our "equipped armor" model, so we can find the one
    // single armor?s
    const item = this.actor.getOwnedItem(li.data("itemId"));    
    console.log("*********************");
    console.log(item);
  }

  /**
   * Handle toggling the state of an Owned Item within the Actor
   * @param {Event} event   The triggering click event
   * @private
   */
  _onToggleItem(event) {
    event.preventDefault();
    let anchor = $(event.currentTarget);
    const li = anchor.parents(".item");
    const itemId = li.data("itemId");
    const item = this.actor.getOwnedItem(itemId);
    const attr = "data.equipped";
    return item.update({[attr]: !getProperty(item.data, attr)});
  }  
}
