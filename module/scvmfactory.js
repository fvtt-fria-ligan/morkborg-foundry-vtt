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
    const packName = classPacks[Math.floor(Math.random() * classPacks.length)];
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
};