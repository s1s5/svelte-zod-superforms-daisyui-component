<script lang="ts" generics="T extends Record<string, unknown>">
  import type { HTMLInputAttributes } from "svelte/elements";
  import { formFieldProxy } from "sveltekit-superforms";
  import type { SuperForm, FormPathLeaves } from "sveltekit-superforms";
  import { z } from "zod";

  interface Props {
    schema?: z.ZodBoolean;
    label?: string;
    path: FormPathLeaves<T>;
    superform: SuperForm<T>;
    inputProps?: HTMLInputAttributes;
  }

  let {  label, path, superform, inputProps }: Props = $props();

  const { value, errors, constraints: orgConstraints } = formFieldProxy<T, FormPathLeaves<T>, any>(superform, path);
  const { class: inputClass, ...inputOtherProps } = inputProps ?? {};
  // デフォルトでrequiredは除外する
  const { required: _, ...constraints } = $orgConstraints ?? {};
</script>

<div class="form-control mb-4">
  <label class="label cursor-pointer justify-start" for={path}>
    <input
      type="checkbox"
      id={path}
      aria-invalid={$errors ? "true" : undefined}
      class={`toggle toggle-primary me-4 ${$errors ? "input-error" : ""} ${
        inputClass ? inputClass : ""
      }`}
      bind:checked={$value as any}
      {...constraints}
      {...inputOtherProps}
    />
    <span class="mb-2 block pt-2 text-sm font-bold">{label}</span>
  </label>
  {#each $errors || [] as error}
    <p class="label text-error">{error}</p>
  {/each}
</div>
