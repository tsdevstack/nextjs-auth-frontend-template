import { describe, it, expect, beforeEach } from "vitest";
import { takeLinkToken } from "./take-link-token";

function openUrl(url: string): void {
  window.history.replaceState(null, "", url);
}

describe("takeLinkToken", () => {
  beforeEach(() => {
    openUrl("/");
  });

  describe("Standard use cases", () => {
    it("should read the token after #", () => {
      openUrl("/confirm#token=abc123");

      expect(takeLinkToken()).toBe("abc123");
    });

    it("should read ?token= from links sent before", () => {
      openUrl("/reset-password?token=old456");

      expect(takeLinkToken()).toBe("old456");
    });

    it("should remove the token from the address bar", () => {
      openUrl("/reset-password#token=abc123");

      takeLinkToken();

      expect(window.location.pathname).toBe("/reset-password");
      expect(window.location.hash).toBe("");
      expect(window.location.search).toBe("");
    });
  });

  describe("Edge cases", () => {
    it("should return null without a token", () => {
      openUrl("/confirm");

      expect(takeLinkToken()).toBeNull();
      expect(window.location.pathname).toBe("/confirm");
    });

    it("should return null for an empty token", () => {
      openUrl("/confirm#token=");

      expect(takeLinkToken()).toBeNull();
    });

    it("should prefer the token after # when both are present", () => {
      openUrl("/confirm?token=old#token=new");

      expect(takeLinkToken()).toBe("new");
    });
  });
});
