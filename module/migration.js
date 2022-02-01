export const migrateWorld = async () => {
  ui.notifications.info(
    `Applying MÖRK BORG System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`,
    { permanent: true }
  );
  await migrateActors();
  await migrateItems();
  // TODO: fix scene and compendium migration.
  // Our scene/token/actorData don't seem to align with dnd5e's, and that causes bad things to happen.
  //await migrateScenes();
  //await migrateCompendiums();
  game.settings.set(
    "morkborg",
    "systemMigrationVersion",
    game.system.data.version
  );
  ui.notifications.info(
    `MÖRK BORG System Migration to version ${game.system.data.version} completed!`,
    { permanent: true }
  );
};

const migrateActors = async () => {
  for (const a of game.actors.values()) {
    try {
      const updateData = migrateActorData(a.data);
      if (!isObjectEmpty(updateData)) {
        console.log(`Migrating Actor entity ${a.name}`);
        await a.update(updateData, { enforceTypes: false });
      }
      // TODO: don't do any cleaning for now
      // const cleanData = cleanActorData(a.data);
      // if (!isObjectEmpty(cleanData)) {
      //   console.log(`Cleaning Actor entity ${a.name}`);
      //   await a.update(cleanData, {enforceTypes: false});
      // }
    } catch (err) {
      err.message = `Failed migration for Actor ${a.name}: ${err.message}`;
      console.error(err);
    }
  }
};

const migrateActorData = (data) => {
  const updateData = {};
  if (data.data.hp && "current" in data.data.hp) {
    updateData["data.hp.value"] = data.data.hp.current;
  }
  if (
    data.data.abilities &&
    data.data.abilities.agility &&
    "score" in data.data.abilities.agility
  ) {
    updateData["data.abilities.agility.value"] =
      data.data.abilities.agility.score;
  }
  if (
    data.data.abilities &&
    data.data.abilities.presence &&
    "score" in data.data.abilities.presence
  ) {
    updateData["data.abilities.presence.value"] =
      data.data.abilities.presence.score;
  }
  if (
    data.data.abilities &&
    data.data.abilities.strength &&
    "score" in data.data.abilities.strength
  ) {
    updateData["data.abilities.strength.value"] =
      data.data.abilities.strength.score;
  }
  if (
    data.data.abilities &&
    data.data.abilities.toughness &&
    "score" in data.data.abilities.toughness
  ) {
    updateData["data.abilities.toughness.value"] =
      data.data.abilities.toughness.score;
  }
  if ("powerUsesRemaining" in data.data) {
    updateData["data.powerUses"] = {
      max: data.data.powerUsesRemaining,
      value: data.data.powerUsesRemaining,
    };
  }
  if ("miseries" in data.data && typeof data.data.miseries === "number") {
    updateData["data.miseries"] = { max: 7, value: data.data.miseries };
  }
  if ("omens" in data.data && typeof data.data.omens === "number") {
    updateData["data.omens"] = { max: data.data.omens, value: data.data.omens };
  }
  // Migrate Owned Items, if any
  if (data.items) {
    let hasItemUpdates = false;
    const items = data.items.map((i) => {
      // Migrate the Owned Item
      const itemUpdate = migrateItemData(i);
      // Update the Owned Item
      if (!isObjectEmpty(itemUpdate)) {
        hasItemUpdates = true;
        return mergeObject(i, itemUpdate, {
          enforceTypes: false,
          inplace: false,
        });
      } else {
        return i;
      }
    });
    if (hasItemUpdates) {
      updateData.items = items;
    }
  }
  return updateData;
};

// const cleanActorData = (data) => {
//   // Remove any fields from the data that don't appear in the model
//   const model = game.system.model.Actor[data.type];
//   data.data = filterObject(data.data, model);
//   // TODO: Scrub system flags?
//   return data;
// };

const migrateItems = async () => {
  for (const item of game.items.values()) {
    try {
      const updateData = migrateItemData(item.data);
      if (!isObjectEmpty(updateData)) {
        console.log(`Migrating Item entity ${item.name}`);
        await item.update(updateData, { enforceTypes: false });
      }
      // TODO: don't do any cleaning for now
      // const cleanData = cleanItemData(item.data);
      // if (!isObjectEmpty(cleanData)) {
      //   console.log(`Cleaning Item entity ${item.name}`);
      //   await item.update(cleanData, {enforceTypes: false});
      // }
    } catch (err) {
      err.message = `Failed migration for Item ${item.name}: ${err.message}`;
      console.error(err);
    }
  }
};

const migrateItemData = (data) => {
  const updateData = {};
  if (data.type === "armor") {
    if ("currentTier" in data.data && "maxTier" in data.data) {
      // switch tier to a resource-like structure
      // some maxTier values are stored as strings, so fix that too
      updateData["data.tier"] = {
        max: parseInt(data.data.maxTier),
        value: parseInt(data.data.currentTier),
      };
    }
  }
  return updateData;
};

// const cleanItemData = (data) => {
//   // Remove any fields from the data that don't appear in the model
//   const model = game.system.model.Item[data.type];
//   data.data = filterObject(data.data, model);
//   // TODO: Scrub system flags?
//   return data;
// };
