<script lang="ts" generics="T extends Record<string, unknown>">
  import { XCircle } from "svelte-heros-v2";

  interface Props {
    id: string;
    label?: string;
    labelMap?: Record<string, string>;
    load: (query: string, value: Array<string>) => Promise<Array<string>>;
    placeholder?: string;
    debounceDelay?: number;
    value: string | Array<string>;
    errors?: Array<string> | null | undefined;
    multiple?: boolean;
    onselect?: (value: string) => unknown;
    onremove?: (index: number) => unknown;
  }

  let {
    id,
    label,
    labelMap,
    load,
    placeholder = "Serch items",
    debounceDelay = 500,
    value = $bindable(),
    errors,
    multiple: isArray,
    onselect,
    onremove,
  }: Props = $props();

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
        items = await load(inputValue, (isArray ? value : [value]) as Array<string>);
      } catch (error) {
        //   if (e instanceof ApolloError) {
        //   e.graphQLErrors // ReadonlyArray<GraphQLError>
        // }
        // console.error(error.graphQLErrors);
        console.error(error);
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
        items = await load(inputValue, (isArray ? value : [value]) as Array<string>);
      } catch (error) {
        items = [];
        errorMessage = `${error}`;
      }
      loading = false;
    }, debounceDelay);
  }
</script>

<div class="mb-4">
  {#if label != null && label != ""}<label class="mb-2 block text-sm font-bold" for={id}
      >{label}</label
    >{/if}
  <div class="input w-full">
    {#if isArray}
      {#each value as Array<any> as _, idx}
        <div class="badge badge-outline badge-info ps-1">
          <button
            type="button"
            class="cursor-pointer"
            onclick={() => {
              value = (value as Array<string>).filter((_: any, i: number) => i !== idx);

              onremove?.(idx);
            }}><XCircle class="inline size-[1.5em]" /></button
          >
          {labelMap?.[value[idx]] ?? value[idx]}
        </div>
      {/each}
      {@render renderInput()}
    {:else}
      {#if value != ""}
        <div class="badge badge-outline badge-info ps-1">
          <button
            type="button"
            class="cursor-pointer"
            onclick={() => {
              value = "";
              onremove?.(0);
            }}><XCircle class="inline size-[1.5em]" /></button
          >
          {labelMap?.[value as any] || value}
        </div>
      {/if}
      {@render renderInput()}
    {/if}
  </div>
  {#each errors || [] as error}
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
                  value = value.concat([item] as any);
                } else {
                  value = item;
                }

                onselect?.(item);

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
    {id}
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
  />
{/snippet}
