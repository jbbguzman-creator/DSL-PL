const Environment = require('./environment');

function evaluate_AST(node, env = new Environment()) {
  if (!node) return null;

  switch (node.type) {
    case "Program": {
      let lastVal = null;
      for (const stmt of node.body) {
        lastVal = evaluate_AST(stmt, env);
      }
      return lastVal;
    }

    case "BlockStatement": {
      const blockEnv = new Environment(env);
      let lastVal = null;
      for (const stmt of node.body) {
        lastVal = evaluate_AST(stmt, blockEnv);
      }
      return lastVal;
    }

    case "NumericLiteral":
      return node.value;

    case "ArrayLiteral":
      return node.elements.map(el => evaluate_AST(el, env));

    case "Identifier":
      return env.get(node.name);

    case "MemberExpression": {
      const arr = env.get(node.name);
      const idx = evaluate_AST(node.index, env);
      return arr[idx];
    }

    case "VarDeclaration": {
      const val = evaluate_AST(node.init, env);
      return env.set(node.name, val);
    }

    case "AssignmentExpression": {
      const val = evaluate_AST(node.right, env);
      return env.assign(node.name, val);
    }

    case "IfStatement": {
      const condition = evaluate_AST(node.test, env);
      if (condition) {
        return evaluate_AST(node.consequent, env);
      } else if (node.alternate) {
        return evaluate_AST(node.alternate, env);
      }
      return null;
    }

    case "ForStatement": {
      const forEnv = new Environment(env);
      if (node.init) evaluate_AST(node.init, forEnv);
      let lastResult = null;
      while (evaluate_AST(node.test, forEnv)) {
        lastResult = evaluate_AST(node.body, forEnv);
        if (node.update) evaluate_AST(node.update, forEnv);
      }
      return lastResult;
    }

    case "BinaryExpression": {
      const leftNodeVal = evaluate_AST(node.left, env);
      const rightNodeVal = evaluate_AST(node.right, env);
      switch (node.operator) {
        case "+": return leftNodeVal + rightNodeVal;
        case "-": return leftNodeVal - rightNodeVal;
        case "*": return leftNodeVal * rightNodeVal;
        case "/":
          if (rightNodeVal === 0) throw new Error("Division by zero");
          return leftNodeVal / rightNodeVal;
        case "^": return Math.pow(leftNodeVal, rightNodeVal);
        case ">": return leftNodeVal > rightNodeVal;
        case "<": return leftNodeVal < rightNodeVal;
        case ">=": return leftNodeVal >= rightNodeVal;
        case "<=": return leftNodeVal <= rightNodeVal;
        case "==": return leftNodeVal == rightNodeVal;
        case "!=": return leftNodeVal != rightNodeVal;
      }
    }
  }
}

module.exports = { evaluate_AST };