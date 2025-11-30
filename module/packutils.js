export async function documentFromPack(packName, docName) {
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
}

export async function drawFromTable(
  packName,
  tableName,
  formula = null,
  displayChat = false
) {
  const table = await documentFromPack(packName, tableName);
  if (!table) {
    console.log(`Could not load ${tableName} from pack ${packName}`);
    return;
  }
  const roll = formula ? new Roll(formula) : undefined;
  const tableDraw = await table.draw({ displayChat, roll });
  // TODO: decide if/how we want to handle multiple results
  return tableDraw;
}

export async function drawFromTableUuid(
  uuid,
  formula = null,
  displayChat = false
) {
  const table = await fromUuid(uuid);
  if (!table) {
    console.log(`Could not find table ${uuid}`);
    return;
  }
  const roll = formula ? new Roll(formula) : undefined;
  const tableDraw = await table.draw({ displayChat, roll });
  // TODO: decide if/how we want to handle multiple results
  return tableDraw;
}

export async function drawText(packName, tableName) {
  const draw = await drawFromTable(packName, tableName);
  if (draw) {
    // return draw.results[0].text;
    return draw.results[0].description;
  }
}

export async function drawTextFromTableUuid(uuid) {
  const draw = await drawFromTableUuid(uuid);
  if (draw) {
    // return draw.results[0].text;
    return draw.results[0].description;
  }
}

export async function drawDocument(packName, tableName) {
  const draw = await drawFromTable(packName, tableName);
  const doc = await documentFromDraw(draw);
  return doc;
}

export async function drawDocumentFromTableUuid(uuid) {
  const draw = await drawFromTableUuid(uuid);
  const doc = await documentFromDraw(draw);
  return doc;
}

export async function drawDocumentsFromTableUuid(uuid) {
  const draw = await drawFromTableUuid(uuid);
  const docs = await documentsFromDraw(draw);
  return docs;
}

export async function documentsFromDraw(draw) {
  const docResults = draw.results.filter(
    (r) => r.type === CONST.TABLE_RESULT_TYPES.DOCUMENT
  );
  return Promise.all(docResults.map((r) => documentFromResult(r)));
}

export async function documentFromDraw(draw) {
  const doc = await documentFromResult(draw.results[0]);
  return doc;
}

export async function documentFromResult(result) {
  if (!result.documentCollection) {
    console.log("No documentCollection for result; skipping", result);
    return;
  }
  const collectionName =
    result.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM
      ? "Compendium." + result.documentCollection
      : result.documentCollection;
  const uuid = `${collectionName}.${result.documentId}`;
  const doc = await fromUuid(uuid);

  if (!doc) {
    // console.log(`Could not find ${uuid}`);
    console.log(`Could not find ${result.documentCollection} ${result.text}`);
    console.log(result);
  }
  return doc;
}

export function dupeData(doc) {
  return {
    system: doc.system,
    img: doc.img,
    name: doc.name,
    type: doc.type,
  };
}
