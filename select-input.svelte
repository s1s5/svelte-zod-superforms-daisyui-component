<script lang="ts" generics="T extends Record<string, unknown>">
  import type { HTMLSelectAttributes } from "svelte/elements";
  import { formFieldProxy } from "sveltekit-superforms";
  import type { SuperForm, FormPathLeaves } from "sveltekit-superforms";
  import { z } from "zod";
  interface Props {
    schema: z.ZodEnum<any>;
    label?: string;
    path: FormPathLeaves<T>;
    superform: SuperForm<T>;
    placeholder?: string;
    labelMap?: Record<string, string>;
    selectProps?: HTMLSelectAttributes;
    options?: Array<string>;
  }

  let { schema, label, path, superform, placeholder, labelMap, options, selectProps }: Props =
    $props();

  const { value, errors, constraints } = formFieldProxy<T, FormPathLeaves<T>, any>(superform, path);
  const { class: selectClass, ...selectOtherProps } = selectProps ?? {};
</script>

<div class="mb-4">
  <label class="mb-2 block text-sm font-bold" for={path}>{label}</label>
  <select
    id={path}
    class={`select input-bordered w-full  ${$errors ? "input-error" : ""} ${
      selectClass ? selectClass : ""
    }`}
    bind:value={$value}
    aria-invalid={$errors ? "true" : undefined}
    {...$constraints}
    {...selectOtherProps}
  >
    {#if placeholder != null}
      <option value="" disabled>{placeholder}</option>
    {/if}
    {#each options ?? schema.options as col}
      <option value={col}>{(labelMap ?? {})[col] ?? col}</option>
    {/each}
  </select>
  {#each $errors || [] as error}
    <p class="label text-error">{error}</p>
  {/each}
</div>
