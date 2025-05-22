<script lang="ts" generics="T extends Record<string, unknown>">
  import { z } from "zod";
  import type { Theme } from "./types";

  import {
    defaults,
    formFieldProxy,
    type FormPathLeaves,
    type SuperForm,
  } from "sveltekit-superforms";
  import AutoInput from "./auto-input.svelte";
  import type { SvelteComponent } from "svelte";
  import { zod } from "sveltekit-superforms/adapters";

  interface Props {
    schema: z.ZodOptional<any> | z.ZodNullable<any>;
    theme?: Theme;
    label?: string;
    path?: string;
    uiSchema?: Record<string, typeof SvelteComponent<any>>;
    extraProps?: Record<string, any>;
    superform: SuperForm<T>;
  }

  const { schema, uiSchema, theme, label, path, superform, extraProps }: Props = $props();

  const { nullable, optional, childSchema, name } = $derived.by(() => {
    let nullable = false,
      optional = false,
      childSchema = undefined;
    if (schema instanceof z.ZodNullable) {
      nullable = true;
      childSchema = schema.unwrap();
      if (childSchema instanceof z.ZodOptional) {
        optional = true;
        childSchema = childSchema.unwrap();
      }
    } else if (schema instanceof z.ZodOptional) {
      optional = true;
      childSchema = schema.unwrap();
      if (childSchema instanceof z.ZodNullable) {
        nullable = true;
        childSchema = childSchema.unwrap();
      }
    } else {
      childSchema = schema; // never
    }
    return { nullable, optional, childSchema, name: `${path}__optional` };
  });

  const { value, errors } = formFieldProxy(superform, path as FormPathLeaves<T>);
  let initial = $state($value);
  console.log(path, $value);
</script>

<div class="mb-4">
  {#if $errors}
    <div class="text-error">{$errors}</div>
  {/if}
  <h3>{label}</h3>
  <div class="ps-4 border-s-2 border-s-primary">
    {#if optional}
      <label class="label me-3 cursor-pointer">
        <input
          type="radio"
          {name}
          class="radio"
          checked={$value === undefined}
          onchange={() => {
            if ($value != null) {
              initial = $value as any;
            }
            $value = undefined as any;
          }}
        />
        <span class="label-text">設定しない(undefiend)</span>
      </label>
    {/if}
    {#if nullable}
      <label class="label me-3 cursor-pointer">
        <input
          type="radio"
          {name}
          class="radio"
          checked={$value === null}
          onchange={() => {
            if ($value != null) {
              initial = $value as any;
            }
            $value = null as any;
          }}
        />
        <span class="label-text">空にする(null)</span>
      </label>
    {/if}
    <label class="label me-3 cursor-pointer">
      <input
        type="radio"
        {name}
        class="radio"
        checked={$value != null}
        onchange={() => {
          $value = defaults(initial as unknown as any, zod(childSchema)) as any;
        }}
      />
      <span class="label-text">設定する</span>
    </label>
  </div>
  {#if $value != null}
    <div>
      <AutoInput schema={childSchema} {uiSchema} {theme} {path} {superform} {extraProps} />
    </div>
  {/if}
</div>
