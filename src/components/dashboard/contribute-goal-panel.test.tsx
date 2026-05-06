import { render, screen } from "@testing-library/react";
import { ContributeGoalPanel } from "./contribute-goal-panel";
import { describe, it, expect } from "vitest";
import { useUIStore } from "@/store/ui-store";

describe("ContributeGoalPanel", () => {
  it("renders panel content when open", () => {
    useUIStore.setState({ isContributeGoalPanelOpen: true });
    render(<ContributeGoalPanel />);
    expect(screen.getByText("Contribute to Goal")).toBeDefined();
    expect(screen.getByText("New MacBook Pro")).toBeDefined();
    expect(screen.getByText("Add Contribution")).toBeDefined();
  });

  it("does not render panel content when closed", () => {
    useUIStore.setState({ isContributeGoalPanelOpen: false });
    render(<ContributeGoalPanel />);
    expect(screen.queryByText("Contribute to Goal")).toBeNull();
  });
});
