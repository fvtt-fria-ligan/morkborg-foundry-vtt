/**
 * @extends {Item}
 */
export class MBItem extends Item {
  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.img = this.img || CONST.DEFAULT_TOKEN;

    if (this.type === CONFIG.MB.itemTypes.armor) {
      this.system.damageReductionDie =
        CONFIG.MB.armorTiers[this.system.tier.value].damageReductionDie;
    }
  }

  /** @override */
  prepareActorItemDerivedData(actor) {
    if (actor.type === "character" || actor.type === "follower") {
      this.system.equippable = CONFIG.MB.equippableItemTypes.includes(
        this.type
      );
      this.system.droppable =
        CONFIG.MB.droppableItemTypes.includes(this.type) &&
        this.system.carryWeight !== 0;
      this.system.canPlusMinus = CONFIG.MB.plusMinusItemTypes.includes(
        this.type
      );
    } else {
      this.system.equippable = false;
      this.system.droppable = false;
    }

    if (this.isContainer) {
      this.system.itemsData = this._getItemsData(actor);
      this.system.totalContainerSpace = this._getTotalContainerSpace(actor);
    }

    if (this.isEquipment) {
      this.container = this._getItemContainer(actor) || null;
      this.system.hasContainer = !!this.container;
      this.system.totalCarryWeight = this._getTotalCarryWeight(actor);
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
    return this.system.hasContainer;
  }

  get carried() {
    // this should be fixed in a migration
    if (this.system.carried === undefined) {
      return true; // all items are carried by default
    } else {
      if (this.system.carryWeight === 0) {
        // container with carryWeight are assumed to not be carried (donkey, etc)
        return false;
      }
      return this.system.carried;
    }
  }

  get equipped() {
    return this.system.equipped || false;
  }

  get carryWeight() {
    return this.system.carryWeight || 0;
  }

  get totalCarryWeight() {
    return this.system.totalCarryWeight || 0;
  }

  get containerSpace() {
    return this.system.containerSpace || 0;
  }

  get totalContainerSpace() {
    return this.system.totalContainerSpace || 0;
  }

  get totalSpace() {
    return (
      this.totalContainerSpace +
      Math.ceil(this.containerSpace * this.system.quantity)
    );
  }

  get quantity() {
    return this.system.quantity || 1;
  }

  get itemsData() {
    return this.system.itemsData || [];
  }

  get items() {
    return this.system.items || [];
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

  async toggleCarried() {
    if (this.carried) {
      await this.drop();
    } else {
      await this.carry();
    }
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
        initial.push(item);
      }
      return initial;
    }, []);
  }

  _getItemContainer(actor) {
    return actor.items
      .filter((item) => item.isContainer)
      .find((item) => item.items.includes(this.id));
  }

  async incrementQuantity() {
    await this.update({ ["data.quantity"]: this.system.quantity + 1 });
  }

  async decrementQuantity() {
    // can't reduce quantity below one
    if (this.system.quantity > 1) {
      return this.update({ ["data.quantity"]: this.system.quantity - 1 });
    }
  }
}
