import { getContext, setContext } from 'svelte'
import { createVirtualizer } from '@tanstack/svelte-virtual'

import type * as I from './types'
import { Types } from './types'


// WARNING: This is used also in ListTable!
export function getSortIndexes(
  column: {
    head: { type?: Types }
    data: I.Cell[]
  },
  params: { asc: boolean }
): number[] {
  const sortIndexes = Array.from(Array(column.data.length).keys())

  sortIndexes.sort((a, b) => {
    if (column.head.type === 'number' || column.head.type === 'boolean') {
      return (
        ((column.data[a] as number) - (column.data[b] as number)) *
        (params.asc ? 1 : -1)
      )
    } else if (column.head.type === 'string') {
      return (
        ((column.data[a] as string) ?? '').localeCompare(
          (column.data[b] as string) ?? ''
        ) * (params.asc ? 1 : -1)
      )
    } else if (column.head.type === 'list') {
      return (
        // @ts-expect-error fields are lists
        (column.data[a].length - column.data[b]?.length) * (params.asc ? 1 : -1)
      )
    } else if (column.head.type === 'date') {
      return (
        // @ts-expect-error fields are date
        (column.data[a] - column.data[b]) * (params.asc ? 1 : -1)
      )
    } else {
      return 0
    }
  })

  return sortIndexes
}

export function rows2cols(rows: I.RowData) {
  const cols = Object.keys(rows[0]!)
  const colBased = Object.fromEntries(cols.map((c) => [c, []]))

  for (const row of rows) {
    for (const [k, v] of Object.entries(row)) {
      colBased[k]!.push(v as never)
    }
  }

  return colBased
}

// TODO refactor to SpreadSheet based structure of DataTable
// export function cols2rows(cols: ColData) {
//   const cols = Object.keys(rows[0]!)
//   const colBased = Object.fromEntries(cols.map((c) => [c, []]))

//   for (const row of cols) {
//     for (const [k, v] of Object.entries(row)) {
//       colBased[k]!.push(v as never)
//     }
//   }

//   return colBased
// }

export class Table {
  public virtualizer = $state();
  public rendered = $state();
  public header = $state<Head[]>()
  public body = $state<I.RowData>()

  // public $data: Writable<I.Processed.Data>;
  // public $columns: Writable<I.Processed.Columns>;
  // public $config: Writable<I.Processed.Config>;

  constructor(data: I.Props.Data, columns: I.Props.Columns, config: I.Props.Config) { 
    const rows = Array.isArray(data) ? data : Table.cols2rows(data)


    this.virtualizer = createVirtualizer({
      count: rows.length,
      getScrollElement: () => config.virtualizer.scrollElement,
      estimateSize: () => config.virtualizer.rowHeight,
      overscan: config.virtualizer.overscan ?? 20,
    })
   }

  static cols2rows(cols: I.ColData) {
    const names = Object.keys(cols)
    const col = cols[names[0]!]!
    
    const rows: I.RowData = []
    for (const i of col.keys()) {
      const row = {}
      for (const name of names) {
        row[name] = cols[name]![i]
      }
      rows.push(row)
    }
    return rows
  }

  static render(data: I.Props.Data, columns: I.Props.Columns, config: I.Props.Config)  {
    const rows = Array.isArray(data) ? data : Table.cols2rows(data)

    header =(Head.fromColumns(columns, rows))
    const order = writable(Array.from(rows.keys()))
    const body = writable(rows)



    order.subscribe((o) => {
      body.update((rows) => {
        return o.map((i) => rows[i]!)
      })
    })


    return {
      header,
      body,
      order,
      config
    }
  }
}

class Head {
  static titled(head: I.Head) {
    if (!head.title) {
      head.title = head.name
    }
    return head
  }

  static sized(head: I.Head) {
    if (!head.width) {
      head.width = head.title?.length ?? head.name?.length
    }
    return head
  }

