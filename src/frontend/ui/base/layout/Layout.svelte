<script lang="ts">
  import { faFolder } from "@fortawesome/free-solid-svg-icons";
  import { projectsStore } from "@frontend/lib/stores/ProjectStore";
  import { shortcutsRegistry } from "@frontend/lib/stores/ShortcutStore";
  import Fa from "svelte-fa";
  import Panel from "./Panel.svelte";
  import { commandStore } from "../../../lib/stores/CommandStore";
  import Shortcuts from "../../utils/Shortcuts.svelte";

  const openProjectHotkeys = shortcutsRegistry.getFormattedShortcutsForActionReactive(
    "blix.projects.openProject"
  );
  const newProjectHotkeys = shortcutsRegistry.getFormattedShortcutsForActionReactive(
    "blix.projects.newProject"
  );

  const shortcuts = {
    "blix.projects.openProject": async () => {
      await commandStore.runCommand("blix.projects.open");
    },
  };
</script>

{#if $projectsStore.activeProject}
  {#each $projectsStore.projects || [] as project (project.id)}
    <div class="fullScreen" class:hidden="{$projectsStore.activeProject.id !== project.id}">
      <Panel layout="{project.layout}" horizontal="{false}" height="100%" />
    </div>
  {/each}
{:else}
  <div class="placeholder select-none">
    <div class="icon"><Fa icon="{faFolder}" style="display: inline-block" /></div>
    <div class="flex space-x-2 pb-2">
      <h2 class="text-zinc-400">Open a project</h2>
      {#each $openProjectHotkeys as hotkey}
        <span
          class="flex flex-nowrap items-center rounded-md bg-zinc-700 px-2 text-sm text-zinc-300 shadow-inner"
        >
          {hotkey}
        </span>
      {/each}
    </div>
    <div class="flex space-x-2">
      <h2 class="text-zinc-400">Create a new project</h2>
      {#each $newProjectHotkeys as hotkey}
        <span
          class="flex flex-nowrap items-center rounded-md bg-zinc-700 px-2 text-sm text-zinc-300 shadow-inner"
        >
          {hotkey}
        </span>
      {/each}
    </div>
  </div>
{/if}

<Shortcuts shortcuts="{shortcuts}" />

<style lang="scss">
  .fullScreen {
    padding: 0px;
    margin: 0px;
    height: 100%;
    width: 100%;
  }

  .hidden {
    display: none;
  }
  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    h1 {
      font-size: 1.5em;
      color: #a8a8be;
    }

    .icon {
      width: 100%;
      color: #9090a4;
      font-size: 5em;
      line-height: 1em;
      margin-bottom: 0.1em;
    }

    h2 {
      font-size: 1em;
      color: #9090a4;
    }
  }
</style>
