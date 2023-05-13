export const documentFromPack = async (packName, docName) => {
  const pack = game.packs.get(packName);
  if (!pack) {
    console.error(`Could not find pack ${packName}.`);
    return;
  }
  const docs = await pack.getDocuments();
  const doc = docs.find((i) => i.name === docName);
  if (!doc) {
    console.error(`Could not find doc ${docName} in pack ${packName}.`);
  }
  return doc;
};

export const drawFromTable = async (
  packName,
  tableName,
  formula = null,
  displayChat = false
) => {
  const table = await documentFromPack(packName, tableName);
  if (!table) {
    console.log(`Could not load ${tableName} from pack ${packName}`);
    return;
  }
  const roll = formula ? new Roll(formula) : undefined;
  const tableDraw = await table.draw({ displayChat, roll });
  // TODO: decide if/how we want to handle multiple results
  return tableDraw;
};

export const drawText = async (packName, tableName) => {
  const draw = await drawFromTable(packName, tableName);
  if (draw) {
    return draw.results[0].text;
  }
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
  if (!result.documentCollection) {
    console.log("No documentCollection for result; skipping");
    return;
  }
  const collectionName =
    result.type === 2
      ? "Compendium." + result.documentCollection
      : result.documentCollection;
  const uuid = `${collectionName}.${result.documentId}`;
  const doc = await fromUuid(uuid);
  if (!doc) {
    console.log(`Could not find ${uuid}`);
    console.log(result);
  }
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
