import * as editor from "./editor.js";
import RestDialog from "./rest-dialog.js";

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
    const byName = (a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
    sheetData.actor.data.feats = sheetData.items.filter(item => item.type === CONFIG.MB.itemTypes.feat).sort(byName);
    sheetData.actor.data.class = sheetData.items.filter(item => item.type === CONFIG.MB.itemTypes.class)[0];

    // TODO: make better use of filters below
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

      item.equippable = (i.type === CONFIG.MB.itemTypes.armor || i.type === CONFIG.MB.itemTypes.shield || i.type === CONFIG.MB.itemTypes.weapon);
      if (item.equippable) {
        const isEquipped = getProperty(item, "equipped");
        item.toggleClass = isEquipped ? "equipped" : "";
        item.toggleTitle = game.i18n.localize(isEquipped ? "MB.ItemEquipped" : "MB.ItemUnequipped");
      }

      if (CONFIG.MB.itemEquipmentTypes.includes(i.type)) {
        equipment.push(i);
      }
      if (i.type === CONFIG.MB.itemTypes.armor) {
        item.damageReductionDie = CONFIG.MB.armorTiers[item.tier.value].damageReductionDie;
        if (item.equipped) {
          // only one armor may be equipped at a time
          equippedArmor = i;
        }
      } else if (i.type === CONFIG.MB.itemTypes.container) {
        containers.push(i);
      } else if (i.type === CONFIG.MB.itemTypes.class) {
        sheetData.actor.data.class = i;
      } else if (i.type === CONFIG.MB.itemTypes.scroll) {
        scrolls.push(i);
      } else if (i.type === CONFIG.MB.itemTypes.shield) {
        if (item.equipped) {
          // only one shield may be equipped at a time
          equippedShield = i;
        }
      } else if (i.type === CONFIG.MB.itemTypes.weapon) {
        if (item.equipped) {
          equippedWeapons.push(i);
        }
      }
    }
    // sort alphabetically
    equipment.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    equippedWeapons.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

    // Assign to new properties
    sheetData.actor.data.equipment = equipment;
    sheetData.actor.data.equippedArmor = equippedArmor;
    sheetData.actor.data.equippedShield = equippedShield;
    sheetData.actor.data.equippedWeapons = equippedWeapons;
    sheetData.actor.data.scrolls = scrolls;

    sheetData.actor.data.containerSpace = this.actor.containerSpace();
    sheetData.actor.data.containerCapacity = this.actor.containerCapacity();
    // TODO: rename to carryingWeight?
    sheetData.actor.data.carryingCount = this.actor.carryingWeight();
    sheetData.actor.data.carryingCapacity = this.actor.normalCarryingCapacity();
    const isEncumbered = this.actor.isEncumbered();
    sheetData.actor.data.encumbered = isEncumbered;
    sheetData.actor.data.encumberedClass = isEncumbered ? "encumbered" : "";
  }

  /** @override */
  activateEditor(name, options={}, initialContent="") {
    editor.setCustomEditorOptions(options);
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
    // sheet header
    html.find(".ability-label.rollable.strength").on("click", this._onStrengthRoll.bind(this));
    html.find(".ability-label.rollable.agility").on("click", this._onAgilityRoll.bind(this));
    html.find(".ability-label.rollable.presence").on("click", this._onPresenceRoll.bind(this));
    html.find(".ability-label.rollable.toughness").on("click", this._onToughnessRoll.bind(this));
    html.find(".rest-buttons .rest-button").on("click", this._onRest.bind(this));
    html.find(".omens-row .rollable").on("click", this._onOmensRoll.bind(this));
    // violence tab
    html.find('.party-initiative').click(this._onPartyInitiativeRoll.bind(this));
    html.find('.individual-initiative').click(this._onIndividualInitiativeRoll.bind(this));
    html.find(".attack-button").on("click", this._onAttackRoll.bind(this));
    html.find('.tier-radio').click(this._onArmorTierRadio.bind(this));
    html.find(".defend-button").on("click", this._onDefendRoll.bind(this));
    // feats tab
    html.find(".feat-button").on("click", this._onFeatRoll.bind(this));
    // powers tab
    html.find(".wield-power-button").on("click", this._onWieldPowerRoll.bind(this));
    html.find(".powers-per-day-text").on("click", this._onPowersPerDayRoll.bind(this));
    // treasures (and other) tab
    html.find('.item-qty-plus').click(this._onItemAddQuantity.bind(this));
    html.find('.item-qty-minus').click(this._onItemSubtractQuantity.bind(this));
    html.find('.item-toggle').click(this._onToggleItem.bind(this));
  }

  _onPartyInitiativeRoll(event) {
    event.preventDefault();
    this.actor.rollPartyInitiative();
  }

  _onIndividualInitiativeRoll(event) {
    event.preventDefault();
    this.actor.rollIndividualInitiative();
  }

  _onStrengthRoll(event) {
    event.preventDefault();
    this.actor.testStrength();
  }

  _onAgilityRoll(event) {
    event.preventDefault();
    this.actor.testAgility();
  }

  _onPresenceRoll(event) {
    event.preventDefault();
    this.actor.testPresence();
  }

  _onToughnessRoll(event) {
    event.preventDefault();
    this.actor.testToughness();
  }

  _onOmensRoll(event) {
    event.preventDefault();
    this.actor.rollOmens();
  }

  _onPowersPerDayRoll(event) {
    event.preventDefault();
    this.actor.rollPowersPerDay();
  }

  _onRest(event) {
    event.preventDefault();
    const restDialog = new RestDialog();
    // TODO: maybe move this into a constructor,
    // if we can resolve the mergeObject() Maximum call stack size exceeded error
    restDialog.actor = this.actor;
    restDialog.render(true);
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
   * Handle adding quantity of an Owned Item within the Actor
   */
  async _onItemAddQuantity(event) {
    event.preventDefault();
    let anchor = $(event.currentTarget);
    const li = anchor.parents(".item");
    const itemId = li.data("itemId");
    const item = this.actor.getOwnedItem(itemId);
    const attr = "data.quantity";
    const currQuantity = getProperty(item.data, attr);
    return item.update({[attr]: currQuantity + 1});
  }

  /**
   * Handle subtracting quantity of an Owned Item within the Actor
   */
     async _onItemSubtractQuantity(event) {
      event.preventDefault();
      let anchor = $(event.currentTarget);
      const li = anchor.parents(".item");
      const itemId = li.data("itemId");
      const item = this.actor.getOwnedItem(itemId);
      const attr = "data.quantity";
      const currQuantity = getProperty(item.data, attr);
      // can't reduce quantity below one
      if (currQuantity > 1) {
        return item.update({[attr]: currQuantity - 1});  
      }
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

  _onFeatRoll(event) {
    event.preventDefault();
    const button = $(event.currentTarget);
    const li = button.parents(".item");
    const itemId = li.data("itemId");
    this.actor.useFeat(itemId);
  }

  _onWieldPowerRoll(event) {
    event.preventDefault();
    this.actor.wieldPower();
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
    return item.update({["data.tier.value"]: newTier});
  }

  /**
   * Handle a click on the Defend button.
   */
  _onDefendRoll(event) {
    event.preventDefault();
    const sheetData = this.getData();
    const armorItemId = sheetData.data.equippedArmor ? sheetData.data.equippedArmor._id : null;
    const shieldItemId = sheetData.data.equippedShield ? sheetData.data.equippedShield._id : null;
    this.actor.defend(armorItemId, shieldItemId);
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
