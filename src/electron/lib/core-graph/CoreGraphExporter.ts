import { ToolboxRegistry } from "../registries/ToolboxRegistry";
import { type AnchorUUID, CoreGraph } from "./CoreGraph";
import { NodeStyling } from "./CoreGraph";

/**
 * This class is used to export a CoreGraph to external representations
 */
export class CoreGraphExporter<T> {
  constructor(private exporter: ExportStrategy<T>) {}

  exportGraph(graph: CoreGraph): T {
    return this.exporter.export(graph);
  }
}

interface ExportStrategy<T> {
  export(graph: CoreGraph): T;
}

export type GraphToJSON = { nodes: NodeToJSON[]; edges: EdgeToJSON[] };
export type NodeToJSON = { signature: string; styling: NodeStyling | null };
export type AnchorToJSON = { parent: string; id: string };
export type EdgeToJSON = {
  anchorFrom: AnchorToJSON;
  anchorTo: AnchorToJSON;
};

export class GraphFileExportStrategy implements ExportStrategy<GraphToJSON> {
  export(graph: CoreGraph): GraphToJSON {
    return { nodes: this.nodesToJSON(graph), edges: this.edgesToJSON(graph) };
  }

  nodesToJSON(graph: CoreGraph): NodeToJSON[] {
    const json: NodeToJSON[] = [];
    for (const node in graph.getNodes) {
      if (!graph.getNodes.hasOwnProperty(node)) continue;
      json.push({
        signature: `${graph.getNodes[node].getPlugin}.${graph.getNodes[node].getName}`,
        styling: graph.getNodes[node].getStyling || null,
      });
    }

    return json;
  }

  edgesToJSON(graph: CoreGraph): EdgeToJSON[] {
    const json: EdgeToJSON[] = [];
    for (const anchorFrom in graph.getEdgeSrc) {
      if (!graph.getEdgeSrc.hasOwnProperty(anchorFrom)) continue;
      const anchorTos: AnchorUUID[] = graph.getEdgeSrc[anchorFrom];
      for (const anchorTo of anchorTos) {
        json.push({
          anchorFrom: {
            parent: graph.getAnchors[anchorFrom].parent.uuid,
            id: graph.getAnchors[anchorFrom].anchorId,
          },
          anchorTo: {
            parent: graph.getAnchors[anchorTo].parent.uuid,
            id: graph.getAnchors[anchorTo].anchorId,
          },
        });
      }
    }
    return json;
  }
}

class YamlExportStrategy implements ExportStrategy<string> {
  export(graph: CoreGraph): string {
    throw Error("YamlExportStrategy not implemented");
  }
}

type LLMGraph = {
  graph: {
    nodes: {
      id: string;
      signature: string;
      inputs: {
        id: string;
        type: string;
      }[];
      outputs: {
        id: string;
        type: string;
      }[];
    }[];
    edges: {
      id: string;
      input: string;
      output: string;
    }[];
  };
  nodeMap: Record<string, string>;
  edgeMap: Record<string, string>;
  anchorMap: Record<string, string>;
};

class LLMExportStrategy implements ExportStrategy<LLMGraph> {
  export(graph: CoreGraph): LLMGraph {
    const llmGraph: LLMGraph = {
      graph: {
        nodes: [],
        edges: [],
      },
      nodeMap: {},
      edgeMap: {},
      anchorMap: {},
    };

    Object.values(graph.getNodes).forEach((n) => {
      const node = {
        id: n.uuid,
        signature: n.getSignature,
        inputs: [],
        outputs: [],
      };

      Object.values(n.getAnchors).forEach((a) => {
        if (a.ioType === 0) {
          // input
        } else if (a.ioType === 1) {
          // output
        }
      });

      llmGraph.graph.nodes.push(node);
      llmGraph.nodeMap[node.id] = node.id.slice(0, 6);
    });

    return llmGraph;
  }
}
