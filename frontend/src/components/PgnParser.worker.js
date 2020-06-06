const pgnParser = require("pgn-parser");

export const parsePgn = async (pgnContent) => {
    let result = pgnParser.parse(pgnContent);
    return result;
};
