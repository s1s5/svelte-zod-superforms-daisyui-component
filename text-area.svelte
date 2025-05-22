<script lang="ts" generics="T extends Record<string, unknown>">
  import type { HTMLTextareaAttributes } from "svelte/elements";
  import { formFieldProxy } from "sveltekit-superforms";
  import type { SuperForm, FormPathLeaves } from "sveltekit-superforms";
  import { z } from "zod";

  interface Props {
    schema?: z.ZodString | z.ZodNumber | z.ZodDate;
    label?: string;
    path: FormPathLeaves<T>;
    superform: SuperForm<T>;
    textAreaProps?: HTMLTextareaAttributes;
  }

  let { label, path, superform, textAreaProps }: Props = $props();

  const { value, errors, constraints } = formFieldProxy<T, FormPathLeaves<T>, any>(superform, path);
  const { class: textAreaClass, ...textAreaOtherProps } = textAreaProps ?? {};
</script>

<div class="mb-4">
  <label class="input-label" for={path}> {label} </label>
  <textarea
    class={`textarea input-bordered w-full ${$errors ? "input-error" : ""} ${textAreaClass ? textAreaClass : ""}`}
    aria-invalid={$errors ? "true" : undefined}
    id={path}
    bind:value={$value}
    {...$constraints}
    {...textAreaOtherProps}
  ></textarea>
  {#each $errors || [] as error}
    <p class="label text-error">{error}</p>
  {/each}
</div>
