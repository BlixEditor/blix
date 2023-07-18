import { CommandRegistry } from "./registries/CommandRegistry";
import { ToolboxRegistry } from "./registries/ToolboxRegistry";
import { TileRegistry } from "./registries/TileRegistry";
import { ProjectManager } from "./projects/ProjectManager";
import type { MainWindow } from "./api/apis/WindowApi";
import { CoreGraphManager } from "./core-graph/CoreGraphManager";
import { PluginManager } from "./plugins/PluginManager";
import { IPCGraphSubscriber } from "./core-graph/CoreGraphInteractors";
import type { UUID } from "../../shared/utils/UniqueEntity";
import type { UIGraph } from "../../shared/ui/UIGraph";
import { blixCommands } from "./BlixCommands";
import logger from "../utils/logger";

// Encapsulates the backend representation for
// the entire running Blix application
export class Blix {
  private readonly _toolbox: ToolboxRegistry;
  private readonly _tileRegistry: TileRegistry;
  private readonly _commandRegistry: CommandRegistry;
  private _graphManager!: CoreGraphManager;
  private _projectManager!: ProjectManager;
  private _pluginManager!: PluginManager;
  private _mainWindow!: MainWindow;

  // private startTime: Date;

  // TODO: We'll need a layout registry as well which can save its state to a file
  // private layoutRegistry: LayoutRegistry;
  // private currentLayout: LayoutId;

  constructor() {
    // this.startTime = new Date();
    this._toolbox = new ToolboxRegistry();
    this._commandRegistry = new CommandRegistry(this);
    this._tileRegistry = new TileRegistry();
  }

  /**
   * Initializes the managers of the electron app after the Main Window has been
   * instantiated. **Do not** change the implementation so that it passes in the
   * window through the constructor.
   *
   * @param mainWindow
   */
  public async init(mainWindow: MainWindow) {
    this._mainWindow = mainWindow;

    for (const command of blixCommands) {
      this.commandRegistry.addInstance(command);
    }

    // Load plugins before instantiating any managers
    this._pluginManager = new PluginManager(this);
    await this._pluginManager.loadBasePlugins();

    this._graphManager = new CoreGraphManager(mainWindow, this._toolbox);
    this._projectManager = new ProjectManager(mainWindow);

    // Add subscribers
    const graphSubscriber = new IPCGraphSubscriber();

    graphSubscriber.listen = (graphId: UUID, newGraph: UIGraph) => {
      mainWindow.apis.graphClientApi.graphChanged(graphId, newGraph);
    };

    this._graphManager.addAllSubscriber(graphSubscriber);
  }

  sendInformationMessage(message: string) {
    this._mainWindow.apis.utilClientApi.showToast({ message, type: "info" });
  }

  sendWarnMessage(message: string) {
    this._mainWindow.apis.utilClientApi.showToast({ message, type: "warn" });
  }

  sendErrorMessage(message: string) {
    this._mainWindow.apis.utilClientApi.showToast({ message, type: "error" });
  }

  sendSuccessMessage(message: string) {
    this._mainWindow.apis.utilClientApi.showToast({ message, type: "success" });
  }

  get toolbox(): ToolboxRegistry {
    return this._toolbox;
  }

  get tileRegistry(): TileRegistry {
    return this._tileRegistry;
  }

  get commandRegistry(): CommandRegistry {
    return this._commandRegistry;
  }

  get graphManager(): CoreGraphManager {
    return this._graphManager;
  }

  get projectManager(): ProjectManager {
    return this._projectManager;
  }

  get mainWindow(): MainWindow | null {
    return this._mainWindow;
  }
}
