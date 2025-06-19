<script lang="ts" generics="T extends Record<string, unknown>">
  import { z } from "zod";
  import type { Theme, ZodProperties } from "./types";

  import type { FormPathLeaves, SuperForm } from "sveltekit-superforms";
  import AutoInput from "./auto-input.svelte";
  import type { SvelteComponent } from "svelte";

  interface Props {
    schema: z.ZodObject<ZodProperties<any>>;
    theme?: Theme;
    label?: string;
    path?: string;
    uiSchema?: Record<string, typeof SvelteComponent<any>>;
    extraProps?: Record<string, any>;
    superform: SuperForm<T>;
    order?: Array<string>;
  }

  function appendPath(field: string): FormPathLeaves<T> {
    if (path == null || path == "") {
      return field as FormPathLeaves<T>;
    } else {
      return `${path}.${field}` as FormPathLeaves<T>;
    }
  }

  const { schema, uiSchema, theme, label, path, superform, extraProps, order }: Props = $props();

  let fieldList =
    order == null || order.length == 0
      ? Object.keys(schema.shape)
      : order.concat(Object.keys(schema.shape).filter((f) => !order.includes(f)));
</script>

<div class="mb-4 p-2">
  <h3>{label}</h3>
  <div>
    {#each fieldList as field}
      <AutoInput
        label={field}
        schema={schema.shape[field] as any}
        {uiSchema}
        {theme}
        path={appendPath(field)}
        {extraProps}
        {superform}
      />
    {/each}
  </div>
</div>
