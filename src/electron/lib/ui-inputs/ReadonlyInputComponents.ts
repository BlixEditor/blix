// Dial components are special readonly UI inputs that provide plugins
// special access to certain internal structures within Blix.

import type { UUID } from "../../../shared/utils/UniqueEntity";
import type { NodeTweakData } from "../../../shared/types";
import { NodeUI, NodeUIComponent, NodeUILeaf, NodeUIParent } from "../../../shared/ui/NodeUITypes";

type Composer<T> = (deps: ComposerDependencies, leaf: NodeUILeaf) => T;

export type ComposerDependencies = {
  nodeUUID: UUID;
  uiInputs: string[];
  uiInputChanges: string[];
};

// This dict defines how all readonly UI inputs are initialized
const composers: { [key in NodeUIComponent]?: Composer<any> } = {
  TweakDial: (deps: ComposerDependencies) => {
    return {
      nodeUUID: deps.nodeUUID,
      inputs: deps.uiInputs,
    } as NodeTweakData;
  },
  DiffDial: (deps: ComposerDependencies) => {
    return {};
  },
};

// Recursively initialize special data-provider UI inputs
export function populateDials(
  ui: NodeUI | null,
  dependencies: ComposerDependencies
): { [key: string]: any } {
  if (!ui) return {};

  if (ui.type === "parent") {
    let res = {};
    for (const child of ui.params) {
      res = { ...res, ...populateDials(child as NodeUIParent, dependencies) };
    }
    return res;
  } else if (ui.type === "leaf") {
    const leafUI = ui as NodeUILeaf;

    const init = composers[leafUI.category];
    if (!init) return {};

    return { [leafUI.label]: init(dependencies, leafUI) };
  }

  return {};
}
