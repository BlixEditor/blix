<script lang="ts">
  import { writable } from "svelte/store";
  import { UIValueStore } from "@shared/ui/UIGraph";
  import ColorPicker from "svelte-awesome-color-picker";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";
  import ColorPickerWrapper from "./ColorPicker/ColorPickerWrapper.svelte";
  import ColorPickerTextInput from "./ColorPicker/ColorPickerTextInput.svelte";
  import { createEventDispatcher, onMount } from "svelte";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;
  const dispatch = createEventDispatcher();

  if (!inputStore.inputs[config.componentId])
    inputStore.inputs[config.componentId] = writable("#f43e5c");

  $: valStore = inputStore.inputs[config.componentId];

  $: if (valStore) {
    let first = true;
    let prev = performance.now();
    valStore.subscribe((value) => {
      const now = performance.now();
      if (!first) {
        if (now - prev >= 1000) {
          dispatch("inputInteraction", { id: config.componentId, value });
        }
      } else {
        first = false;
      }
      prev = now;
    });
  }
</script>

<div class="picker">
  <!-- Old Svelvet ColorPicker: -->
  <!-- <ColorPicker parameterStore="{inputStore.inputs[config.componentId]}" /> -->
  <!-- <ColorPicker parameterStore="{valStore}" on:wheelReleased="{handleInputInteraction}" /> -->

  {#if typeof $valStore === "string"}
    <!-- label="{config.label}" -->
    <div class="row">
      <div class="text-left">
        {config.label}
      </div>
      <div>
        <ColorPicker
          bind:hex="{$valStore}"
          label=""
          components="{{
            wrapper: ColorPickerWrapper,
            textInput: ColorPickerTextInput,
          }}"
        />
      </div>
    </div>
  {:else}
    ERR: Invaid colour: {JSON.stringify($valStore)}
  {/if}
</div>

<style>
  .picker {
    margin: auto;
    width: 100%;
    height: 100%;
  }

  .row {
    display: grid;
    grid-template-columns: auto 6em;
  }

  /* .picker :global(label .color) {
		width: 45px !important;
		height: 24px !important;
		border-radius: 8px !important;
    border: 2px solid black;
	}

  .picker :global(label .alpha) {
    position: absolute !important;
		width: 45px !important;
		height: 24px !important;
    border-radius: 0px !important;
  }

  .picker :global(label .alpha::after) {
    position: absolute;
    content: '' !important;
		width: 45px !important;

		height: 24px !important;
    border-radius: 0px !important;
  } */
</style>
