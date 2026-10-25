import QueryProcessor from "../../utils/QueryProcessor";
import '@testing-library/jest-dom'

describe("QueryProcessor", () => {
    test.each([
        ["Which of the following numbers is the largest: 43, 78, 90?", "90"],
        ["Which of the following numbers is the largest: 48, 99, 81?", "99"],
        ["id: Which of the following numbers is the largest: -5, -2, -9?", "-2"],
    ])('finds largest number in "%s"', (query, expected) => {
        expect(QueryProcessor(query)).toBe(expected);
    });

    test.each([
        ["What is 83 plus 57?", "140"],
        ["What is 50 plus 17?", "67"],
        ["a1b2c3: What is 0 plus 9?", "9"],
        ["WHAT IS -5 PLUS 3?", "-2"],
    ])('adds numbers in "%s"', (query, expected) => {
        expect(QueryProcessor(query)).toBe(expected);
    });

    test("should return a string", () => {
        const query = "test";
        const response: string = QueryProcessor(query);
        expect(typeof response).toBe("string");
    });

    test('should return shakespeare description', () => {
        const query = "shakespeare";
        const response: string = QueryProcessor(query);
        expect(response).toBe((
            "William Shakespeare (26 April 1564 - 23 April 1616) was an " +
            "English poet, playwright, and actor, widely regarded as the greatest " +
            "writer in the English language and the world's pre-eminent dramatist."
          ));
    });

    test('should return name', () => {
        const query = "What is your name?";
        const response: string = QueryProcessor(query);
        expect(response).toBe((
            "hlabda"
          ));
    });

    test.each([
        "What is your Andrew ID?",
        "WHAT IS YOUR ANDREW ID?",
        "a1b2c3d4: What is your Andrew ID?",
    ])('should return Andrew ID for "%s"', (query) => {
        expect(QueryProcessor(query)).toBe("hlabda");
    });
});
