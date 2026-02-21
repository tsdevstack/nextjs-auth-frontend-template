import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MainLayout } from "./main-layout";

afterEach(() => {
  cleanup();
});

// Mock child components
vi.mock("./sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock("./topbar", () => ({
  Topbar: ({ authenticated }: { authenticated: boolean }) => (
    <div data-testid="topbar" data-authenticated={authenticated}>
      Topbar
    </div>
  ),
}));

describe("MainLayout", () => {
  it("should render sidebar", () => {
    render(<MainLayout>Content</MainLayout>);
    expect(screen.getByTestId("sidebar")).not.toBeNull();
  });

  it("should render topbar with authenticated prop", () => {
    render(<MainLayout>Content</MainLayout>);
    const topbar = screen.getByTestId("topbar");
    expect(topbar).not.toBeNull();
    expect(topbar.getAttribute("data-authenticated")).toBe("true");
  });

  it("should render children in main area", () => {
    render(<MainLayout><div data-testid="child">Child Content</div></MainLayout>);
    expect(screen.getByTestId("child")).not.toBeNull();
    expect(screen.getByText("Child Content")).not.toBeNull();
  });

  it("should have correct layout structure", () => {
    const { container } = render(<MainLayout>Content</MainLayout>);

    // Should have flex container
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("flex");
    expect(wrapper.className).toContain("min-h-screen");
  });
});