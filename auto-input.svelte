<script lang="ts" generics="T extends Record<string, unknown>">
  import { z } from "zod";
  import type { ControlType, Theme } from "./types";

  import TextInput from "./text-input.svelte";
  import ToggleInput from "./toggle-input.svelte";
  import SelectInput from "./select-input.svelte";
  import type { SuperForm } from "sveltekit-superforms";
  import type { SvelteComponent } from "svelte";
  import ObjectInput from "./object-input.svelte";
  import ArrayInput from "./array-input.svelte";
  import OptionalInput from "./optional-input.svelte";

  type Props = {
    schema: z.ZodAny;
    theme?: Theme;
    label?: string;
    path?: string;
    uiSchema?: Record<string, typeof SvelteComponent<any>>;
    extraProps?: Record<string, any>;
    superform: SuperForm<T>;
  };

  const DEFAULT_THEME: Record<string, typeof SvelteComponent<any>> = {
    text: TextInput,
    number: TextInput,
    boolean: ToggleInput,
    date: TextInput,
    enum: SelectInput,
    array: ArrayInput,
    object: ObjectInput,
    optional: OptionalInput,
    nullable: OptionalInput,
  };

  function getControlType(fieldSchema: z.ZodTypeAny): ControlType {
    if (fieldSchema instanceof z.ZodString) {
      return "text";
    } else if (fieldSchema instanceof z.ZodNumber) {
      return "number";
    } else if (fieldSchema instanceof z.ZodBoolean) {
      return "boolean";
    } else if (fieldSchema instanceof z.ZodDate) {
      return "date";
    } else if (fieldSchema instanceof z.ZodEnum) {
      return "enum";
    } else if (fieldSchema instanceof z.ZodArray) {
      return "array";
    } else if (fieldSchema instanceof z.ZodObject) {
      return "object";
    } else if (fieldSchema instanceof z.ZodOptional) {
      return "optional";
    } else if (fieldSchema instanceof z.ZodNullable) {
      return "nullable";
    } else {
      return "text"; // デフォルト
    }
  }

  const { schema, uiSchema, label, theme, path, extraProps, superform }: Props = $props();
  const Component = (uiSchema ?? {})[path ?? ""] as any;
  const componentProps = (extraProps ?? {})[path ?? ""] as any;
</script>

{#if Component != null}
  <Component
    {schema}
    {uiSchema}
    {theme}
    {label}
    {path}
    {superform}
    {extraProps}
    {...componentProps}
  />
{:else}
  {@const DefaultComponent = DEFAULT_THEME[getControlType(schema)]}
  <DefaultComponent
    {schema}
    {uiSchema}
    {theme}
    {label}
    {path}
    {superform}
    {extraProps}
    {...componentProps}
  />
{/if}
