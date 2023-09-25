import type { Registry } from "./Registry";
import type { ICommand } from "../../../shared/types";
import { Blix } from "../Blix";
import type { RendererId, RendererURL } from "../../../shared/types/typeclass";
import {
  type DisplayableMediaOutput,
  type MediaDisplayConfig,
  MediaDisplayType,
  type MediaOutput,
} from "../../../shared/types/media";
import logger from "../../utils/logger";

export type TypeclassId = string;
export type TypeConverter = (value: any) => any;

export interface Typeclass {
  id: TypeclassId;
  description: string | null;
  subtypes: TypeclassId[];
  mediaDisplayConfig: (data: any) => MediaDisplayConfig;
}

// Maximum depth through which we'll traverse the
// type conversion graph when checking if types are compatible
const MAX_SEARCH_DEPTH = 2;

// Pixi <image>
// number[]
// string

export class TypeclassRegistry implements Registry {
  private renderers: { [key: RendererId]: RendererURL } = {};
  // The set of all typeclasses allowed in Blix
  private typeclasses: { [key: TypeclassId]: Typeclass } = {};
  // Implicit conversion functions between typeclasses
  private converters: { [key: TypeclassId]: { [key: TypeclassId]: TypeConverter } } = {};

  constructor(private readonly blix: Blix) {
    // Add default Blix types
    baseTypes.forEach((baseType) => {
      this.addInstance(baseType);
    });

    baseConverters.forEach((baseConverter) => {
      this.addConverter(...baseConverter);
    });
  }

  /**
   * Adds a typeclass instance to the registry.
   * The instance will not be added if it already exists, unless `force` is true.
   * The instance must be defined.
   * This function will also notify the main window of the change.
   * @param instance
   * @param force default :  false
   * @returns
   */

  addInstance(instance: Typeclass, force = false): void {
    if (!instance) {
      logger.warn("Invalid Typeclass");
      return;
    }
    if (this.typeclasses[instance.id] && !force) {
      logger.warn(`Typeclass ${instance.id} already exists`);
      return;
    }
    this.typeclasses[instance.id] = instance;
    this.blix.mainWindow?.apis.commandClientApi.registryChanged(this.getTypeclasses());
  }

  /**
   * @returns All typeclasses in the registry.
   */
  getRegistry() {
    return { ...this.typeclasses };
  }

  // ADD DOC
  /**
   * Inserts a new converter into the registry's converter array
   * @param from input type
   * @param to output type
   * @param converter converter to be inserted
   */
  addConverter(from: TypeclassId, to: TypeclassId, converter: TypeConverter): void {
    if (!this.converters[from]) {
      this.converters[from] = {};
    }
    this.converters[from][to] = converter;
  }

  // Returns a composite converter from `from` to `to`
  /**
   * Searches for a composite converter from `from` to `to`. If none is found, returns null.
   * @param from input type
   * @param to output type
   * @param depth Specifies how deep the search should go. Default is 2.
   * @returns Returns a composite converter from `from` to `to`
   */
  resolveConversion(from: TypeclassId, to: TypeclassId, depth?: number): TypeConverter | null {
    depth = depth ?? MAX_SEARCH_DEPTH;
    if (depth <= 0) return null;

    const fromConverters = this.converters[from];
    if (!fromConverters) return null;

    // Direct converter found
    if (fromConverters[to]) return fromConverters[to];

    // NOTE: This uses depth-first search, which is fine for small depths,
    //       but may be slow for large depths later on
    for (const localTo of Object.keys(fromConverters)) {
      const res = this.resolveConversion(localTo, to, depth - 1);

      // Converter path found
      if (res !== null) {
        const direct = fromConverters[localTo];
        return (value: any) => res(direct(value));
      }
    }

    return null;
  }

  // Returns true if the `from` type is compatible with the `to` type
  /**
   * Returns true if the `from` type is compatible with the `to` type
   * @param from
   * @param to
   */
  checkTypesCompatible(from: TypeclassId, to: TypeclassId): boolean {
    // Handle base cases
    if (from === to || from === "" || to === "") return true;

    // Check for possible implicit conversions
    const res = this.resolveConversion(from, to) !== null;
    return res;
  }

