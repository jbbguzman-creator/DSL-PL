const TOKEN_RULES = [
  { type: "KEYWORD", regex: /^(let|const|var|for|if|else)\b/ },
  { type: "REL_OP", regex: /^(<=|>=|==|!=|<|>)/ },
  { type: "ASSIGN", regex: /^=/ },
  { type: "POWER", regex: /^\^/ },
  { type: "ADD", regex: /^\+/ },
  { type: "SUB", regex: /^-/ },
  { type: "MULT", regex: /^\*/ },
  { type: "DIV", regex: /^\// },
  { type: "LPAREN", regex: /^\(/ },   { type: "RPAREN", regex: /^\)/ },
  { type: "LBRACE", regex: /^\{/ },
  { type: "RBRACE", regex: /^\}/ },
  { type: "LBRACKET", regex: /^\[/ },   { type: "RBRACKET", regex: /^\]/ },
  { type: "COMMA", regex: /^,/ },
  { type: "NUMBER", regex: /^(\d+(\.\d+)?|\.\d+)/ },
  { type: "IDENTIFIER", regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
  { type: "TERMINATOR", regex: /^;/ },
  { type: "SPACE", regex: /^\s+/ }
];

function tokenize(input) {
  const tokens = [];
  let cursor = 0;

  while (cursor < input.length) {
    const substring = input.slice(cursor);
    let matched = false;

    for (const rule of TOKEN_RULES) {
      const match = rule.regex.exec(substring);
      if (match) {
        matched = true;
        cursor += match[0].length;
        if (rule.type !== "SPACE") {
          tokens.push({ type: rule.type, value: match[0] });
        }
        break;
      }
    }

    if (!matched) {
      throw new Error(`Unexpected character at position ${cursor}: '${input[cursor]}'`);
    }
  }

  tokens.push({ type: "EOF", value: "" });
  return tokens;
}

module.exports = { tokenize };