  static typed(head: I.Head, data: I.RowData) {
    if (!head.type) {
      let sample
      for (const row of data) {
        if (sample !== null) {
          sample = row[head.name]
          break
        }
      }

      if (Array.isArray(sample)) {
        head.type = Types.List
      } else if (typeof sample === 'boolean') {
        head.type = Types.Boolean
      } else if (typeof sample === 'number') {
        head.type = Types.Number
      } else if (!Number.isNaN(Number(sample))) {
        //TODO check this
        head.type = Types.Number
      } else if (
        new Date(sample) !== 'Invalid Date' &&
        !isNaN(new Date(sample))
      ) {
        head.type = Types.Date
      } else {
        head.type = Types.String
      }
    }
    return head
  }

  static prepared(head: I.Head, data: I.RowData) {
    return Head.typed(Head.sized(Head.titled(head)), data)
  }

  static fromColumns(
    columns: I.Props.Columns,
    data: I.RowData
  ): I.Head[] | never {
    if (!columns) {
      // handle undefined. Use first row of data as head
      const row = data[0]!
      return Object.keys(row).map((c) => {
        return { name: c }
      })
    }

    if (Array.isArray(columns) && columns.length) {
      // Handle string[] and Head[]
      const sample = columns[0]!
      if (typeof sample === 'string') {
        // Handle string[] type
        return columns.map((c) => {
          return { name: c }
        })
      } else {
        // We have Head[], just check if it's valid
        ;(columns as I.Head[]).map((h) => {
          if (!h.name) {
            throw TypeError('columns prop: name is required')
          }
        })
        return columns as I.Head[]
      }
    }

    if (typeof columns === 'object') {
      return Object.entries(columns).map(([k, v]) => {
        if (typeof v === 'string') {
          // Handle Record<string, string>. Expected that value is a title name:title
          return { name: k, title: v }
          // @ts-ignore
        } else if (v?.title) {
          // Handle Record<string, Head> where string is name:{other}
          return { name: k, ...v }
        } else {
          throw TypeError(
            "columns property: can't process variant with Record<string, Head> interface. Values must be { name: {title: string, width?: string | number} };"
          )
        }
      })
    }
    throw TypeError(
      "columns property: can't identify and process format. It must satisfy one of variants string[], Head[], {name: title} or {name: Head}};"
    )
  }
}

export function renderTable({
  data,
  columns,
  controls,
  config,
}: {
  data: I.Props.Data
  columns: I.Props.
  controls: Controls
  config: TableConfig
}): Rendered {
  // Expensive operation for huge data, check it
  let body = structuredClone(data)
  if (Array.isArray(data)) {
    body = rows2cols(data)
  }
  const head = prepareColumns(body as ColData, columns)
  const length = body[head[0]!.name].length as number
  let sortIndex = Array.from(Array(length).keys())

  // if (totalValues) renderedTotalValues = prepareTotalValues(totalValues)

  const sortBy = head.find((h) => h.name === controls.sort.by)
  if (sortBy) {
    sortIndex = getSortIndexes(
      { head: sortBy, data: body[sortBy.name] },
      { asc: controls.sort.asc }
    )
  }
  // update rows config indexes after sorting
  return {
    head,
    body,
    sortIndex,
    length,
    config,
  } as Rendered
}

export function createStores() {
  const rendered = writable<Rendered>()
  setContext('rendered', rendered)

  const controls = writable<Controls>({
    sort: {
      asc: false,
    },
  })
  setContext('controls', controls)
  return { rendered, controls }
}

export function getRenderStore(): Writable<Rendered> {
  return getContext('rendered')
}

export function getTypeFromString(string: string): CellTypes {
  if (!isNaN(parseFloat(string)) && isFinite(Number(string))) {
    return CellTypes.Number
  }

  if (string === null) {
    return CellTypes.Null
  }

  const date = new Date(string)
  if (!isNaN(date.getTime())) {
    console.log(string)
    return CellTypes.Date
  }

  return CellTypes.String
}
