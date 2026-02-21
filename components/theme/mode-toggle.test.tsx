import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModeToggle } from "./mode-toggle";

afterEach(() => {
  cleanup();
});

// Mock useTheme
const mockSetTheme = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    theme: "light",
  }),
}));

// Mock dropdown components
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button data-testid="dropdown-item" onClick={onClick}>
      {children}
    </button>
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

describe("ModeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it("should render dropdown menu", () => {
    render(<ModeToggle />);
    expect(screen.getByTestId("dropdown-menu")).not.toBeNull();
  });

  it("should render toggle button with sr-only text", () => {
    render(<ModeToggle />);
    expect(screen.getByText("Toggle theme")).not.toBeNull();
  });

  it("should render light, dark, and system options", () => {
    render(<ModeToggle />);
    expect(screen.getByText("Light")).not.toBeNull();
    expect(screen.getByText("Dark")).not.toBeNull();
    expect(screen.getByText("System")).not.toBeNull();
  });

  it("should call setTheme with 'light' when Light is clicked", async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);

    await user.click(screen.getByText("Light"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("should call setTheme with 'dark' when Dark is clicked", async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);

    await user.click(screen.getByText("Dark"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("should call setTheme with 'system' when System is clicked", async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);

    await user.click(screen.getByText("System"));
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });
});