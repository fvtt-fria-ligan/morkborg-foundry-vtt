export const documentFromPack = async (packName, docName) => {
  const pack = game.packs.get(packName);
  if (!pack) {
    console.error("Could not find pack ${packName}.");
    return;
  }
  const docs = await pack.getDocuments();
  const doc = docs.find((i) => i.name === docName);
  if (!doc) {
    console.error("Could not find doc ${docName} in pack ${packName}.");
  }
  return doc;
};

export const drawFromTable = async (packName, tableName, formula) => {
  const table = await documentFromPack(packName, tableName);
  const roll = formula ? new Roll(formula) : undefined;
  const tableDraw = await table.draw({ displayChat: false, roll });
  // TODO: decide if/how we want to handle multiple results
  return tableDraw;
};

export const drawText = async (packName, tableName) => {
  const draw = await drawFromTable(packName, tableName);
  return draw.results[0].system.text;
};

export const drawDocument = async (packName, tableName) => {
  const draw = await drawFromTable(packName, tableName);
  const doc = await documentFromDraw(draw);
  return doc;
};

export const drawDocuments = async (packName, tableName) => {
  const draw = await drawFromTable(packName, tableName);
  const docs = await documentsFromDraw(draw);
  return docs;
};

export const documentsFromDraw = async (draw) => {
  const docResults = draw.results.filter((r) => r.type === 2);
  return Promise.all(docResults.map((r) => documentFromResult(r)));
};

export const documentFromDraw = async (draw) => {
  const doc = await documentFromResult(draw.results[0]);
  return doc;
};

export const documentFromResult = async (result) => {
  if (!result.system.collection) {
    console.log("No system.collection for result; skipping");
    return;
  }
  const collectionName =
    result.type === 2
      ? "Compendium." + result.system.collection
      : result.system.collection;
  const uuid = `${collectionName}.${result.system.resultId}`;
  const doc = await fromUuid(uuid);
  return doc;
};

export const dupeData = (doc) => {
  return {
    data: doc.system,
    img: doc.img,
    name: doc.name,
    type: doc.type,
  };
};
