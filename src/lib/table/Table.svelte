<script lang="ts">
  import { createEventDispatcher, setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import { createVirtualizer } from '@tanstack/svelte-virtual'
  import type { Head as IHead, Cell as ICell, InputData, TableConfig, InputColumns } from './types'
  import HeadCell from './ui/Head.svelte'

  import {Row, Cell, Head} from './ui'

  export let columns: InputColumns
  export let data: InputData

  export let config: TableConfig | undefined


  setContext('config', config)

  const indexes = writable(Array.from(Array(data.length).keys()))
  const dispatch = createEventDispatcher()

  const sort = writable({
    by: null,
    asc: true,
  })

  let virtualList
  const dataStore = writable(data)
  $: $dataStore = data
  $: virtualizer = createVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: $dataStore.length,
    getScrollElement: () => virtualList,
    estimateSize: () => config.rowHeight,
    overscan: 20,
  })

  type PackedCell = { head: Head; value: ICell }

  function extractRow(r): {
    keyed: Record<string, PackedCell>
    indexed: PackedCell[]
  } {
    const indexed: PackedCell[] = []
    const keyed: Record<string, PackedCell> = {}
    columns.forEach((c, i) => {
      const cell = { head: c, value: r[c.name]! as ICell }
      indexed.push(cell)
      keyed[c.name] = cell
    })
    return { indexed, keyed }
  }

  setContext('data', dataStore)
  setContext('indexes', indexes)
  setContext('sort', sort)
</script>

<div
  bind:this={virtualList}
  class="
    flex h-full w-full overflow-auto rounded-xl border-r border-base-200 bg-base-300 text-xs
    {$$restProps.class}
  ">
  <div class="relative w-full" style="height: {$virtualizer.getTotalSize()}px;">
    <table class="w-full table-fixed {tableClass}">
      <thead
        class="sticky top-0 z-[1] rounded-md text-center text-base-content/70">
        <slot name="head" {columns}>
          <tr>
            {#each columns as head}
              <HeadCell {head} />
            {/each}
          </tr>
        </slot>
      </thead>
      <slot name="colgroup" {columns}>
        <colgroup>
          {#each columns as head}
            <col style="width: {head.width ?? 'auto'}" />
          {/each}
        </colgroup>
      </slot>
      <tbody>
        {#each $virtualizer.getVirtualItems() as row, idx (row.index)}
          {@const r = $dataStore[row.index]}
          {@const packed = extractRow(r)}
          {@const style = `
          background: ${row.index % 2 === 0 ? '#ffffff' : '#fafafa'};
          height: ${row.size}px; transform: translateY(${
            row.start - idx * row.size
          }px);`}

          <slot
            row={r}
            {style}
            indexed={packed.indexed}
            keyed={packed.keyed}
            index={row.index}
            name="row">
            <Row
              {style}
              on:click={() =>
                dispatch('click', { packed, row: r, index: row.index })}>
              {#each packed.indexed as { head, value }}
                <Cell {head} {value} class="truncate px-1" />
              {/each}
            </Row>
          </slot>
        {/each}
      </tbody>
    </table>
  </div>
</div>
