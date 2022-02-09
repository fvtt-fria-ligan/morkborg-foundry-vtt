/**
 * @extends {Item}
 */
export class MBItem extends Item {
  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.data.img = this.data.img || CONST.DEFAULT_TOKEN;

    if (this.type === CONFIG.MB.itemTypes.armor) {
      this.data.data.damageReductionDie =
        CONFIG.MB.armorTiers[this.data.data.tier.value].damageReductionDie;
    }
  }

  /** @override */
  prepareActorItemDerivedData(actor) {
    if (actor.type === "character" || actor.type === "follower") {
      this.data.data.equippable = CONFIG.MB.equippableItemTypes.includes(
        this.type
      );
      this.data.data.droppable =
        CONFIG.MB.droppableItemTypes.includes(this.type) &&
        this.data.data.carryWeight !== 0;
    } else {
      this.data.data.equippable = false;
      this.data.data.droppable = false;
    }

    if (this.isContainer) {
      this.data.data.itemsData = this._getItemsData(actor);
      this.data.data.totalContainerSpace = this._getTotalContainerSpace(actor);
    }

    if (this.isEquipment) {
      this.container = this._getItemContainer(actor) || null;
      this.data.data.hasContainer = !!this.container;
      this.data.data.totalCarryWeight = this._getTotalCarryWeight(actor);
    }
  }

  get isContainer() {
    return this.type === CONFIG.MB.itemTypes.container;
  }

  get isEquipment() {
    return CONFIG.MB.itemEquipmentTypes.includes(this.type);
  }

  get isContainerizable() {
    return CONFIG.MB.allowedContainerItemTypes.includes(this.type);
  }

  get hasContainer() {
    return this.data.data.hasContainer;
  }

  get carried() {
    // this should be fixed in a migration
    if (this.data.data.carried === undefined) {
      return true; // all items are carried by default
    } else {
      if (this.data.data.carryWeight === 0) {
        // container with carryWeight are asumed to not be carried (donkey, etc)
        return false;
      }
      return this.data.data.carried;
    }
  }

  get equipped() {
    return this.data.data.equipped || false;
  }

  get carryWeight() {
    return this.data.data.carryWeight || 0;
  }

  get totalCarryWeight() {
    return this.data.data.totalCarryWeight || 0;
  }

  get containerSpace() {
    return this.data.data.containerSpace || 0;
  }

  get totalContainerSpace() {
    return this.data.data.totalContainerSpace || 0;
  }

  get totalSpace() {
    return (
      this.totalContainerSpace +
      Math.ceil(this.containerSpace * this.data.data.quantity)
    );
  }

  get quantity() {
    return this.data.data.quantity || 1;
  }

  get itemsData() {
    return this.data.data.itemsData || [];
  }

  get items() {
    return this.data.data.items || [];
  }

  get hasItems() {
    return this.items.length > 0;
  }

  async equip() {
    await this.update({ "data.equipped": true });
  }

  async unequip() {
    await this.update({ "data.equipped": false });
  }

  async carry() {
    await this.update({ "data.carried": true });
  }

  async drop() {
    await this.update({ "data.carried": false });
  }

  async addItem(itemId) {
    if (!this.items.includes(itemId)) {
      await this.update({ "data.items": [...this.items, itemId] });
    }
  }

  async removeItem(itemId) {
    const items = this.items.filter((item) => item !== itemId);
    await this.update({ "data.items": items });
  }

  async clearItems() {
    await this.update({ "data.items": [] });
  }

  _getTotalCarryWeight(actor) {
    if (this.isContainer) {
      return (
        this.items.reduce((weight, itemId) => {
          const item = actor.items.get(itemId);
          if (item) {
            weight += Math.ceil(item.carryWeight * item.quantity);
          }
          return weight;
        }, 0) + this.carryWeight
      );
    } else {
      return Math.ceil(this.carryWeight * this.quantity);
    }
  }

  _getTotalContainerSpace(actor) {
    return this.items.reduce((space, itemId) => {
      const item = actor.items.get(itemId);
      if (item) {
        space += Math.ceil(item.containerSpace * item.quantity);
      }
      return space;
    }, 0);
  }

  _getItemsData(actor) {
    return this.items.reduce((initial, itemId) => {
      const item = actor.items.get(itemId);
      if (item) {
        initial.push(item.data);
      }
      return initial;
    }, []);
  }

  _getItemContainer(actor) {
    return actor.items
      .filter((item) => item.isContainer)
      .find((item) => item.items.includes(this.id));
  }
}
