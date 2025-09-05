
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Song } from "@/lib/types"

export const columns: ColumnDef<Song>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "composer",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Composer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("composer")}</div>,
  },
  {
    accessorKey: "copyright",
    header: "Copyright",
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("copyright")}</div>,
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return <Badge variant="secondary">{type}</Badge>
    },
  },
  {
    accessorKey: "subtypes",
    header: "Subtypes",
    cell: ({ row }) => {
      const subtypes = row.getValue("subtypes") as string[];
      if (!subtypes || subtypes.length === 0) return null;
      return (
        <div className="flex flex-wrap gap-1">
            {subtypes.map(subtype => <Badge key={subtype} variant="outline">{subtype}</Badge>)}
        </div>
      )
    },
    filterFn: (row, id, value) => {
        const subtypes = row.getValue(id) as string[] || [];
        return subtypes.includes(value);
    }
  },
  {
    accessorKey: "lastPerformed",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Last Performed
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => {
      const date = row.getValue("lastPerformed")
      return date ? new Date(date as string).toLocaleDateString() : "N/A"
    },
    sortingFn: 'datetime',
  },
]
