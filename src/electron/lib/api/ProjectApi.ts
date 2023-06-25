import type { ElectronMainApi } from "electron-affinity/main";
import type { Blix } from "../Blix";
import type { UUID } from "../../../shared/utils/UniqueEntity";
import type { IpcResponse } from "./IpcResponse";
import type { CommonProject } from "../../../shared/types/index";
import logger from "../../utils/logger";

export class ProjectApi implements ElectronMainApi<ProjectApi> {
  private readonly _projMgr;

  // @ts-ignore
  constructor(private readonly _blix: Blix) {
    this._projMgr = this._blix.projectManager;
  }

  async createProject(): Promise<IpcResponse<CommonProject>> {
    return {
      success: true,
      data: this._projMgr.createProject().mapToCommonProject(),
    };
  }

  async closeProject(uuid: UUID) {
    this._projMgr.closeProject(uuid);
  }

  async renameProject(uuid: UUID, name: string): Promise<IpcResponse<string>> {
    if (this._projMgr.renameProject(uuid, name)) {
      return {
        success: true,
        data: "Project renamed successfully.",
      };
    } else {
      return {
        success: false,
        data: "Project renamed failed.",
      };
    }
  }

  // async getOpenProjects(): Promise<FrontendProject[]> {
  //   logger.info("Retrieving open projects");
  //   return this._projMgr.getOpenProjects().map((proj) => proj.mapToFrontendProject());
  // }
}
