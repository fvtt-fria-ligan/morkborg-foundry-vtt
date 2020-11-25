
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
      default:
        break;
    }
  }

  /** @override */
  getRollData() {
    const data = super.getRollData();
    // TODO
    return data;
  }
}
