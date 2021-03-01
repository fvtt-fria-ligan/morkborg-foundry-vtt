export const migrateWorld = async () => {
    ui.notifications.info(`Applying MÖRK BORG System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, {permanent: true});
    await migrateActors();
    await migrateItems();
    await migrateScenes();
    await migrateCompendiums();

    game.settings.set("morkborg", "systemMigrationVersion", game.system.data.version);
    ui.notifications.info(`MÖRK BORG System Migration to version ${game.system.data.version} completed!`, {permanent: true});  
};

const migrateActors = async () => {
  for (let a of game.actors.entities) {
    try {
      const updateData = migrateActorData(a.data);
      if (!isObjectEmpty(updateData)) {
        console.log(`Migrating Actor entity ${a.name}`);
        await a.update(updateData, {enforceTypes: false});
      }
      const cleanData = cleanActorData(a.data);
      if (!isObjectEmpty(cleanData)) {
        console.log(`Cleaning Actor entity ${a.name}`);
        await a.update(cleanData, {enforceTypes: false});
      }
    } catch(err) {
      err.message = `Failed migration for Actor ${a.name}: ${err.message}`;
      console.error(err);
    }
  }
};

const migrateActorData = (data) => {
    const updateData = {};    
    if ("current" in data.data.hp) {
        updateData["data.hp.value"] = data.data.hp.current;
    }
    if ("score" in data.data.abilities.agility) {
        updateData["data.abilities.agility.value"] = data.data.abilities.agility.score;
    }
    if ("score" in data.data.abilities.presence) {
        updateData["data.abilities.presence.value"] = data.data.abilities.presence.score;
    }
    if ("score" in data.data.abilities.strength) {
        updateData["data.abilities.strength.value"] = data.data.abilities.strength.score;
    }
    if ("score" in data.data.abilities.toughness) {
        updateData["data.abilities.toughness.value"] = data.data.abilities.toughness.score;
    }
    if ("powerUsesRemaining" in data.data) {
        updateData["data.powerUses"] = {max: data.data.powerUsesRemaining, value: data.data.powerUsesRemaining};
    }
    if ("miseries" in data.data && typeof(data.data.miseries) === "number") {
        updateData["data.miseries"] = {max: 7, value: data.data.miseries};
    }
    if ("omens" in data.data && typeof(data.data.omens) === "number") {
        updateData["data.omens"] = {max: data.data.omens, value: data.data.omens};
    }
    // Migrate Owned Items, if any
    if (data.items) {
        let hasItemUpdates = false;
        const items = data.items.map(i => {  
            // Migrate the Owned Item
            let itemUpdate = migrateItemData(i);  
            // Update the Owned Item
            if (!isObjectEmpty(itemUpdate)) {
                hasItemUpdates = true;
                return mergeObject(i, itemUpdate, {enforceTypes: false, inplace: false});
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

const cleanActorData = (data) => {
  // Remove any fields from the data that don't appear in the model
  const model = game.system.model.Actor[data.type];
  data.data = filterObject(data.data, model);
  // TODO: Scrub system flags?
  return data;
};

const migrateItems = async () => {
    for (let item of game.items.entities) {
        try {
          const updateData = migrateItemData(item.data);
          if (!isObjectEmpty(updateData)) {
            console.log(`Migrating Item entity ${item.name}`);
            await item.update(updateData, {enforceTypes: false});
          }
          const cleanData = cleanItemData(item.data);
          if (!isObjectEmpty(cleanData)) {
            console.log(`Cleaning Item entity ${item.name}`);
          }
        } catch(err) {
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
            updateData["data.tier"] = {max: parseInt(data.data.maxTier), value: parseInt(data.data.currentTier)};
        }
    }
    return updateData;
};

const cleanItemData = (data) => {
  // Remove any fields from the data that don't appear in the model
  const model = game.system.model.Item[data.type];
  data.data = filterObject(data.data, model);
  // TODO: Scrub system flags?
  return data;  
};

const migrateScenes = async () => {
    // Migrate Actor Override Tokens
    for (let s of game.scenes.entities) {
        try {
          const updateData = migrateSceneData(s.data);
          if (!isObjectEmpty(updateData)) {
            console.log(`Migrating Scene entity ${s.name}`);
            await s.update(updateData, {enforceTypes: false});
          }
        } catch(err) {
          err.message = `Failed migration for Scene ${s.name}: ${err.message}`;
          console.error(err);
        }
    }
};
  
const migrateSceneData = (data) => {
    const tokens = duplicate(data.tokens);
    return {
        // migrate actor tokens
        tokens: tokens.map(t => {
        if (!t.actorId || t.actorLink || !t.actorData.data) {
          t.actorData = {};
          return t;
        }
        const token = new Token(t);
        if (!token.actor) {
          t.actorId = null;
          t.actorData = {};
        } else if (!t.actorLink) {
          const updateData = migrateActorData(token.data.actorData);
          t.actorData = mergeObject(token.data.actorData, updateData);
        }
        return t;
      })
    };    
}

const migrateCompendiums = async () => {
  // Migrate World Compendium Packs
  for (let p of game.packs) {
    if (p.metadata.package !== "world") {
        continue;
    }
    if (!["Actor", "Item", "Scene"].includes(p.metadata.entity)){
        continue;
    }
    await migrateCompendium(p);
  }
};

const migrateCompendium = (pack) => {
    const entity = pack.metadata.entity;
    if (!["Actor", "Item", "Scene"].includes(entity)) {
        return;
    }
  
    // Unlock the pack for editing
    const wasLocked = pack.locked;
    await pack.configure({locked: false});
  
    // Begin by requesting server-side data model migration and get the migrated content
    await pack.migrate();
    const content = await pack.getContent();
  
    // Iterate over compendium entries - applying fine-tuned migration functions
    for (let ent of content) {
      let updateData = {};
      try {
        switch (entity) {
          case "Actor":
            updateData = migrateActorData(ent.data);
            break;
          case "Item":
            updateData = migrateItemData(ent.data);
            break;
          case "Scene":
            updateData = migrateSceneData(ent.data);
            break;
        }
        if (isObjectEmpty(updateData)) {
            continue;
        }
  
        // Save the entry, if data was changed
        updateData["_id"] = ent._id;
        await pack.updateEntity(updateData);
        console.log(`Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`);
      }
  
      // Handle migration failures
      catch(err) {
        err.message = `Failed migration for entity ${ent.name} in pack ${pack.collection}: ${err.message}`;
        console.error(err);
      }
    }
  
    // Apply the original locked status for the pack
    pack.configure({locked: wasLocked});
    console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
};
  