import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../../Blix";
import { type UUID } from "../../../../shared/utils/UniqueEntity";
import { type NodeSignature } from "../../../../shared/ui/ToolboxTypes";
import type { UIInputChange, INodeUIInputs } from "../../../../shared/types";
import { CoreGraphUpdateParticipant } from "../../core-graph/CoreGraphInteractors";
import type { GraphMetadata, SvelvetCanvasPos } from "../../../../shared/ui/UIGraph";

// Graphs across projects are stored homogeneously and referenced by UUID
export class GraphApi implements ElectronMainApi<GraphApi> {
  private readonly _blix: Blix;

  constructor(blix: Blix) {
    this._blix = blix;
  }

  async undoChange(graphUUID: UUID) {
    return this._blix.graphManager.undoEvent(graphUUID);
  }

  async redoChange(graphUUID: UUID) {
    return this._blix.graphManager.redoEvent(graphUUID);
  }

  async handleNodeInputInteraction(graphUUID: UUID, nodeUUID: UUID, input: UIInputChange) {
    return this._blix.graphManager.handleNodeInputInteraction(graphUUID, nodeUUID, input);
  }

  async deleteGraphs(graphUUIDs: UUID[]) {
    this._blix.graphManager.deleteGraphs(graphUUIDs);
  }

  // TODO: Implement these properly
  async addNode(graphUUID: UUID, nodeSignature: NodeSignature, pos: SvelvetCanvasPos) {
    return this._blix.graphManager.addNode(
      graphUUID,
      this._blix.toolbox.getNodeInstance(nodeSignature),
      pos,
      CoreGraphUpdateParticipant.user
    );
  }

  async addEdge(graphUUID: UUID, anchorA: UUID, anchorB: UUID) {
    return this._blix.graphManager.addEdge(
      graphUUID,
      anchorA,
      anchorB,
      CoreGraphUpdateParticipant.user
    );
  }

  async removeNode(graphUUID: UUID, nodeUUID: UUID) {
    return this._blix.graphManager.removeNode(graphUUID, nodeUUID, CoreGraphUpdateParticipant.user);
  }

  async removeEdge(graphUUID: UUID, anchorTo: UUID) {
    return this._blix.graphManager.removeEdge(graphUUID, anchorTo, CoreGraphUpdateParticipant.user);
  }

  async updateUIInputs(graphUUID: UUID, nodeUUID: UUID, nodeUIInputs: INodeUIInputs) {
    return this._blix.graphManager.updateUIInputs(
      graphUUID,
      nodeUUID,
      nodeUIInputs,
      CoreGraphUpdateParticipant.user
    );
  }

  async setNodePos(graphUUID: UUID, nodeUUID: UUID, pos: { x: number; y: number }) {
    return this._blix.graphManager.setPos(
      graphUUID,
      nodeUUID,
      pos.x,
      pos.y,
      CoreGraphUpdateParticipant.user
    );
  }

  async getGraph(uuid: UUID) {
    return this._blix.graphManager.getGraph(uuid);
  }

  async getAllGraphUUIDs() {
    return this._blix.graphManager.getAllGraphUUIDs();
  }

  async updateGraphMetadata(graphUUID: UUID, updatedMetadata: Partial<GraphMetadata>) {
    return this._blix.graphManager.updateGraphMetadata(
      graphUUID,
      updatedMetadata,
      CoreGraphUpdateParticipant.user
    );
  }

  async updateUIPositions(graphUUID: UUID, positions: { [key: UUID]: SvelvetCanvasPos }) {
    this._blix.graphManager.updateUIPositions(graphUUID, positions);
  }

  async getMediaOutputs(graphIds: UUID[]) {
    return this._blix.graphManager.getMediaOutputs(graphIds);
  }

  async clearAllMedia() {
    this._blix.graphManager.clearAllMedia();
  }

  async clearAllGraphs() {
    this._blix.graphManager.clearAllGraphs();
  }
}
