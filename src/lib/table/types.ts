import type { Worksheet } from 'exceljs'


export type Cell = number | string | null | Date | object

export interface Head {
  title?: string
  name: string
  width?: number
  type?: Types | string
  unit?: string
  skipRender?: boolean
  sortable?: boolean
}

export enum Types {
  Number = 'number',
  String = 'string',
  Date = 'date',
  Boolean = 'boolean',
  List = 'list'
}

export type Controls = {
  sort: {
    by?: Head['name'] | null
    asc: boolean
  }
}


export type totalValues =
  | Array<number | string>
  | Record<string, number | string>


export type RowData = Record<Head['name'], Cell>[]
export type ColData = Record<Head['name'], Cell[]>


export namespace Props {
  export type Data = RowData | ColData
  export type Columns =
  | Head[]
  | Record<Head['name'], Head>
  | Record<Head['name'], Head['title']>
  | Head['name'][]
  | undefined
  
  export type Config = {
    virtualizer: {
      overscan?: number,
      scrollElement: HTMLDivElement,
      rowHeight: number, // TODO calculate this automatically
    },
    
    precision?: Record<string, number>,
    rows?: RowsConfig | undefined,
    enumerate?: boolean,
  }
}

export namespace Processed {
  export type Data = RowData
  export type Columns = Head[]
  export type Config = Props.Config
}


export type RowProps = { class: string; [k: string]: unknown } | undefined
export type RowsConfig = Record<
  number | string, // Row index
  RowProps // Attrs
> | RowProps[]

export type SortIndexes = number[]

export type Rendered = {
  head: Head[]
  body: RowData
  sortIndex: number[]
  length: number
}

export enum CellTypes {
  Number = "number",
  String = "string",
  Date = "date",
  Null = "null",
}

export type StyleTableCallback = (worksheet: Worksheet) => void
