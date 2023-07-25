import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import { type UUID } from "../../../../shared/utils/UniqueEntity";
import { IPCGraphSubscriber } from "../../core-graph/CoreGraphInteractors";
import { UIGraph } from "@shared/ui/UIGraph";
import { NodeInstance } from "../../registries/ToolboxRegistry";
import { type NodeSignature } from "@shared/ui/ToolboxTypes";

// Graphs across projects are stored homogeneously and referenced by UUID
export class GraphApi implements ElectronMainApi<GraphApi> {
  private readonly _blix: Blix;
  private readonly graphSubscriber: IPCGraphSubscriber;

  constructor(blix: Blix) {
    this._blix = blix;
    this.graphSubscriber = new IPCGraphSubscriber();

    // Add IPC subscriber to listen for graph changes and alert the frontend
    this._blix.graphManager.addAllSubscriber(this.graphSubscriber);
    this.graphSubscriber.listen = (graphId: UUID, newGraph: UIGraph) => {
      this._blix.mainWindow?.apis.graphClientApi.graphChanged(graphId, newGraph);
    };
  }

  // TODO: Implement these properly
  async addNode(graphUUID: UUID, nodeSignature: NodeSignature) {
    return this._blix.graphManager.addNode(
      graphUUID,
      this._blix.toolbox.getNode(nodeSignature)
      // new NodeInstance("fdsa2", "fdsa3", "fdsa4", "fdsa5", "fdsa6", [], [])
    );
  }

  async addEdge(graphUUID: UUID, anchorA: UUID, anchorB: UUID) {
    return this._blix.graphManager.addEdge(graphUUID, anchorA, anchorB);
  }

  async removeNode(graphUUID: UUID, nodeUUID: UUID) {
    return this._blix.graphManager.removeNode(graphUUID, nodeUUID);
  }

  async removeEdge(graphUUID: UUID, anchorTo: UUID) {
    return this._blix.graphManager.removeEdge(graphUUID, anchorTo);
  }

  async setNodePos(graphUUID: UUID, nodeUUID: UUID, pos: { x: number; y: number }) {
    return this._blix.graphManager.setPos(graphUUID, nodeUUID, pos.x, pos.y);
  }

  async getGraph(uuid: UUID) {
    return this._blix.graphManager.getGraph(uuid);
  }

  async getAllGraphUUIDs() {
    return this._blix.graphManager.getAllGraphUUIDs();
  }
}
