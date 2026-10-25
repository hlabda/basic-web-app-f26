function isPrime(value: number): boolean {
  if (!Number.isSafeInteger(value) || value < 2) return false;
  if (value % 2 === 0) return value === 2;
  for (let divisor = 3; divisor <= Math.sqrt(value); divisor += 2) {
    if (value % divisor === 0) return false;
  }
  return true;
}

function isSquare(value: number): boolean {
  return value >= 0 && Number.isInteger(Math.sqrt(value));
}

function isCube(value: number): boolean {
  const root = Math.round(Math.cbrt(value));
  return root * root * root === value;
}

// Parse only numbers and arithmetic operators; never execute query text as code.
function calculate(expression: string): number | undefined {
  const normalized = expression.toLowerCase()
    .replace(/raised to the power of|to the power of|to the power/g, "^")
    .replace(/multiplied by|times/g, "*")
    .replace(/divided by/g, "/")
    .replace(/plus/g, "+")
    .replace(/minus/g, "-")
    .replace(/\s+/g, "");
  const tokens = normalized.match(/\d+(?:\.\d+)?|[+\-*/^()]/g);
  if (!tokens || tokens.join("") !== normalized) return undefined;
  let position = 0;

  function atom(): number {
    const token = tokens![position++];
    if (token === "+") return atom();
    if (token === "-") return -atom();
    if (token === "(") {
      const value = sum();
      if (tokens![position++] !== ")") return NaN;
      return value;
    }
    return token && /^\d/.test(token) ? Number(token) : NaN;
  }

  function power(): number {
    const left = atom();
    if (tokens![position] === "^") {
      position++;
      return Math.pow(left, power());
    }
    return left;
  }

  function product(): number {
    let value = power();
    while (tokens![position] === "*" || tokens![position] === "/") {
      const operator = tokens![position++];
      const right = power();
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  }

  function sum(): number {
    let value = product();
    while (tokens![position] === "+" || tokens![position] === "-") {
      const operator = tokens![position++];
      const right = product();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  const result = sum();
  return position === tokens.length && Number.isFinite(result) ? result : undefined;
}

export default function QueryProcessor(query: string): string {
  const list = query.match(/which of the following numbers (?:is|are) (.+?):\s*(-?\d+(?:\s*,\s*-?\d+)*)\s*\??\s*$/i);
  if (list) {
    const numbers = list[2].split(",").map(Number);
    const kind = list[1].toLowerCase();
    if (kind === "the largest") return String(Math.max(...numbers));
    if (kind === "the smallest") return String(Math.min(...numbers));
    if (/\bprimes?\b/.test(kind)) return numbers.filter(isPrime).join(", ");
    if (/\bsquares?\b/.test(kind) && /\bcubes?\b/.test(kind)) {
      return numbers.filter(value => isSquare(value) && isCube(value)).join(", ");
    }
    if (/\bsquares?\b/.test(kind)) return numbers.filter(isSquare).join(", ");
    if (/\bcubes?\b/.test(kind)) return numbers.filter(isCube).join(", ");
  }

  const arithmetic = query.match(/what is (.+?)\??\s*$/i);
  if (arithmetic) {
    const answer = calculate(arithmetic[1]);
    if (answer !== undefined) return String(answer);
  }

  if (query.toLowerCase().includes("what is your andrew id")) {
    return "hlabda";
  }

  if (query.toLowerCase().includes("shakespeare")) {
    return (
      "William Shakespeare (26 April 1564 - 23 April 1616) was an " +
      "English poet, playwright, and actor, widely regarded as the greatest " +
      "writer in the English language and the world's pre-eminent dramatist."
    );
  }

  if (/\bwhat is your name\b/i.test(query)) {
    return "hlabda";
  }

  if (/\bwhat is your age\b/i.test(query)) {
    return "67";
  }



  return "";
}
