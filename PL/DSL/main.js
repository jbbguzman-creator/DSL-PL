const { tokenize } = require('./tokenizer');
const Parser = require('./parser');
const { evaluate_AST } = require('./evaluator');
const Environment = require('./environment');

const code = `
let x = 10;
let nums = [10, 20, 30];
if (x < 15) {
  x = x + nums[1];
} else {
  x = x - 1;
}
`;

try {
  // 1. Tokenize
  const tokens = tokenize(code);
  console.log("--- TOKENS ---");
  console.log(tokens);

  // 2. Parse
  const parser = new Parser(tokens);
  const ast = parser.Parse_Program();

  // 3. Evaluate
  const globalEnv = new Environment();
  evaluate_AST(ast, globalEnv);

  console.log("\n--- RESULT ---");
  console.log("Final State of x:", globalEnv.get("x"));
} catch (err) {
  console.error("Execution Error:", err.message);
}