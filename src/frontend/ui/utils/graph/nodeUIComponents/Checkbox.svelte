<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;

  if (!inputStore.inputs[config.componentId])
    inputStore.inputs[config.componentId] = writable(false);

  $: valStore = inputStore.inputs[config.componentId];
</script>

<label>
  <input type="checkbox" bind:checked="{$valStore}" />
  <span class="label">{config.label}</span>
</label>

<style>
  label {
    color: #cdd6f4;
    /* background-color: #1f1f28; */
    border: none;
    padding: 0.1em;
    text-align: left;
  }

  .label {
    margin-left: 0.5em;
  }
</style>
