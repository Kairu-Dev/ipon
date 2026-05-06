import { render, screen } from "@testing-library/react";
import { AddTransactionModal } from "./add-transaction-modal";
import { describe, it, expect } from "vitest";
import { useUIStore } from "@/store/ui-store";

describe("AddTransactionModal", () => {
  it("renders modal content when open", () => {
    useUIStore.setState({ isAddTransactionModalOpen: true });
    render(<AddTransactionModal />);
    expect(screen.getByText("Add Transaction")).toBeDefined();
    expect(screen.getByText("Expense")).toBeDefined();
    expect(screen.getByText("Income")).toBeDefined();
  });

  it("does not render modal content when closed", () => {
    useUIStore.setState({ isAddTransactionModalOpen: false });
    render(<AddTransactionModal />);
    expect(screen.queryByText("Add Transaction")).toBeNull();
  });
});
