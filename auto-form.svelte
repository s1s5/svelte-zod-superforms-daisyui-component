<script lang="ts" generics="T extends Record<string, unknown>">
  import XCircle from "svelte-heros-v2/XCircle.svelte";
  import ArrowPath from "svelte-heros-v2/ArrowPath.svelte";

  import { z } from "zod";
  import { superForm, defaults, setError, type FormOptions } from "sveltekit-superforms";
  import { zod } from "sveltekit-superforms/adapters";
  import type { Theme, ZodProperties } from "./types";
  import ObjectInput from "./object-input.svelte";
  import type { SvelteComponent } from "svelte";

  interface Props {
    initial?: T;
    schema: z.ZodObject<ZodProperties<T>>;
    // FormPathもFormPathLeavesもうまく行かない
    uiSchema?: Record<string, typeof SvelteComponent<any>>;
    extraProps?: Record<string, any>;
    theme?: Theme;
    superFormProps?: Partial<FormOptions<T>>;
  }

  const { initial, schema, uiSchema, theme, extraProps, superFormProps }: Props = $props();

  const superform = superForm(defaults(initial as any, zod(schema)), {
    dataType: "json",
    SPA: true,
    resetForm: false,
    clearOnSubmit: "errors-and-message",
    validators: zod(schema),
    validationMethod: "onsubmit",
    ...(superFormProps ?? {}),
  });

  const { enhance, allErrors, message, submitting } = superform;
</script>

<form use:enhance>
  {#if $message}
    <div role="alert" class="alert alert-error mb-4">
      <XCircle />
      <span>{$message.text}</span>
    </div>
  {/if}
  {#if $allErrors.length}
    <div class="bg-base-100 border-base-300 collapse border">
      <input type="checkbox" />
      <div class="collapse-title text-error font-semibold">
        <XCircle class="inline" /> すべてのエラーを表示
      </div>
      <div class="collapse-content text-sm">
        {#each $allErrors as error}
          <span class="text-error">
            <b>{error.path}:</b>
            {error.messages.join(". ")}
          </span>
        {/each}
      </div>
    </div>
  {/if}

  <ObjectInput {schema} {uiSchema} {theme} {superform} {extraProps} />

  <div class="border-base-200 mt-1 flex justify-end border-t pt-1 p-3">
    <button type="submit" class="btn btn-primary" disabled={$submitting}>
      {#if $submitting}<ArrowPath
          class="text-base-300 animate-spin dark:text-gray-300"
          size="24"
        />{:else}
        送信
      {/if}
    </button>
  </div>
</form>
