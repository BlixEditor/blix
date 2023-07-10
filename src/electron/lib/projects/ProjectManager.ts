import { CoreProject } from "./CoreProject";
import logger from "../../utils/logger";
import { join } from "path";
import { app } from "electron";
import type { PathLike } from "fs";
import type { UUID } from "../../../shared/utils/UniqueEntity";
import type { MainWindow } from "../api/apis/WindowApi";
import type { SharedProject, LayoutPanel } from "../../../shared/types";
import { dialog } from "electron";
import type { IpcResponse } from "../api/MainApi";
import type { ProjectFile } from "./CoreProject";
import { readFile } from "fs/promises";
import { z } from "zod";

export class ProjectManager {
  private _projects: { [id: string]: CoreProject };
  private _mainWindow: MainWindow;

  constructor(mainWindow: MainWindow) {
    this._mainWindow = mainWindow;
    this._projects = {};
  }

  /**
   *	Creates a new CoreProject with the given name and a starter layout.
   *
   *	@param name The name of the project.
   *
   *	@returns The newly created project.
   */
  public createProject(name = "Untitled"): CoreProject {
    const starterLayout: LayoutPanel = {
      panels: [
        {
          content: "debug",
        },
        {
          content: "graph",
        },
      ],
    };
    const project = new CoreProject(name, starterLayout);
    this._projects[project.uuid] = project;
    return project;
  }
  /**
   * This function will load a project that is stored on a user's device.
   *
   * @param fileName Project name derived from file name
   * @param fileContent Project file content
   * @param path Path to project file
   * @returns UUID of new CoreProject
   */
  public loadProject(fileName: string, fileContent: ProjectFile, path: PathLike): UUID {
    const project = new CoreProject(fileName, fileContent.layout);
    project.location = path;
    this._projects[project.uuid] = project;
    return project.uuid;
  }

  public getProject(id: UUID): CoreProject | null {
    return this._projects[id];
  }

  public removeProject(uuid: UUID) {
    delete this._projects[uuid];
  }

  public getOpenProjects() {
    return Object.values(this._projects);
  }

  public renameProject(uuid: UUID, name: string) {
    if (this._projects.hasOwnProperty(uuid)) {
      return this._projects[uuid].rename(name);
    } else {
      return false;
    }
  }

  public async getRecentProjectsList(): Promise<RecentProject[]> {
    try {
      const filePath = join(app.getPath("userData"), "recentProjects.json");
      const contents = await readFile(filePath, "utf8");
      return recentProjectsSchema.parse(JSON.parse(contents)).projects;
    } catch (err) {
      logger.error("Could not retrieve recent project list");
      return [];
    }
  }

  // loadRecentProjects(): void {
  //   const projects = fs.readdirSync(this._path);
  //   if (!projects) {
  //     return;
  //   }
  //   const recentProjects: SharedProject[] = [];
  //   for (const project of projects) {
  //     if (project === ".DS_Store") continue; // Some File returned when using readdirSync on mac
  //     const data = JSON.parse(fs.readFileSync(join(this._path, project)).toString());
  //     // TODO:
  //     // At the moment we just create a project with the name, we dont actually load the graphs or layout
  //     const newProject: CoreProject = this.createProject(data.name as string);
  //     this._projects[newProject.uuid] = newProject;
  //     recentProjects.push(newProject.toSharedProject());
  //     fs.unlinkSync(join(this._path, project));
  //   }

  //   // console.log(this._mainWindow?.apis.clientProjectApi)
  //   this._mainWindow.apis.projectClientApi.loadProjects(recentProjects);
  // }

  // async loadProject(options: "openFile" | "openDirectory" | "multiSelections") {
  //   const result = await this.createDialogBox(options);
  //   if (!(result && !result.canceled && result.filePaths.length > 0)) return;

  //   const project = fs.readFileSync(result.filePaths[0]);
  //   if (!project) {
  //     return;
  //   }

  //   const data = JSON.parse(project.toString());

  //   if (!this.validateProjectFile(data)) return; // Some sort of error

  //   this._mainWindow.apis.projectClientApi.loadProject(
  //     this.createProject(data.name as string).toSharedProject()
  //   );
  // }

  async createDialogBox(options: "openFile" | "openDirectory" | "multiSelections") {
    if (!this._mainWindow) return;
    return await dialog.showOpenDialog(this._mainWindow, {
      properties: [options],
      filters: [{ name: "Projects", extensions: ["blx"] }],
    });
  }

  async updateLayout(id: UUID, layout: LayoutPanel) {
    this._projects[id].layout = layout;
  }

  validateProjectFile(data: any): boolean {
    // if(!data.id || !data.name || !data.layout) return false;
    return true;
  }

  /**
   * Adds a graph to a project.
   *
   * @param projectId - The UUID of the project to add the graph to.
   * @param graphId - The UUID of the graph to add.
   */
  public addGraph(projectId: UUID, graphId: UUID): boolean {
    const project = this._projects[projectId];

    if (project) {
      project.addGraph(graphId);
      // TODO: Notify frontend of project change
      return true;
    }

    return false;
  }
}

const recentProjectsSchema = z.object({
  projects: z.array(
    z.object({
      name: z.string(),
      path: z.string(),
      date: z.string().datetime(),
    })
  ),
});

type RecentProject = z.infer<typeof recentProjectsSchema>["projects"][number];
