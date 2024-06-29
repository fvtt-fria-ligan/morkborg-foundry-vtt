export async function dumpUuids(compendiumName) {
  const compendium = game.packs.get(compendiumName);
  const docs = await compendium.getDocuments();
  // e.g., @UUID[Compendium.world.location-pad-tables.ODiAETsokDxKvNHN]{Some containers hide}
  //console.log(docs);
  const arr = Array.from(docs);
  arr.sort((a, b) => a.name.localeCompare(b.name));
  const uuids = arr.map((x) => x.link);
  console.log(uuids.join("\n"));
};

// export const exportSubfoldersToCompendium = async (folderType, folderName, compendiumName, nukeFirst=true, updateByName=false) => {
//   const rootFolder = findFolder(folderType, folderName);
//   const compendium = findCompendium(compendiumName);
//   if (!rootFolder || !compendium) {
//     // TODO: show error notification
//     return;
//   }
//   //
//   if (nukeFirst) {
//     const docs = await compendium.getDocuments();
//     for (const doc of docs) {
//       await doc.delete();
//     }
//   }
//   for (let child of rootFolder.children) {
//     if (child.folder) {
//       await child.folder.exportToCompendium(compendium, {updateByName, keepId: true});
//     }
//   }
// };
