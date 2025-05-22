<script lang="ts" generics="T extends Record<string, unknown>">
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { Writable } from "svelte/store";
  import { formFieldProxy } from "sveltekit-superforms";
  import type { SuperForm, FormPathLeaves } from "sveltekit-superforms";
  import { z } from "zod";

  interface Props {
    schema?: z.ZodString;
    label?: string;
    path: FormPathLeaves<T>;
    superform: SuperForm<T>;
    inputProps?: HTMLInputAttributes;
    onChange: (data: {
      value: string;
      files: FileList;
      errors: Writable<string[] | undefined>;
    }) => Promise<string>;
  }

  let { label, path, superform, inputProps, onChange }: Props = $props();

  const { value, errors, constraints } = formFieldProxy<T, FormPathLeaves<T>, any>(superform, path);
  const { class: inputClass, ...inputOtherProps } = inputProps ?? {};

  let loading = $state(false);
</script>

<div class="mb-4">
  <fieldset class="fieldset">
    <legend class="fieldset-legend">{label}</legend>
    <input
      type="file"
      class={`input file-input w-full ${$errors ? "input-error" : ""} ${inputClass ? inputClass : ""}`}
      aria-invalid={$errors ? "true" : undefined}
      placeholder=""
      onchange={async (e) => {
        loading = true;
        try {
          value.set(
            (await onChange({
              value: $value as string,
              files: (e.target as any).files,
              errors,
            })) as any,
          );
        } catch (e) {
          errors.update((l) => (l ?? []).concat([(e as Error).message]));
        } finally {
          loading = false;
        }
      }}
      disabled={loading}
      {...$constraints}
      {...inputOtherProps}
    />
    {#if loading}
      <progress class="progress mt-[-1em] w-full"></progress>
    {/if}
    {#each $errors || [] as error}
      <p class="label text-error">{error}</p>
    {/each}
  </fieldset>
</div>
