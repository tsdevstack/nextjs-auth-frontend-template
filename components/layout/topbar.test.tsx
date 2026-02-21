import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Topbar } from "./topbar";

afterEach(() => {
  cleanup();
});

// Mock ModeToggle
vi.mock("@/components/theme/mode-toggle", () => ({
  ModeToggle: () => <div data-testid="mode-toggle">Mode Toggle</div>,
}));

// Mock MobileSidebar
vi.mock("./sidebar", () => ({
  MobileSidebar: () => <div data-testid="mobile-sidebar">Mobile Sidebar</div>,
}));

describe("Topbar", () => {
  it("should render the app title", () => {
    render(<Topbar authenticated={false} />);
    expect(screen.getByText("tsdevstack")).not.toBeNull();
  });

  it("should render mode toggle", () => {
    render(<Topbar authenticated={false} />);
    expect(screen.getByTestId("mode-toggle")).not.toBeNull();
  });

  describe("when authenticated", () => {
    it("should render mobile sidebar", () => {
      render(<Topbar authenticated={true} />);
      expect(screen.getByTestId("mobile-sidebar")).not.toBeNull();
    });
  });

  describe("when not authenticated", () => {
    it("should not render mobile sidebar", () => {
      render(<Topbar authenticated={false} />);
      expect(screen.queryByTestId("mobile-sidebar")).toBeNull();
    });
  });

  it("should have header element", () => {
    render(<Topbar authenticated={false} />);
    const header = screen.getByRole("banner");
    expect(header).not.toBeNull();
    expect(header.className).toContain("h-16");
  });
});
