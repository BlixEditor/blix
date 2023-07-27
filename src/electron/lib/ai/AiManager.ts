import { NodeInstance, ToolboxRegistry } from "../registries/ToolboxRegistry";
import type { ChildProcessWithoutNullStreams } from "child_process";
import { spawn } from "child_process";
import logger from "../../utils/logger";
import { CoreGraphManager } from "../core-graph/CoreGraphManager";
import { LLMExportStrategy, type LLMGraph } from "../core-graph/CoreGraphExporter";
import { type QueryResponse } from "@shared/types";
// Refer to .env for api keys

//  TODO : Provide the graph context that will be given to ai as context

interface PromptContext {
  prompt: string;
  plugin: string[];
  nodes: string[];
  edges: string[];
}

interface Edge {
  id: string;
  input: string;
  output: string;
}

/* eslint-disable */
const object = {
  graph: {
    nodes: [
      {
        id: "78146e",
        signature: "hello-plugin.hello",
        inputs: [
          {
            id: "8be000",
            type: "number",
          },
          {
            id: "78b218",
            type: "number",
          },
          {
            id: "229d9c",
            type: "number",
          },
        ],
        outputs: [
          {
            id: "7d3c2a",
            type: "number",
          },
          {
            id: "f04bc3",
            type: "number",
          },
        ],
      },
      {
        id: "8dc87c",
        signature: "hello-plugin.hello",
        inputs: [
          {
            id: "dc5ea7",
            type: "number",
          },
          {
            id: "b5c22f",
            type: "number",
          },
          {
            id: "ba2a63",
            type: "number",
          },
        ],
        outputs: [
          {
            id: "fd9fbc",
            type: "number",
          },
          {
            id: "8c7054",
            type: "number",
          },
        ],
      },
    ],
    edges: [
      {
        id: "a62227",
        input: "dc5ea7",
        output: "7d3c2a",
      },
      {
        id: "k56227",
        input: "b5c22f",
        output: "f04bc3",
      },
    ],
  },
  nodeMap: {
    "78146e": "78146e4ad96e887992990959cbedc0bcfe0981e97d7731bb59dffc8c9bf1808f",
    "8dc87c": "8dc87c420a53ea4d0d5e36c349b32e3e12dcc6eccf553568b6b320884f7eca78",
  },
  edgeMap: {
    a62227: "a6222736d6703fd212baacef275a2c1f6a10027f463ea9d8d9b30ac3f9fb73c6",
  },
  anchorMap: {
    "8be000": "8be00013756174267b93ba94a4075c64b0067a4ace61ed5fe4c8a2f212432c41",
    "78b218": "78b218932ecb3f56fb4e513d83df19797ba1cd85447edc9da4d4cdac4b115b4f",
    "229d9c": "229d9cd00ebe8607d66cdc006878087317c8c4741ead61894ce3089f677fb311",
    "7d3c2a": "7d3c2aaed2e36fa332e321f528b0d87f1d5019239c5e145979bdd273c9532470",
    f04bc3: "f04bc3a4ab90cdc39312e6b6fcdf8b11870fa889e108003a176659b4ea463454",
    dc5ea7: "dc5ea7b8e5dfef6634501b4372e1b6bae35ffc2ca90d96c3293ce3ac9fadfb1e",
    b5c22f: "b5c22f859bba07bf9d4efb25caff5c69b7197e23af82c38ac29908289f4a6c5f",
    ba2a63: "ba2a63a1fd195c63b8f36a63e634de11f910f1b31ffb12945ca7e7afb6c7505e",
    fd9fbc: "fd9fbc94d9464a57edc31bc05ebe4020738e5b8081f1aa2d9281b4a577b078e4",
    "8c7054": "8c7054cf9a7ff089844bd706eff2a74a8c5c4724a3fb4b42fb27a716e6687450",
  },
};
/* eslint-enable */

type Response = {
  command: string;
  args: JSON;
};

/**
 *
 * Manages ai by storing context and handling prompt input
 * @param mainWindow Main window of blix application
 *
 * */
