export class MBJournalSheet extends JournalSheet {
  /** @override */
  static get defaultOptions() {
    const options = super.defaultOptions;
    // classes from super: ["sheet", "journal-sheet", "journal-entry"]
    options.classes.push("crysborg");
    return options;
  }
}
