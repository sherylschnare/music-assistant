
'use client'

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUser } from "@/context/user-context"
import { PageHeader } from "@/components/page-header"
import { Printer } from "lucide-react"

import type { Song } from "@/lib/types"
import { columns } from "./columns"
import { useSearchParams } from "next/navigation"
import { ChevronDown } from "lucide-react"

function PrintButton() {
    const handlePrint = () => {
        window.print();
    }
    return (
        <Button onClick={handlePrint} className="print:hidden">
            <Printer className="mr-2 h-4 w-4" />
            Print Report
        </Button>
    )
}


export function ReportClient({ data }: { data: Song[] }) {
  const { musicTypes, musicSubtypes } = useUser();
  const searchParams = useSearchParams();
  const [sorting, setSorting] = React.useState<SortingState>([])
  
  const initialTitleFilter = searchParams.get('title') || '';
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    { id: 'title', value: initialTitleFilter }
  ])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    // Set page size to a large number to show all results for printing
    initialState: {
        pagination: {
            pageSize: 9999,
        }
    }
  })

  const selectedSubtypes = (table.getColumn("subtypes")?.getFilterValue() as string[]) || [];

  const handleSubtypeFilterChange = (subtype: string) => {
    const currentSubtypes = [...selectedSubtypes];
    const index = currentSubtypes.indexOf(subtype);
    if (index > -1) {
      currentSubtypes.splice(index, 1);
    } else {
      currentSubtypes.push(subtype);
    }
    table.getColumn("subtypes")?.setFilterValue(currentSubtypes.length > 0 ? currentSubtypes : undefined);
  };

  return (
    <div className="w-full">
       <PageHeader title="Reports" description="Generate and print reports for your music library." className="print:hidden">
        <PrintButton />
      </PageHeader>
      <div id="printable-area">
        <div className="flex items-center py-4 gap-2 print:hidden">
            <Input
            placeholder="Filter by title..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            />
            <Select
            value={(table.getColumn("type")?.getFilterValue() as string) ?? "All"}
            onValueChange={(value) =>
                table.getColumn("type")?.setFilterValue(value === "All" ? "" : value)
            }
            >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                {musicTypes.map((type) => (
                <SelectItem key={type} value={type}>
                    {type}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-between">
                        <span>Subtypes {selectedSubtypes.length > 0 && `(${selectedSubtypes.length})`}</span>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[180px]">
                    {musicSubtypes.map((subtype) => (
                        <DropdownMenuCheckboxItem
                            key={subtype}
                            checked={selectedSubtypes.includes(subtype)}
                            onCheckedChange={() => handleSubtypeFilterChange(subtype)}
                        >
                            {subtype}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                    return (
                        <TableHead key={header.id}>
                        {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </TableHead>
                    )
                    })}
                </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    >
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                        </TableCell>
                    ))}
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                    >
                    No results.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </div>
       <div className="flex items-center justify-end space-x-2 py-4 print:hidden">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} row(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
