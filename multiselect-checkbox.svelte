<script lang="ts" generics="T extends Record<string, unknown>">
  import { formFieldProxy } from "sveltekit-superforms";
  import type { SuperForm, FormPathLeaves } from "sveltekit-superforms";
  import { z } from "zod";

  interface Props {
    schema?: z.ZodArray<z.ZodEnum<any>>;
    label?: string;
    path: FormPathLeaves<T>;
    superform: SuperForm<T>;
    labelMap?: Record<string, string>;
    options?: Array<string | { label: string; value: string }>;
  }

  let { schema, label, path, superform, labelMap, options }: Props = $props();

  const { value, errors, constraints } = formFieldProxy<T, FormPathLeaves<T>, any>(
    superform,
    path,
  );
</script>

<div class="mb-4">
  <label class="mb-2 block text-sm font-bold" for={path}>{label}</label>
  <div class=" grid grid-cols-4 gap-2">
    {#each options ?? schema?.element.options as candidate}
      <div class="flex">
        <label class="label cursor-pointer">
          <input
            id="{path}-{candidate}"
            type="checkbox"
            class="checkbox me-3"
            bind:group={$value}
            value={candidate}
            {...constraints}
          />
          <span class="label-text">{(labelMap ?? {})[candidate] ?? candidate}</span>
        </label>
      </div>
    {/each}
  </div>
  {#each $errors || [] as error}
    <p class="label text-error">{error}</p>
  {/each}
</div>
