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
  import { ChevronUp, PlusCircle, XCircle } from "svelte-heros-v2";
  import { zod } from "sveltekit-superforms/adapters";

  interface Props {
    schema: z.ZodArray<any>;
    theme?: Theme;
    label?: string;
    path?: string;
    uiSchema?: Record<string, typeof SvelteComponent<any>>;
    extraProps?: Record<string, any>;
    superform: SuperForm<T>;
  }

  function appendPath(index: number): FormPathLeaves<T> {
    if (path == null || path == "") {
      return index.toString() as FormPathLeaves<T>;
    } else {
      return `${path}.${index}` as FormPathLeaves<T>;
    }
  }

  const { schema, uiSchema, theme, label, path, extraProps, superform }: Props = $props();
  const elementSchema = schema.element;

  const { value, errors } = formFieldProxy(superform, path as FormPathLeaves<T>);

  function onMoveUp(index: number) {
    value.update((v) => {
      const nv = [...(v as any)];
      [nv[index - 1], nv[index]] = [nv[index], nv[index - 1]];
      return nv as any;
    });
  }
  function onDelete(index: number) {
    value.update((v) => {
      return v.filter((_: any, i: number) => i !== index);
    });
  }
  function onAdd() {
    value.update((v) => {
      return v.concat([defaults(zod(elementSchema))]);
    });
  }
</script>

<div class="mb-4">
  <h3>{label}</h3>
  <div class="border-s-primary border-s-2 ps-4">
    {#each $value as Array<any> as _, i}
      {@const error = $errors?.[i]}
      <div class="mb-2 flex flex-wrap">
        <div class="flex flex-wrap content-center p-2">
          <div>
            {i + 1}
          </div>
        </div>
        <div class="grow p-1">
          <AutoInput
            schema={elementSchema}
            uiSchema={{
              ...uiSchema,
              [appendPath(i)]: uiSchema?.[appendPath(0)] as any,
            }}
            {theme}
            path={appendPath(i)}
            extraProps={{
              ...extraProps,
              [appendPath(i)]: extraProps?.[appendPath(0)] as any,
            }}
            {superform}
          />
          {#if error != null}
            <div class="text-error">{error}</div>
          {/if}
        </div>
        <div class="flex flex-wrap content-center p-2">
          <div>
            <button
              type="button"
              class="btn btn-primary inline"
              onclick={() => onMoveUp(i)}
              disabled={i === 0}><ChevronUp /></button
            >
            <button type="button" class="btn btn-error inline" onclick={() => onDelete(i)}
              ><XCircle /></button
            >
          </div>
        </div>
      </div>
    {/each}
    <div class="p-4">
      <button type="button" class="btn btn-success w-full" onclick={onAdd}
        ><PlusCircle class="inline" /> &nbsp; 追加</button
      >
    </div>
  </div>
</div>
