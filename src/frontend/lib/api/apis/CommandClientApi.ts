import type { ElectronWindowApi } from "electron-affinity/window";
import { commandStore } from "../../stores/CommandStore";
import type { ICommand } from "@shared/types";

export class CommandClientApi implements ElectronWindowApi<CommandClientApi> {
  registryChanged(results: ICommand[]) {
    commandStore.refreshStore(results);
  }
}
