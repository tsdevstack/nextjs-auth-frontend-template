import { describe, it, expect } from "vitest";
import { readTokenClaims } from "./read-token-claims";

const token = (claims: object): string =>
  `header.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.signature`;

describe("readTokenClaims", () => {
  it("should read the claims of a JWT", () => {
    expect(
      readTokenClaims(token({ email: "ann@example.com", confirmed: false })),
    ).toEqual({ email: "ann@example.com", confirmed: false });
  });

  it.each([
    ["no payload", "abc"],
    ["a payload that is not JSON", "a.bm90IGpzb24.c"],
    [
      "a payload that is not an object",
      `a.${Buffer.from("42").toString("base64url")}.c`,
    ],
  ])("should be null for %s", (_, value) => {
    expect(readTokenClaims(value)).toBeNull();
  });
});
