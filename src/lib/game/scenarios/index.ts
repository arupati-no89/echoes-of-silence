import { Scenario } from "../types";
import { vampireScenario } from "../scenario";
import { unknownScenario } from "./unknown";

export const scenarios: Record<string, Scenario> = {
  vampire: vampireScenario,
  unknown: unknownScenario,
};

export const scenarioList = Object.entries(scenarios).map(([id, s]) => ({
  id,
  title: s.title,
}));
