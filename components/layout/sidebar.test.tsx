import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Sidebar, MobileSidebar } from "./sidebar";

afterEach(() => {
  cleanup();
});

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock Sheet components
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-trigger">{children}</div>
  ),
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  SheetDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
}));

// Mock Button
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <button {...props}>{children}</button>,
}));

describe("Sidebar", () => {
  it("should render navigation links", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "Home" })).not.toBeNull();
  });

  it("should have correct hrefs", () => {
    render(<Sidebar />);

    expect(
      screen.getByRole("link", { name: "Home" }).getAttribute("href"),
    ).toBe("/user/home");
  });

  it("should be hidden on mobile", () => {
    const { container } = render(<Sidebar />);
    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar.className).toContain("hidden");
    expect(sidebar.className).toContain("lg:block");
  });
});

describe("MobileSidebar", () => {
  it("should render sheet trigger", () => {
    render(<MobileSidebar />);
    expect(screen.getByTestId("sheet-trigger")).not.toBeNull();
  });

  it("should render navigation links in sheet content", () => {
    render(<MobileSidebar />);

    const content = screen.getByTestId("sheet-content");
    expect(content).not.toBeNull();
  });

  it("should render menu icon button", () => {
    render(<MobileSidebar />);

    // The button should be inside the sheet trigger
    const trigger = screen.getByTestId("sheet-trigger");
    const button = trigger.querySelector("button");
    expect(button).not.toBeNull();
  });
});
