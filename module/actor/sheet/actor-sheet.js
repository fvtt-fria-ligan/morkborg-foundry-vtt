import * as editor from "../../editor.js";
import { rollIndividualInitiative, rollPartyInitiative } from "../../combat.js";

/**
 * @extends {ActorSheet}
 */
export default class MBActorSheet extends ActorSheet {
  /** @override */
  activateEditor(name, options = {}, initialContent = "") {
    editor.setCustomEditorOptions(options);
    super.activateEditor(name, options, initialContent);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find(".item-create").click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find(".item-delete").click(this._onItemDelete.bind(this));

    // Additional item/inventory buttons
    html.find(".item-qty-plus").click(this._onItemAddQuantity.bind(this));
    html.find(".item-qty-minus").click(this._onItemSubtractQuantity.bind(this));
    html
      .find(".item-toggle-equipped")
      .click(this._onToggleEquippedItem.bind(this));
    html
      .find(".item-toggle-carried")
      .click(this._onToggleCarriedItem.bind(this));

    // Violence-related buttons
    html
      .find(".party-initiative-button")
      .on("click", this._onPartyInitiativeRoll.bind(this));
    html
      .find(".individual-initiative-button")
      .on("click", this._onIndividualInitiativeRoll.bind(this));
    html.find(".attack-button").on("click", this._onAttackRoll.bind(this));
    html.find(".defend-button").on("click", this._onDefendRoll.bind(this));
    html.find(".tier-radio").click(this._onArmorTierRadio.bind(this));
    html.find("select.ammo-select").on("change", this._onAmmoSelect.bind(this));
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
    const dialogData = {
      config: CONFIG.MorkBorg,
    };
    const html = await renderTemplate(template, dialogData);
    return new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("MB.CreateNewItem"),
        content: html,
        buttons: {
          create: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("MB.CreateNewItem"),
            callback: (html) =>
              resolve(_createItem(this.actor, html[0].querySelector("form"))),
          },
        },
        default: "create",
        close: () => resolve(null),
      }).render(true);
    });
  }

  /**
   * Handle the deletion of item
   */
  async _onItemDelete(event) {
    event.preventDefault();
    const anchor = $(event.currentTarget);
    const li = anchor.parents(".item");
    const itemId = li.data("itemId");
    const item = this.actor.items.get(itemId);
    if (item.isContainer && item.hasItems) {
      Dialog.confirm({
        title: game.i18n.localize("MB.ItemDelete"),
        content: "<p>" + game.i18n.localize("MB.ItemDeleteMessage") + "</p>",
        yes: async () => {
          await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
        },
        defaultYes: false,
      });
    } else {
      await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
      li.slideUp(200, () => this.render(false));
    }
  }

  /**
   * Handle adding quantity of an Owned Item within the Actor
   */
  async _onItemAddQuantity(event) {
    event.preventDefault();
    const anchor = $(event.currentTarget);
    const li = anchor.parents(".item");
    const itemId = li.data("itemId");
    const item = this.actor.items.get(itemId);
    await item.incrementQuantity();
  }

  /**
   * Handle subtracting quantity of an Owned Item within the Actor
   */
  async _onItemSubtractQuantity(event) {
    event.preventDefault();
    const anchor = $(event.currentTarget);
    const li = anchor.parents(".item");
    const itemId = li.data("itemId");
    const item = this.actor.items.get(itemId);
    await item.decrementQuantity();
  }

  /**
   * Handle toggling the equipped state of an Owned Item within the Actor
   *
   * @param {Event} event   The triggering click event
   * @private
   */
  async _onToggleEquippedItem(event) {
    event.preventDefault();
    const anchor = $(event.currentTarget);
    const li = anchor.parents(".item");
    const itemId = li.data("itemId");
    const item = this.actor.items.get(itemId);

    if (item.system.equipped) {
      await this.actor.unequipItem(item);
    } else {
      await this.actor.equipItem(item);
    }
  }

  /**
   * Handle toggling the carried state of an Owned Item within the Actor
   *
   * @param {Event} event   The triggering click event
   * @private
   */
  async _onToggleCarriedItem(event) {
    event.preventDefault();
    const anchor = $(event.currentTarget);
    const li = anchor.parents(".item");
    const itemId = li.data("itemId");
    const item = this.actor.items.get(itemId);
    if (item.system.carried) {
      await item.drop();
    } else {
      await item.carry();
    }
  }

  /**
   * Listen for roll buttons on items.
   *
   * @param {MouseEvent} event    The originating left click event
   */
  _onItemRoll(event) {
    event.preventDefault();
    const button = $(event.currentTarget);
    const r = new Roll(button.data("roll"), this.actor.getRollData());
    const li = button.parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    r.roll().toMessage({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3>`,
    });
  }

  /**
   * Handle a click on the Party Initiative button.
   */
  async _onPartyInitiativeRoll(event) {
    event.preventDefault();
    rollPartyInitiative();
  }

  /**
   * Handle a click on the Individual Initiative button.
   */
  async _onIndividualInitiativeRoll(event) {
    event.preventDefault();
    rollIndividualInitiative(this.actor);
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
    const input = $(event.currentTarget);
    const newTier = parseInt(input[0].value);
    const li = input.parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    return item.update({ ["system.tier.value"]: newTier });
  }

  /**
   * Handle a click on the Defend button.
   */
  _onDefendRoll(event) {
    event.preventDefault();
    const sheetData = this.getData();
    const armorItemId = sheetData.data.equippedArmor
      ? sheetData.data.equippedArmor.id
      : null;
    const shieldItemId = sheetData.data.equippedShield
      ? sheetData.data.equippedShield.id
      : null;
    this.actor.defend(armorItemId, shieldItemId);
  }

  _onInlineEdit(event) {
    event.preventDefault();
    const row = $(event.currentTarget).parents(".item");
    if (row) {
      const item = this.actor.items.get(row.data("itemId"));
      if (item) {
        const temp = event.currentTarget.dataset.mod;
        return item.update({ [temp]: event.currentTarget.value }, {});
      }
    }
  }

  /** @override */
  async _onDropItem(event, itemData) {
    const item = ((await super._onDropItem(event, itemData)) || []).pop();
    if (!item) return;

    const target = this._findDropTargetItem(event);
    const originalActor = game.actors.get(itemData.actorId);
    const originalItem = originalActor
      ? originalActor.items.get(itemData.data._id)
      : null;
    const isContainer = originalItem && originalItem.isContainer;

    await this._cleanDroppedItem(item);

    if (isContainer) {
      item.clearItems();
      const newItems = await this.actor.createEmbeddedDocuments(
        "Item",
        originalItem.system.itemsData
      );
      await this._addItemsToItemContainer(newItems, item);
    }

    if (originalItem) {
      await originalActor.deleteEmbeddedDocuments("Item", [originalItem.id]);
    }

    if (target) {
      await this._handleDropOnItemContainer(item, target);
    }
  }

  /** @override */
  async _onSortItem(event, itemData) {
    const item = this.actor.items.get(itemData._id);
    const target = this._findDropTargetItem(event);
    if (target) {
      await this._handleDropOnItemContainer(item, target);
    } else {
      await this._removeItemFromItemContainer(item);
    }
    await super._onSortItem(event, itemData);
  }

  _findDropTargetItem(event) {
    const dropIntoItem = $(event.srcElement).closest(".item");
    return dropIntoItem.length > 0
      ? this.actor.items.get(dropIntoItem.attr("data-item-id"))
      : null;
  }

  async _cleanDroppedItem(item) {
    if (item.system.equipped) {
      await item.unequip();
    }
    if (!item.system.carried) {
      await item.carry();
    }
  }

  async _handleDropOnItemContainer(item, target) {
    if (item.isContainerizable) {
      if (target.isContainer) {
        // dropping into a container
        await this._addItemsToItemContainer([item], target);
      } else if (target.hasContainer) {
        // dropping into an item in a container
        await this._addItemsToItemContainer([item], target.container);
      } else {
        // dropping into a normal item
        await this._removeItemFromItemContainer(item);
      }
    }
  }

  async _addItemsToItemContainer(items, container) {
    for (const item of items) {
      if (item.container && container.id !== item.container.id) {
        // transfert container
        await item.container.removeItem(item.id);
      }
      if (item.equipped) {
        // unequip the item
        await item.unequip();
      }
      await container.addItem(item.id);
    }
  }

  async _removeItemFromItemContainer(item) {
    if (item.container) {
      await item.container.removeItem(item.id);
    }
  }

  async _onAmmoSelect(event) {
    event.preventDefault();
    const select = $(event.currentTarget);
    const weapon = this.actor.items.get(select.data("itemId"));
    //const ammo = this.actor.items.get(select.val());
    if (weapon) {
      await weapon.update({ ["system.ammoId"]: select.val() });
    }
  }
}

/**
 * Create a new Owned Item for the given actor, based on the name/type from the form.
 */
const _createItem = async (actor, form) => {
  const itemData = {
    name: form.itemname.value,
    type: form.itemtype.value,
    data: {},
  };
  await actor.createEmbeddedDocuments("Item", [itemData]);
};