export class AiManager {
  private _graphManager: CoreGraphManager;
  private _toolboxRegistry: ToolboxRegistry;
  private _pluginContext: string[] = [];
  private _childProcess: ChildProcessWithoutNullStreams | null = null;
  private _promptContext: PromptContext | null = null;
  private currentGraph = "";
  private _exporter = new LLMExportStrategy();

  /**
   *
   * Initializes context of ai with all the nodes in the toolbox and the graph
   * @param toolbox This is the blix toolbox registry that contains all the nodes
   * @param graphManager This is the graph manager that manages the current graph
   *
   * */
  constructor(toolbox: ToolboxRegistry, graphManager: CoreGraphManager) {
    this._graphManager = graphManager;
    this._toolboxRegistry = toolbox;

    for (const index in toolbox.getRegistry()) {
      if (!toolbox.hasOwnProperty(index)) {
        const node: NodeInstance = toolbox.getRegistry()[index];
        this._pluginContext.push(node.signature + ": " + node.description);
      }
    }
    // console.log(this._pluginContext);

    const stringNodes: string[] = [];
    const stringEdges: string[] = [];

    for (const index of object.graph.nodes) {
      stringNodes.push(JSON.stringify(index));
    }

    for (const index of object.graph.edges) {
      stringEdges.push(JSON.stringify(index));
    }

    this._promptContext = {
      prompt: "This is initialized, replaced with prompt from python",
      plugin: this._pluginContext,
      nodes: stringNodes,
      edges: stringEdges,
    };

    // Need to bind dynamic function calls

    this.addNode = this.addNode.bind(this);
    this.removeNode = this.removeNode.bind(this);
    this.addEdge = this.addEdge.bind(this);
    this.removeEdge = this.removeEdge.bind(this);

    // this.sendPrompt();
    // console.log("Execute!")
    // console.log(this._graphManager.getAllGraphUUIDs());
  }

  async sendPrompt(prompt: string, id: string) {
    this.currentGraph = id;
    this._promptContext!.prompt = prompt;
    // "I want you to add a node to the graph, if an error occurs handle it according to the observation.";

    this._childProcess = spawn("python3", ["src/electron/lib/ai/python/api.py"]);

    const dataToSend2 = JSON.stringify(this._promptContext);
    this._childProcess.stdin.write(dataToSend2 + "\n");
    this._childProcess.stdin.write("end of transmission\n");

    // Receive output from the Python script
    this._childProcess.stdout.on("data", (data) => {
      const result = data.toString();
      logger.info("Received from Python:", result);

      // We are assuming that the json string is trusted, and in the correct format

      // Disabling eslint here is not ideal, however I am at my wits end , refer to this to see why this cannot be easily fixed :https://github.com/typescript-eslint/typescript-eslint/issues/2118

      /* eslint-disable */
      const parsed: Response = JSON.parse(result) as unknown as Response;
      /* eslint-enable */

      if (parsed.command === "response") {
        logger.info("Response from python : ", parsed.args);
        this._childProcess?.stdin.end();
        return;
      }

      const magicWand: { [K: string]: (args: JSON) => string } = {
        addNode: this.addNode,
        removeNode: this.removeNode,
        addEdge: this.addEdge,
        removeEdge: this.removeEdge,
      };

      if (magicWand[parsed.command]) {
        const response = magicWand[parsed.command](parsed.args);
        logger.info("blix response:", response);
        this._childProcess?.stdin.write(response + "\n");
        this._childProcess?.stdin.write("end of transmission\n");
      } else {
        this._childProcess?.stdin.write("Execution Error: Command does not exist");
        this._childProcess?.stdin.write("end of transmission\n");
      }

      // console.log(parsed);
      // console.log(parsed.args);
    });

    // Handle errors
    this._childProcess.stderr.on("data", (data) => {
      const result = data.toString();

      logger.warn("Error executing Python script: ", result);
    });

    // Handle process exit
    this._childProcess.on("close", (code) => {
      if (code == null) logger.warn(`Python script exited with code null`);
      else logger.warn(`Python script exited with code ${code}`);
    });
  }

