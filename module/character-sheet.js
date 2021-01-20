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
    // TODO: should preparing items move into the MBActor class?
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
    // TODO: should we just create a hash of itemType => items?
    let scrolls = [];
    let containers = [];

    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;

      item.equippable = (i.type === 'armor' || i.type === 'shield' || i.type === 'weapon');
      if (item.equippable) {
        const isEquipped = getProperty(item, "equipped");
        item.toggleClass = isEquipped ? "equipped" : "";
        item.toggleTitle = game.i18n.localize(isEquipped ? "MB.ItemEquipped" : "MB.ItemUnequipped");
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
      } else if (i.type === 'container') {
        containers.push(i);
      } else if (i.type === 'class') {
        sheetData.actor.data.class = i;
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
    let itemsInContainers = equipment.filter(item => item.type !== 'container' && !item.data.equipped);
    let totalContainerSpace = itemsInContainers.reduce((total, item) => total + (item.data.containerSpace || 0), 0);
    // Calculate container capacity from containers
    let containerCapacity = containers.reduce((total, item) => total + item.data.capacity, 0);
    sheetData.actor.data.containerSpace = totalContainerSpace || 0;
    sheetData.actor.data.containerCapacity = containerCapacity;

    // all equipment with encumbrance counts towards carried/encumberance
    let carryingCount = equipment.reduce((a, b) => a + (b.data.carryWeight || 0), 0);
    let carryingCapacity = sheetData.actor.data.abilities.strength.score + 8;
    sheetData.actor.data.carryingCount = carryingCount || 0;
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
    options.content_style = '@import url("https://fonts.googleapis.com/css2?family=Special+Elite&display=swap");';
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
    const classItem = this.actor.items.filter(x => x.type === "class").pop();
    if (classItem) {
      let r = new Roll("@omenDie", classItem.getRollData());
      r.roll().toMessage({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `<h2>${game.i18n.localize('MB.Omens')}</h2>`
      });
      return this.actor.update({["data.omens"]: r.total});
    }
  }

  _onPowersPerDayRoll(event) {
    event.preventDefault();
    let r = new Roll("d4+@abilities.presence.score", this.actor.getRollData());
    r.roll().toMessage({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${game.i18n.localize('MB.Powers')} ${game.i18n.localize('MB.PerDay')}</h2>`
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

  _onAttackRoll(event) {
    event.preventDefault();   
    const button = $(event.currentTarget);
    const li = button.parents(".item");
    const itemId = li.data("itemId");
    this.actor.attack(itemId);
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

  _onDefendRoll(event) {
    event.preventDefault();  
    let sheetData = this.getData();
    this.actor.defend(sheetData);
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