import parsePrereqs from "../src/parsePrereqs";

// CMSC216
describe("Parse prerequisites from umd.io API's string of prereqs for a given course", () => {
  test("CMSC216", () => {
    expect(
      parsePrereqs(
        "Minimum grade of C- in CMSC132; and minimum grade of C- in MATH141."
      )
    ).toEqual({
      mustTake: ["CMSC132", "MATH141"],
      pickOneFromEach: []
    });
  });

  // CMSC412
  test("CMSC412", () => {
    expect(
      parsePrereqs(
        "Minimum grade of C- in CMSC330 and CMSC351; and 1 course with a minimum grade of C- from (CMSC414, CMSC417, CMSC420, CMSC430, CMSC433, CMSC435, ENEE440, ENEE457)"
      )
    ).toEqual({
      mustTake: ["CMSC330", "CMSC351"],
      pickOneFromEach: [
        [
          "CMSC414",
          "CMSC417",
          "CMSC420",
          "CMSC430",
          "CMSC433",
          "CMSC435",
          "ENEE440",
          "ENEE457"
        ]
      ]
    });
  });

  // MATH403
  test("MATH403", () => {
    expect(
      parsePrereqs(
        "1 course with a minimum grade of C- from (MATH240, MATH461, MATH340); and 1 course with a minimum grade of C- from (MATH341, MATH241); and minimum grade of C- in MATH310. Or students who have taken courses with comparable content may contact the department."
      )
    ).toEqual({
      mustTake: ["MATH310"],
      pickOneFromEach: [
        ["MATH240", "MATH461", "MATH340"],
        ["MATH341", "MATH241"]
      ]
    });
  });
});
