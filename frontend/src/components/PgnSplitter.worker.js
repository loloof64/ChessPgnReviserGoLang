function auxSplitPgn(pgnContent) {
  let results = [];
  const isOutOfGame = 0;
  const isInHeader = 1;
  const isInGame = 2;
  let status = isOutOfGame;
  let currentGame = "";
  const isAHeaderLine = (l) => l.startsWith("[");
  const isBlankLine = (l) => l.trim().length === 0;
  const lines = pgnContent.split(/\r?\n/);
  lines.forEach((l) => {
    switch (status) {
      case isOutOfGame:
        if (isAHeaderLine(l)) {
          status = isInHeader;
          currentGame += l + "\n";
        } else if (!isBlankLine(l)) {
          status = isInGame;
          currentGame += l + "\n";
        }
        break;
      case isInHeader:
        if (status === isInGame) {
          results.push(currentGame);
          currentGame = "";
        }
        if (isAHeaderLine(l)) {
          currentGame += l + "\n";
        } else if (isBlankLine(l)) {
          status = isInGame;
          currentGame += "\n";
        } else {
          currentGame += l + "\n";
        }
        break;

      case isInGame:
        if (isAHeaderLine(l)) {
          results.push(currentGame);
          currentGame = "";
          status = isInHeader;
          currentGame += l + "\n";
        } else if (isBlankLine(l)) {
          results.push(currentGame);
          currentGame = "";
          status = isOutOfGame;
        } else {
          currentGame += l + "\n";
        }
    }
  });
  if (currentGame.length > 0) results.push(currentGame);
  return results;
}

export default async function splitPgn(pgnContent) {
  let result = auxSplitPgn(pgnContent);
  return result;
};
