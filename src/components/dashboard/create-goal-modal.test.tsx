import { render, screen } from "@testing-library/react";
import { CreateGoalModal } from "./create-goal-modal";
import { describe, it, expect } from "vitest";
import { useUIStore } from "@/store/ui-store";

describe("CreateGoalModal", () => {
  it("renders modal content when open", () => {
    useUIStore.setState({ isCreateGoalModalOpen: true });
    render(<CreateGoalModal />);
    expect(screen.getByText("Create New Goal")).toBeDefined();
    expect(screen.getByPlaceholderText("e.g. Japan Trip 2024")).toBeDefined();
  });

  it("does not render modal content when closed", () => {
    useUIStore.setState({ isCreateGoalModalOpen: false });
    render(<CreateGoalModal />);
    expect(screen.queryByText("Create New Goal")).toBeNull();
  });
});
