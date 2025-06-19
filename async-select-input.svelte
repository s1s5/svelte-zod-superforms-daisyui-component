<script lang="ts" generics="T extends Record<string, unknown>">
  // TODO: raw-async-select-input使う
  import { XCircle } from "svelte-heros-v2";
  import { formFieldProxy } from "sveltekit-superforms";
  import type { SuperForm, FormPathLeaves } from "sveltekit-superforms";
  import { z } from "zod";

  interface Props {
    schema?: z.ZodString | z.ZodArray<z.ZodString>;
    label?: string;
    labelMap?: Record<string, string>;
    path: FormPathLeaves<T>;
    superform: SuperForm<T>;
    load: (query: string, value: Array<string>) => Promise<Array<string>>;
    placeholder?: string;
    debounceDelay?: number;
    disabled?: boolean;
  }

  let {
    schema,
    label,
    labelMap,
    path,
    superform,
    load,
    placeholder,
    debounceDelay = 500,
    disabled
  }: Props = $props();

  const { value, errors } = formFieldProxy<T, FormPathLeaves<T>, any>(superform, path);

  let isArray = $derived(schema instanceof z.ZodArray);
  let items: Array<string> = $state([]);

  let hidden = $state(true);
  let loading = $state(false);
  let inputValue = $state("");
  let timer: any | undefined = undefined;
  let focusoutTimer: any | undefined = $state(undefined);
  let errorMessage: string | undefined = $state(undefined);

  function clearFocusoutTimer() {
    if (focusoutTimer != null) {
      clearTimeout(focusoutTimer);
    }
    focusoutTimer = undefined;
  }

  async function loadWhenFirst() {
    if (items.length == 0) {
      loading = true;
      errorMessage = undefined;
      try {
        items = await load(inputValue, (isArray ? $value : [$value]) as Array<string>);
      } catch (error) {
        console.warn(error);
        errorMessage = `${error}`;
      }
      loading = false;
    }
  }

  function onInput(event: any) {
    inputValue = event.target.value;
    if (timer != null) {
      clearTimeout(timer);
    }
    timer = setTimeout(async () => {
      hidden = false;
      loading = true;
      errorMessage = undefined;
      try {
        items = await load(inputValue, (isArray ? $value : [$value]) as Array<string>);
      } catch (error) {
        items = [];
        errorMessage = `${error}`;
      }
      loading = false;
    }, debounceDelay);
  }
</script>

<div class="mb-4">
  <label class="mb-2 block text-sm font-bold" for={path}>{label}</label>
  {#if isArray}
    <div class="input w-full">
      {#each $value as Array<any> as _, idx}
        <div class="custom-badge">
          <button
            type="button"
            class="cursor-pointer"
            onclick={() => {
              value.update((v) => {
                return v.filter((_: any, i: number) => i !== idx);
              });
            }}><XCircle class="inline size-[1.5em]" /></button
          >
          {labelMap?.[$value[idx]] ?? $value[idx]}
        </div>
      {/each}

      {@render renderInput()}
    </div>
  {:else}
    <div class="input w-full">
      {#if $value != null && $value != ""}
        <div class="custom-badge">
          <button
            type="button"
            class="cursor-pointer"
            onclick={() => {
              value.set("" as any);
            }}><XCircle class="inline size-[1.5em]" /></button
          >
          {labelMap?.[$value as string] ?? $value}
        </div>
      {/if}
      {@render renderInput()}
    </div>
  {/if}
  {#each $errors || [] as error}
    <p class="label text-error p-1">{error}</p>
  {/each}
</div>
<div class="relative z-50">
  <div class={`${hidden ? "hidden" : ""}`}>
    <div
      class="bg-base-100 absolute right-0 left-0 m-2 mt-[-1em] max-h-[300px] overflow-auto p-4 pt-1 shadow-lg"
    >
      {#if loading}
        <div>loading...</div>
      {:else if items.length == 0}
        {#if errorMessage == null}
          <div>
            {#if inputValue == ""}
              input search text
            {:else}
              no item found
            {/if}
          </div>
        {:else}
          <div class="text-error">
            データ取得時にエラーが発生しました<br />
            {errorMessage}
          </div>
        {/if}
      {:else}
        <div>
          {#each items as item}
            <button
              class="hover:bg-base-200 hover w-full cursor-pointer px-2 py-1 text-left"
              onclick={() => {
                if (isArray) {
                  value.update((v) => {
                    return v.concat([item]);
                  });
                } else {
                  value.set(item as any);
                }
                inputValue = "";

                items = [];
                hidden = true;
              }}
            >
              {labelMap?.[item] || item}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

{#snippet renderInput()}
  <input
    class="input w-full outline-none focus:outline-none"
    type="text"
    id={path}
    {placeholder}
    autocomplete="off"
    onfocus={() => {
      hidden = false;
      clearFocusoutTimer();
      loadWhenFirst();
    }}
    onfocusout={() => {
      clearFocusoutTimer();
      focusoutTimer = setTimeout(() => {
        hidden = true;
      }, 200);
    }}
    oninput={onInput}
    value={inputValue}
    {disabled}
  />
{/snippet}

<style lang="postcss">
  :global {
    @import "tailwindcss";
    @plugin "daisyui";
  }

  .custom-badge {
    @apply badge border-[1px] border-gray-300 text-gray-500 dark:bg-base-100 ps-1 dark:border-gray-400 dark:text-gray-400;
  }
</style>
