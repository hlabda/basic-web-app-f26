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

type Numeric = bigint | number;

function combine(left: Numeric, right: Numeric, operator: string): Numeric {
  if (typeof left === "bigint" && typeof right === "bigint") {
    if (operator === "+") return left + right;
    if (operator === "-") return left - right;
    if (operator === "*") return left * right;
    if (operator === "/") {
      if (right === BigInt(0)) return NaN;
      if (left % right === BigInt(0)) return left / right;
    }
  }
  const a = Number(left);
  const b = Number(right);
  if (operator === "+") return a + b;
  if (operator === "-") return a - b;
  if (operator === "*") return a * b;
  if (operator === "/") return a / b;
  return NaN;
}

function raise(base: Numeric, exponent: Numeric): Numeric {
  if (!Number.isFinite(Number(exponent)) || Math.abs(Number(exponent)) > 10000) return NaN;
  if (typeof base === "bigint" && typeof exponent === "bigint" && exponent >= BigInt(0)) {
    let result = BigInt(1);
    let factor = base;
    let remaining = exponent;
    while (remaining > BigInt(0)) {
      if (remaining % BigInt(2) === BigInt(1)) result *= factor;
      remaining /= BigInt(2);
      if (remaining > BigInt(0)) factor *= factor;
    }
    return result;
  }
  return Math.pow(Number(base), Number(exponent));
}

// Parse only numbers and arithmetic operators; never execute query text as code.
function calculate(expression: string): Numeric | undefined {
  const normalized = expression.toLowerCase()
    .replace(/\s+/g, " ").trim()
    .replace(/raised to the power of|to the power of|to the power/g, "^")
    .replace(/multiplied by|times/g, "*")
    .replace(/divided by/g, "/")
    .replace(/plus/g, "+")
    .replace(/minus/g, "-")
    .replace(/\s+/g, "");
  const tokens = normalized.match(/\d+(?:\.\d+)?|[+\-*/^()]/g);
  if (!tokens || tokens.join("") !== normalized) return undefined;
  let position = 0;

  function atom(): Numeric {
    const token = tokens![position++];
    if (token === "+") return atom();
    if (token === "-") return -atom();
    if (token === "(") {
      const value = sum();
      if (tokens![position++] !== ")") return NaN;
      return value;
    }
    if (!token || !/^\d/.test(token)) return NaN;
    return token.includes(".") ? Number(token) : BigInt(token);
  }

  function power(): Numeric {
    const left = atom();
    if (tokens![position] === "^") {
      position++;
      return raise(left, power());
    }
    return left;
  }

  function product(): Numeric {
    let value = power();
    while (tokens![position] === "*" || tokens![position] === "/") {
      const operator = tokens![position++];
      const right = power();
      value = combine(value, right, operator);
    }
    return value;
  }

  function sum(): Numeric {
    let value = product();
    while (tokens![position] === "+" || tokens![position] === "-") {
      const operator = tokens![position++];
      const right = product();
      value = combine(value, right, operator);
    }
    return value;
  }

  const result = sum();
  return position === tokens.length && (typeof result === "bigint" || Number.isFinite(result)) ? result : undefined;
}

export default function QueryProcessor(query: string): string {
  const anagram = query.match(/which of the following is an anagram of\s+["']?([a-z]+)["']?\s*:\s*([a-z'",\s]+?)\s*\??\s*$/i);
  if (anagram) {
    const signature = (word: string) => word.toLowerCase().split("").sort().join("");
    const target = signature(anagram[1]);
    const candidates = anagram[2].split(",").map(word => word.trim().replace(/^["']|["']$/g, ""));
    return candidates.filter(word => signature(word) === target).join(", ");
  }

  const scrabble = query.match(/what is the scrabble score of\s+["']?([a-z]+)["']?\s*\??\s*$/i);
  if (scrabble) {
    const values: Record<string, number> = {};
    ["aeilnorstu", "dg", "bcmp", "fhvwy", "k", "", "", "jx", "", "qz"].forEach((letters, index) => {
      for (const letter of letters) values[letter] = index + 1;
    });
    return String(scrabble[1].toLowerCase().split("").reduce((score, letter) => score + values[letter], 0));
  }

  const list = query.match(/which of the following numbers (?:is|are) (.+?):\s*(-?\d+(?:\s*,\s*-?\d+)*)\s*\??\s*$/i);
  if (list) {
    const numbers = list[2].split(",").map(Number);
    const kind = list[1].toLowerCase().trim();
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
