<script lang="ts" generics="T extends Record<string, unknown>">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { formFieldProxy } from "sveltekit-superforms";
  import type { SuperForm, FormPathLeaves } from "sveltekit-superforms";
  import { z } from "zod";

  interface Props {
    schema?: z.ZodString | z.ZodNumber | z.ZodDate;
    label?: string;
    path: FormPathLeaves<T>;
    superform: SuperForm<T>;
    inputProps?: HTMLInputAttributes;
    blank?: boolean;
    setNullWhenEmpty?: boolean;
  }

  let { schema, label, path, superform, inputProps, setNullWhenEmpty, blank }: Props = $props();

  const { value, errors, constraints } = formFieldProxy<T, FormPathLeaves<T>, any>(superform, path);
  const { class: inputClass, required, ...inputOtherProps } = inputProps ?? {};

  if (setNullWhenEmpty) {
    $effect(() => {
      if ($value == "") {
        value.set(null as any);
      }
    });
  }

  let type = $derived.by(() => {
    if (schema instanceof z.ZodNumber) {
      return "number";
    } else if (schema instanceof z.ZodDate) {
      return "date";
    }
    return "text";
  });
</script>

<div class="mb-4">
  <fieldset class="fieldset">
    <legend class="fieldset-legend">{label}</legend>
    <input
      {type}
      class={`input w-full ${$errors ? "input-error" : ""} ${inputClass ? inputClass : ""}`}
      aria-invalid={$errors ? "true" : undefined}
      placeholder=""
      bind:value={$value}
      {...$constraints}
      {...inputOtherProps}
      required={blank == true ? false : blank == false ? true : required}
    />
    {#each $errors || [] as error}
      <p class="label text-error">{error}</p>
    {/each}
  </fieldset>
</div>
