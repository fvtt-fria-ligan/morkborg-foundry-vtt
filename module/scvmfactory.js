import {MBActorSheetCharacter} from "./character-sheet.js";
import {MBItem} from "./item.js";
import {randomName} from "./names.js";

export const createScvm = async () => {
    console.log("***** SCVM FACTORY *****")
    const clazz = await pickRandomClass();
    const scvm = createActorWithClass(clazz);
};

const pickRandomClass = async () => {
    const classPacks = findClassPacks();
    if (classPacks.length === 0) {
        // TODO: error on 0-length classPaths
        return;
    }
    // TODO: debugging
    //const packName = classPacks[Math.floor(Math.random() * classPacks.length)];
//    const packName = "morkborg.class-classless-adventurer";
    const packName = "morkborg.class-fanged-deserter";
    
    const pack = game.packs.get(packName);
    let content = await pack.getContent();
    return content.find(i => i.data.type === "class");
};

const findClassPacks = () => {
    const classPacks = [];
    const packKeys = game.packs.keys();
    for (const packKey of packKeys) {
        // moduleOrSystemName.packName
        const packName = packKey.split(".")[1];
        if (packName.startsWith("class-")) {
            // class pack
            classPacks.push(packKey);
        }
    }
    return classPacks;
};

const createActorWithClass = async (clazz) => {
    console.log(`Creating new ${clazz.data.name}`);

    const silverRoll = new Roll(clazz.data.data.startingSilver).evaluate();
    const omensRoll = new Roll(clazz.data.data.omenDie).evaluate();
    const hpRoll = new Roll(clazz.data.data.startingHitPoints).evaluate();
    const powerUsesRoll = new Roll("1d4").evaluate();

    const strRoll = new Roll(clazz.data.data.startingStrength).evaluate();
    const strength = abilityBonus(strRoll.total);
    const agiRoll = new Roll(clazz.data.data.startingAgility).evaluate();
    const agility = abilityBonus(agiRoll.total);
    const preRoll = new Roll(clazz.data.data.startingPresence).evaluate();
    const presence = abilityBonus(preRoll.total);
    const touRoll = new Roll(clazz.data.data.startingToughness).evaluate();
    const toughness = abilityBonus(touRoll.total);

    const pack = game.packs.get('morkborg.character-creation');
    const content = await pack.getContent();
    const equipTable1 = content.find(i => i.name === 'You are What You Own (1)');
    const equipTable2 = content.find(i => i.name === 'You are What You Own (2)');
    const equipTable3 = content.find(i => i.name === 'You are What You Own (3)');
    const eqDraw1 = await equipTable1.draw({displayChat: false});
    const eqDraw2 = await equipTable2.draw({displayChat: false});
    const eqDraw3 = await equipTable3.draw({displayChat: false});

    const eq1 = await entitiesFromResults(eqDraw1.results);
    const eq2 = await entitiesFromResults(eqDraw2.results);
    const eq3 = await entitiesFromResults(eqDraw3.results);
    let allEq = [].concat(eq1, eq2, eq3);

    // starting weapon
    let weaponRoll = new Roll(clazz.data.data.weaponTableDie);
    const rolledScroll = allEq.filter(i => i.data.type === "scroll").length > 0;
    if (rolledScroll) {
        // TODO: should only the classless adventurer get gimped down to d6?
        if (weaponRoll === "1d10") {
            weaponRoll = "1d6";
        }
    }
    const weaponTable = content.find(i => i.name === 'Starting Weapon');
    const weaponDraw = await weaponTable.draw({roll: weaponRoll, displayChat: false});
    const weapons = await entitiesFromResults(weaponDraw.results);

    // starting armor
    const armorRoll = new Roll(clazz.data.data.armorTableDie);
    const armorTable = content.find(i => i.name === 'Starting Armor');
    const armorDraw = await armorTable.draw({roll: armorRoll, displayChat: false});
    const armors = await entitiesFromResults(armorDraw.results);

    // starting items
    const startingItems = [];
    if (clazz.data.data.startingItems) {
        const lines = clazz.data.data.startingItems.split("\n");
        for (const line of lines) {
            const [packName, itemName] = line.split(",");
            const pack = game.packs.get(packName);
            if (pack) {
                const content = await pack.getContent();
                const item = content.find(i => i.data.name === itemName);
                if (item) {
                    startingItems.push(item);
                }    
            }
        }
    }

    // add non-items as description flavor text
    const descriptionLines = [];
    descriptionLines.push(clazz.data.data.description);
    descriptionLines.push("<p>&nbsp;</p>");
    
    // starting rolls
    const startingRollItems = [];
    if (clazz.data.data.startingRolls) {
        const lines = clazz.data.data.startingRolls.split("\n");
        for (const line of lines) {
            console.log(line);
            const [packName, tableName, rolls] = line.split(",");
            const numRolls = parseInt(rolls);
            const pack = game.packs.get(packName);
            if (pack) {
                const content = await pack.getContent();
                const table = content.find(i => i.name === tableName);
                if (table) {
                    // TODO: handle number of rolls
                    const tableDraw = await table.draw({displayChat: false});
                    //const items = await entitiesFromResults(tableDraw.results);
                    //startingRollItems.push(...items); 
                    for (const result of tableDraw.results) {                        
                        // draw result type: text (0), entity (1), or compendium (2)
                        if (result.type === 0) {
                            // text
                            if (table.data.description) {
                                descriptionLines.push(`<p>${table.data.description}: ${result.text}</p>`);
                            } else {
                                descriptionLines.push(`<p>${table.name}: ${result.text}</p>`);
                            }
                        } else if (result.type === 1) {
                            // entity
                            // TODO: what do we want to do here?
                        } else if (result.type === 2) {
                            const entity = entityFromResult(result);
                            startingRollItems.push(entity);
                        }
                    }
                }
            }
        }
    }

    const ents = [].concat(eq1, eq2, eq3, weapons, armors, startingItems, startingRollItems);

    // add items as owned items
    const items = ents.filter(e => e instanceof MBItem);

    const nonItems = ents.filter(e => !(e instanceof MBItem));
    for (const nonItem of nonItems) {
        //console.log(nonItem);
    }


    // for actors, just add some flavor text to description
    // console.log(item);
    // if (item.data.type === "Follower") {
    //     // TODO: localize
    //     return `You have a follower: ${item.data.description}`;
    // } else {
    //     // add to owned items
    //     return item;
    // }

    let actor = await Actor.create({
        name: randomName(),
        img: clazz.img,
        type: "character",
        // folder: folder.data._id,
        // sort: 12000,
        data: {
            abilities: {
                strength: { value: strength },
                agility: { value: agility },
                presence: { value: presence },
                toughness: { value: toughness },
            },
            description: descriptionLines.join(""),
            hp: {
                max: hpRoll.total + toughness,
                value: hpRoll.total + toughness,
            },
            omens: {
                max: omensRoll.total,
                value: omensRoll.total,
            },
            powerUses: {
                max: powerUsesRoll.total + presence,
                value: powerUsesRoll.total + presence,
            },
            silver: silverRoll.total,
        },
        token: {
            img: clazz.img,
        },
        items: items,
        flags: {}
      });
      // TODO: fix onActorCreate hook so we don't have to do this class-overwrite after
      actor.createEmbeddedEntity("OwnedItem", duplicate(clazz.data));
      actor.sheet.render(true);
};

