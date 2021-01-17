
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
  async prepareEmbeddedEntities() {
    super.prepareEmbeddedEntities();

    // TODO: overriding createEmbeddedEntity() didn't seem to get called,
    // so doing this class/item cleanup here
    const classes = this.items.filter(i => i.data.type === "class");
    // sort by sort field
    classes.sort((a, b) => (a.sort > b.sort) ? 1 : ((b.sort > a.sort) ? -1 : 0));
    // keep our last one
    classes.pop();
    // delete all the other class items
    const deletions = classes.map(i => i._id);
    const deleted = await this.deleteEmbeddedEntity("OwnedItem", deletions);
  }

  /** @override */
  getRollData() {
    const data = super.getRollData();
    return data;
  }
}
