<script lang="ts">
  import {
    ShortcutCombo,
    type ShortcutAction,
    shortcutsRegistry,
  } from "@frontend/lib/stores/ShortcutStore";

  export let shortcuts: { [key: ShortcutAction]: (event?: KeyboardEvent) => any } = {};

  function handleKeyPress(event: KeyboardEvent) {
    const combo = ShortcutCombo.fromEvent(event);

    // TODO: Optimize; Perhaps build a reverse-mapping from combo to action and
    //       keep it updated as relevant entries in the shortcutsRegistry change

    // Check each action
    for (const action of Object.keys(shortcuts)) {
      if (combo && shortcutsRegistry.checkShortcut(action as ShortcutAction, combo)) {
        shortcuts[action as ShortcutAction](event);
      }
    }
  }
</script>

<svelte:window on:keydown="{handleKeyPress}" />