const entitiesFromResults = async (results) => {
    const ents = [];
    for (let result of results) {
        const entity = await entityFromResult(result);
        if (entity) {            
            ents.push(entity);
        }
    }
    return ents;
}

const entityFromResult = async (result) => {
    // {
    //     "_id": "7zhVYYsOyl39p64R",
    //     "flags": {},
    //     "type": 2,
    //     "text": "Donkey",
    //     "img": "systems/morkborg/icons/items/containers/donkey.png",
    //     "collection": "morkborg.equipment-misc",
    //     "resultId": "xZrAhOxxJSj2czwp",
    //     "weight": 1,
    //     "range": [
    //         6,
    //         6
    //     ],
    //     "drawn": false
    // }

    // draw result type: text (0), entity (1), or compendium (2)
    // TODO: figure out how we want to handle an entity result

    // TODO: handle scroll lookup / rolls
    // TODO: can we make a recursive random scroll thingy

    if (result.type === 2) {
        // grab the item from the compendium
        const collection = game.packs.get(result.collection);
        // TODO: should we use pack.getEntity(entryId) ?
        // const item = await collection.getEntity(result._id);
        const content = await collection.getContent();
        const entity = content.find(i => i.name === result.text);
        return entity;
    }
};

const abilityBonus = (rollTotal) => {
    if (rollTotal <= 4) {
        return -3;
    } else if (rollTotal <= 6) {
        return -2;
    } else if (rollTotal <= 8) {
        return -1;        
    } else if (rollTotal <= 12) {
        return 0;
    } else if (rollTotal <= 14) {
        return 1;
    } else if (rollTotal <= 16) {
        return 2;
    } else {
        // 17 - 20+
        return 3;
    }
};