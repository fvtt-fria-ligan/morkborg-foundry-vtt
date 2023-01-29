export class MBJournalSheet extends JournalSheet {
  /** @override */
  static get defaultOptions() {
    const options = super.defaultOptions;
    // ["sheet", "journal-sheet", "journal-entry"]
    // TODO: debug "morkborg" style killing journal display
    options.classes.push("mbjournal");
    return options;
  }
}