  /**
   * Calls addNode from coreGraphManager to add a node to the graph
   * @param args Json object that contains the arguments for the addNode function :
   * interface :
   * Args {
   * signature : string
   * }
   *
   * @returns Returns a string that contains the response from the graphManager
   * */
  addNode(args: JSON): string {
    try {
      interface Args {
        signature: string;
      }

      const obj = args as unknown as Args;

      const node = this._toolboxRegistry.getNodeInstance(obj.signature);
      if (node === undefined)
        return this.errorResponse("The provided signature is invalid :  node does not exist");

      const response = this._graphManager.addNode(this.currentGraph, node);

      if (response.status === "success") {
        // Truncate ids
        response.data!.inputs = this.truncId(response.data!.inputs);
        response.data!.outputs = this.truncId(response.data!.outputs);
        response.data!.nodeId = this.truncId([response.data!.nodeId])[0];
      }

      return JSON.stringify(response);
    } catch (error) {
      return this.errorResponse(error as string);
    }
  }

  /**
   *
   * Calls removeNode from coreGraphManager to remove a node from the graph
   * @param args Json object that contains the arguments for the removeNode function :
   * interface :
   * Args {
   * id : string
   * }
   *
   * @returns Returns a string that contains the response from the graphManager
   * */

  removeNode(args: JSON): string {
    try {
      interface Args {
        id: string;
      }

      const obj = args as unknown as Args;

      const graph = this.getGraph();
      const { nodeMap } = graph;

      const fullId = nodeMap[obj.id];
      if (fullId === undefined)
        return this.errorResponse("The provided id is invalid :  id does not exist");

      this._graphManager.removeNode(this.currentGraph, fullId);
      return "Success, node removed successfully";
    } catch (error) {
      return this.errorResponse(error as string);
    }
  }

  /**
   *
   * Calls addEdge from coreGraphManager to add an edge to the graph
   * @param args Json object that contains the arguments for the addEdge function :
   * interface :
   * Args {
   * output : string
   * input : string
   * }
   *
   * @returns Returns a string that contains the response from the graphManager
   * */

  addEdge(args: JSON): string {
    try {
      interface Args {
        output: string;
        input: string;
      }

      const obj = args as unknown as Args;
      const graph = this.getGraph();

      const { anchorMap } = graph;

      const output = anchorMap[obj.output];

      if (output === undefined) {
        throw new Error("Output anchor does not exist");
      }
      const input = anchorMap[obj.input];

      const response = this._graphManager.addEdge(this.currentGraph, input, output);
      return JSON.stringify(response);
    } catch (error) {
      // Manual error to give ai
      return this.errorResponse(error as string);
    }
  }

  /**
   * Finds an edge object based on its id
   * @param edges Interface that holds edge id, input anchor id and output anchor id
   * @param id Id of the edge to be found
   * @returns The edge that was found, or returns undefined
   * */

  findEdgeById(edges: Edge[], id: string): Edge | undefined {
    return edges.find((edge) => edge.id === id);
  }

  /**
   *
   * Calls removeEdge from coreGraphManager to remove an edge from the graph, id of edge is provided.
   * @param args Json object that contains the arguments for the removeEdge function :
   * interface :
   * Args {
   * id : string
   * }
   *
   * @returns Returns a string that contains the response from the graphManager
   * */

  removeEdge(args: JSON): string {
    try {
      interface Args {
        id: string;
      }

      const obj = args as unknown as Args;
      const graph = this.getGraph();
      const edge = this.findEdgeById(graph.graph.edges, obj.id);

      if (edge) {
        const graph = this.getGraph();

        const { anchorMap } = graph;
        const anchor = anchorMap[edge?.input];
        try {
          this._graphManager.removeEdge(this.currentGraph, anchor);
          return "Success, edge removed successfully";
        } catch (error) {
          return error as string;
        }
      } else return "The given edge does not exist";
    } catch (error) {
      // Manual error to give ai
      return "Critical error : Something went completely wrong, terminate execution.";
    }
  }

  getGraph(): LLMGraph {
    return this._exporter.export(this._graphManager.getGraph(this.currentGraph));
  }

  truncId(arr: string[]): string[] {
    return arr.map((str) => str.slice(0, 6));
  }

  errorResponse(message: string): string {
    const response: QueryResponse = {
      status: "error",
      message,
    };
    return JSON.stringify(response);
  }
}
