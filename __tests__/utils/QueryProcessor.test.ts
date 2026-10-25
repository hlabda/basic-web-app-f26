import QueryProcessor from "../../utils/QueryProcessor";
import '@testing-library/jest-dom'

describe("QueryProcessor", () => {
    test.each([
        ["Which of the following is an anagram of listen: inlets, banana, enlists, google?", "inlets"],
        ["Which of the following is an anagram of apple: papel, pale, pepla, applee?", "papel, pepla"],
        ["abc123: WHICH OF THE FOLLOWING IS AN ANAGRAM OF LISTEN: INLETS, BANANA, ENLISTS, GOOGLE?", "INLETS"],
        ["Which of the following is an anagram of listen: banana, enlists, google?", ""],
        ["What is the scrabble score of zoo?", "12"],
    ])('answers anagram and Scrabble regression "%s"', (query, expected) => {
        expect(QueryProcessor(query)).toBe(expected);
    });

    test.each([
        ["What is the scrabble score of banana?", "8"],
        ["What is the scrabble score of quiz?", "22"],
        ["What is the scrabble score of jazz?", "29"],
        ['What is the scrabble score of "Hello"?', "8"],
        ["a1b2c3: WHAT IS THE SCRABBLE SCORE OF QUIZ?", "22"],
    ])('scores Scrabble word in "%s"', (query, expected) => {
        expect(QueryProcessor(query)).toBe(expected);
    });

    test.each([
        ["What is 2 to the power of 60?", "1152921504606846976"],
        ["What is 2 to the power of 100?", "1267650600228229401496703205376"],
        ["What is 10 to the power of 22?", "10000000000000000000000"],
        ["What is 3 multiplied  by 4?", "12"],
        ["Which of the following numbers is the largest : 1, 9, 5?", "9"],
        ["What is 9007199254740993 plus 2 multiplied by 3?", "9007199254740999"],
    ])('preserves exact integers and flexible spacing in "%s"', (query, expected) => {
        expect(QueryProcessor(query)).toBe(expected);
    });

    test.each([
        ["What is 25 minus 41?", "-16"],
        ["What is 13 multiplied by 7?", "91"],
        ["What is 8 times 9?", "72"],
        ["What is 81 divided by 9?", "9"],
        ["What is 2 to the power of 10?", "1024"],
        ["What is 3 raised to the power of 4?", "81"],
        ["What is 2 plus 3 multiplied by 4?", "14"],
        ["id: What is (2 plus 3) multiplied by 4?", "20"],
        ["What is 2 multiplied by 3 plus 4 multiplied by 5?", "26"],
        ["What is 9 minus -2?", "11"],
        ["What is 3 plus 4", "7"],
        ["Which of the following numbers is the smallest: 5, -9, 2?", "-9"],
        ["Which of the following numbers are primes: 1, 2, 3, 4, 9, 17?", "2, 3, 17"],
        ["Which of the following numbers are primes: -3, 0, 1, 49?", ""],
        ["Which of the following numbers are square numbers: -4, 0, 1, 16, 25, 26?", "0, 1, 16, 25"],
        ["Which of the following numbers are cubes: -8, 1, 8, 27, 64, 65?", "-8, 1, 8, 27, 64"],
        ["Which of the following numbers are both squares and cubes: 1, 4, 8, 64, 729, 4096?", "1, 64, 729, 4096"],
    ])('answers math question "%s"', (query, expected) => {
        expect(QueryProcessor(query)).toBe(expected);
    });

    test.each([
        "What is 8 divided by 0?",
        "What is 2 plus?",
        "What is 2 plus 3 garbage?",
        "What is process.exit()?",
    ])('leaves invalid arithmetic unanswered: "%s"', (query) => {
        expect(QueryProcessor(query)).toBe("");
    });

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
