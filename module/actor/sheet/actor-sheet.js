import * as editor from "../../editor.js";

/**
 * @extends {ActorSheet}
 */
export default class MBActorSheet extends ActorSheet {
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

    // Additional item/inventory buttons
    html.find('.item-qty-plus').click(this._onItemAddQuantity.bind(this));
    html.find('.item-qty-minus').click(this._onItemSubtractQuantity.bind(this));
    html.find('.item-toggle').click(this._onToggleItem.bind(this));

    // Violence-related buttons
    html.find(".attack-button").on("click", this._onAttackRoll.bind(this));
    html.find(".defend-button").on("click", this._onDefendRoll.bind(this));
    html.find('.tier-radio').click(this._onArmorTierRadio.bind(this));    
  }

  /**
   * Handle creating a new Owned Item for the actor.
   *
   * @param {Event} event   The originating click event
   * @private
   */
   async _onItemCreate(event) {
    event.preventDefault();
    const template = "systems/morkborg/templates/dialog/add-item-dialog.html";
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
   * Handle a click on an item Attack button.
   */
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
