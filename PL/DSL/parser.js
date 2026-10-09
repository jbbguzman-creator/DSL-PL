class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.cursor = 0;
  }

  Peek() {
    return this.tokens[this.cursor] || { type: "EOF", value: "" };
  }

  Consume(expectedType, expectedValue = null) {
    const token = this.Peek();
    if (token.type !== expectedType || (expectedValue && token.value !== expectedValue)) {
      throw new Error(`Unexpected token: Expected ${expectedType} (${expectedValue || ''}), got ${token.type} (${token.value})`);
    }
    this.cursor++;
    return token;
  }

  Parse_Program() {
    const statements = [];
    while (this.Peek().type !== "EOF" && this.Peek().type !== "RBRACE") {
      statements.push(this.Parse_Statement());
    }
    return { type: "Program", body: statements };
  }

  Parse_Statement() {
    const current = this.Peek();

    if (current.type === "KEYWORD" && current.value === "if") {
      return this.Parse_If();
    }
    if (current.type === "KEYWORD" && current.value === "for") {
      return this.Parse_For();
    }
    if (current.type === "KEYWORD" && ["let", "var", "const"].includes(current.value)) {
      this.Consume("KEYWORD");
      const name = this.Consume("IDENTIFIER").value;
      this.Consume("ASSIGN");
      const init = this.Parse_Expression();
      if (this.Peek().type === "TERMINATOR") this.Consume("TERMINATOR");
      return { type: "VarDeclaration", name, init };
    }

    const expr = this.Parse_Expression();
    if (this.Peek().type === "TERMINATOR") this.Consume("TERMINATOR");
    return expr;
  }

  Parse_If() {
    this.Consume("KEYWORD", "if");
    this.Consume("LPAREN");
    const test = this.Parse_Expression();
    this.Consume("RPAREN");
    const consequent = this.Parse_Block();

    let alternate = null;
    if (this.Peek().type === "KEYWORD" && this.Peek().value === "else") {
      this.Consume("KEYWORD", "else");
      alternate = this.Parse_Block();
    }

    return { type: "IfStatement", test, consequent, alternate };
  }

  Parse_For() {
    this.Consume("KEYWORD", "for");
    this.Consume("LPAREN");

    let init = null;
    if (this.Peek().type === "KEYWORD") {
      this.Consume("KEYWORD");
      const name = this.Consume("IDENTIFIER").value;
      this.Consume("ASSIGN");
      const val = this.Parse_Expression();
      init = { type: "VarDeclaration", name, init: val };
    }
    this.Consume("TERMINATOR");

    const test = this.Parse_Expression();
    this.Consume("TERMINATOR");

    const update = this.Parse_Expression();
    this.Consume("RPAREN");

    const body = this.Parse_Block();
    return { type: "ForStatement", init, test, update, body };
  }

  Parse_Block() {
    this.Consume("LBRACE");
    const body = [];
    while (this.Peek().type !== "RBRACE" && this.Peek().type !== "EOF") {
      body.push(this.Parse_Statement());
    }
    this.Consume("RBRACE");
    return { type: "BlockStatement", body };
  }

  Parse_Expression() {
    const node = this.Parse_Comparison();
    if (this.Peek().type === "ASSIGN") {
      this.Consume("ASSIGN");
      const right = this.Parse_Expression();
      return {
        type: "AssignmentExpression",
        name: node.name || node.value,
        right
      };
    }
    return node;
  }

  Parse_Comparison() {
    let leftNode = this.Parse_Additive();
    while (this.Peek().type === "REL_OP") {
      const operatorToken = this.Consume("REL_OP");
      const rightNode = this.Parse_Additive();
      leftNode = {
        type: "BinaryExpression",
        operator: operatorToken.value,
        left: leftNode,
        right: rightNode
      };
    }
    return leftNode;
  }

  Parse_Additive() {
    let leftNode = this.Parse_Term();
    while (this.Peek().type === "ADD" || this.Peek().type === "SUB") {
      const operatorToken = this.Consume(this.Peek().type);
      const rightNode = this.Parse_Term();
      leftNode = {
        type: "BinaryExpression",
        operator: operatorToken.value,
        left: leftNode,
        right: rightNode
      };
    }
    return leftNode;
  }

  Parse_Term() {
    let leftNode = this.Parse_Power();
    while (this.Peek().type === "MULT" || this.Peek().type === "DIV") {
      const operatorToken = this.Consume(this.Peek().type);
      const rightNode = this.Parse_Power();
      leftNode = {
        type: "BinaryExpression",
        operator: operatorToken.value,
        left: leftNode,
        right: rightNode
      };
    }
    return leftNode;
  }

  Parse_Power() {
    let leftNode = this.Parse_Factor();
    if (this.Peek().type === "POWER") {
      const operatorToken = this.Consume("POWER");
      const rightNode = this.Parse_Power();
      leftNode = {
        type: "BinaryExpression",
        operator: operatorToken.value,
        left: leftNode,
        right: rightNode
      };
    }
    return leftNode;
  }

  Parse_Factor() {
    const currentToken = this.Peek();
    switch (currentToken.type) {
      case "NUMBER":
        this.Consume("NUMBER");
        return { type: "NumericLiteral", value: parseFloat(currentToken.value) };

      case "IDENTIFIER":
        this.Consume("IDENTIFIER");
        if (this.Peek().type === "LBRACKET") {
          this.Consume("LBRACKET");
          const indexExpr = this.Parse_Expression();
          this.Consume("RBRACKET");
          return { type: "MemberExpression", name: currentToken.value, index: indexExpr };
        }
        return { type: "Identifier", name: currentToken.value };

      case "LBRACKET":
        this.Consume("LBRACKET");
        const elements = [];
        if (this.Peek().type !== "RBRACKET") {
          elements.push(this.Parse_Expression());
          while (this.Peek().type === "COMMA") {
            this.Consume("COMMA");
            elements.push(this.Parse_Expression());
          }
        }
        this.Consume("RBRACKET");
        return { type: "ArrayLiteral", elements };

      case "LPAREN":
        this.Consume("LPAREN");
        const insideNode = this.Parse_Expression();
        this.Consume("RPAREN");
        return insideNode;

      default:
        throw new Error("Invalid factor token: " + currentToken.type);
    }
  }
}

module.exports = Parser;