  getTypeclasses(): ICommand[] {
    const commands: ICommand[] = [];
    // for (const key in this.registry) {
    //   if (key in this.registry) {
    //     const command = this.registry[key];
    //     const commandObject: ICommand = { /* TODO */ };
    //     commands.push(commandObject);
    //   }
    // }
    return commands;
  }

  getDisplayableMedia(value: MediaOutput): DisplayableMediaOutput {
    // Get display config
    const typeclass = this.typeclasses[value.dataType];
    if (!typeclass) {
      // Invalid typeclass
      const stringifiedContent = JSON.stringify(value.content);
      return {
        ...value,
        display: {
          displayType: MediaDisplayType.TextBox,
          props: {
            content: `INVALID TYPE: ${value.dataType}\nCONTENT: ${stringifiedContent}`,
            status: "error",
          },
          contentProp: null,
        },
      } as DisplayableMediaOutput;
    }

    const display = typeclass.mediaDisplayConfig(value.content);
    return {
      ...value,
      display,
    };
  }

  addRenderer(id: RendererId, url: RendererURL): void {
    if (!this.renderers[id]) this.renderers[id] = url;
  }

  getRendererSrc(id: RendererId): RendererURL | null {
    return this.renderers[id] || null;
  }
}

const baseTypes: Typeclass[] = [
  {
    id: "",
    description: "The `any` type, into which all other types can fit",
    subtypes: [],
    mediaDisplayConfig: (_data: any) => ({
      displayType: MediaDisplayType.TextBox,
      props: {
        content: "NO INPUT",
        status: "warning",
      },
      contentProp: "content",
    }),
  },
  {
    id: "number",
    description: "A simple integer or floating point number",
    subtypes: [],
    mediaDisplayConfig: (data: number) => ({
      displayType: MediaDisplayType.TextBox,
      props: {
        content: data?.toString() || "NULL",
        status: data == null ? "warning" : "normal",
        fontSize: "large",
      },
      contentProp: "content",
    }),
  },
  {
    id: "string",
    description: "A string of characters",
    subtypes: [],
    mediaDisplayConfig: (data: string) => ({
      displayType: MediaDisplayType.TextBox,
      props: {
        content: data,
      },
      contentProp: "content",
    }),
  },
  {
    id: "boolean",
    description: "A true/false value",
    subtypes: [],
    mediaDisplayConfig: (data: number) => ({
      displayType: MediaDisplayType.TextBox,
      props: {
        content: data?.toString() || "NULL",
        status: data == null ? "warning" : "normal",
        fontSize: "large",
      },
      contentProp: "content",
    }),
  },
  {
    id: "color",
    description: "An RGBA hex value",
    subtypes: [],
    mediaDisplayConfig: (data: string) => ({
      displayType: MediaDisplayType.ColorDisplay,
      props: {
        color: data,
      },
      contentProp: "color",
    }),
  },
  {
    id: "image",
    description: "A 2D array of RGBA pixel values",
    subtypes: [],
    mediaDisplayConfig: (data: string) => ({
      displayType: MediaDisplayType.Image,
      props: {
        src: data,
      },
      contentProp: "src",
    }),
  },
  {
    id: "error",
    description: "An object representing an error state during graph computation",
    subtypes: [],
    mediaDisplayConfig: (data: string) => ({
      displayType: MediaDisplayType.TextBox,
      props: {
        content: data,
        status: "error",
      },
      contentProp: "content",
    }),
  },
];

export type ConverterTriple = [TypeclassId, TypeclassId, TypeConverter];

// [from, to, converter]
const baseConverters: ConverterTriple[] = [
  ["number", "string", (value: number) => value.toString()],
  ["string", "number", (value: string) => parseFloat(value)],
  ["boolean", "string", (value: boolean) => (value ? "true" : "false")],
  ["string", "boolean", (value: string) => value.toLowerCase() === "true"],
  ["number", "boolean", (value: number) => value !== 0],
];
