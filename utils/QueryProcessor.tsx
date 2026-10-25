export default function QueryProcessor(query: string): string {
  const largest = query.match(/which of the following numbers is the largest:\s*(-?\d+(?:\s*,\s*-?\d+)*)\s*\?/i);
  if (largest) {
    return String(Math.max(...largest[1].split(",").map(Number)));
  }

  const addition = query.match(/what is (-?\d+) plus (-?\d+)\?/i);
  if (addition) {
    return String(Number(addition[1]) + Number(addition[2]));
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

  if (query.toLowerCase().includes("name")) {
    return "hlabda";
  }

  if (query.toLowerCase().includes("age")) {
    return "67";
  }



  return "";
}
