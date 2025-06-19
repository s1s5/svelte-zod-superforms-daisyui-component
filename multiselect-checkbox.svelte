<script lang="ts" generics="T extends Record<string, unknown>">
  import { formFieldProxy } from "sveltekit-superforms";
  import type { SuperForm, FormPathLeaves } from "sveltekit-superforms";
  import { z } from "zod";

  interface Props {
    schema?: z.ZodArray<z.ZodEnum<any>>;
    label?: string;
    path: FormPathLeaves<T>;
    superform: SuperForm<T>;
    options?: Array<string | { label: string; value: string }>;
  }

  let { schema, label, path, superform, options }: Props = $props();

  const { value, errors, constraints } = formFieldProxy<T, FormPathLeaves<T>, any>(
    superform,
    path,
  );

  function toValue(opt: string | {label: string, value: string}) {
    if (typeof opt === "string") {
      return opt;
    } else {
      return opt.value;
    }
  }
  function toLabel(opt: string | {label: string, value: string}) {
    if (typeof opt === "string") {
      return opt;
    } else {
      return opt.label;
    }
  }

</script>

<div class="mb-4">
  <label class="mb-2 block text-sm font-bold" for={path}>{label}</label>
  <div class=" grid grid-cols-4 gap-2">
    {#each options ?? schema?.element.options as candidate}
      <div class="flex">
        <label class="label cursor-pointer">
          <input
            id="{path}-{toValue(candidate)}"
            type="checkbox"
            class="checkbox me-3"
            bind:group={$value}
            value={toValue(candidate)}
            {...constraints}
          />
          <span class="label-text">{toLabel(candidate)}</span>
        </label>
      </div>
    {/each}
  </div>
  {#each $errors || [] as error}
    <p class="label text-error">{error}</p>
  {/each}
</div>
