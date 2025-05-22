import { z } from "zod";
import type { SvelteComponent } from "svelte";

export type ZodProperties<X> = Required<{
  [K in keyof X]: z.ZodType<X[K], any, X[K]>;
}>;

export type ControlType =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "enum"
  | "array"
  | "object"
  | "optional"
  | "nullable";
export type Theme = Record<ControlType, SvelteComponent<any>>;
