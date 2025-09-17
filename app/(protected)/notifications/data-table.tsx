"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
// Intersection Observer hook
function useVisibleRows(rowCount: number, onVisible: (maxIndex: number) => void) {
  const rowRefs = React.useRef<(HTMLTableRowElement | null)[]>([]);
  React.useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        const visible: number[] = [];
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.rowindex);
            if (!isNaN(idx)) visible.push(idx);
          }
        });
        if (visible.length > 0) {
          onVisible(Math.max(...visible) + 1);
        }
      },
      { threshold: 0.1 }
    );
    rowRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => {
      observer.disconnect();
    };
  }, [rowCount, onVisible]);
  return rowRefs;
}
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
	const [maxPageSize, setMaxPageSize] = React.useState(25);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
				pageIndex: 0,
        pageSize: maxPageSize, //custom default page size
      },
    },
  });

  // Intersection Observer logic
  const rows = table.getRowModel().rows;
  const rowRefs = useVisibleRows(rows.length, (maxIdx) => {
    setMaxPageSize((prev) => {
      return Math.max(maxIdx + 25, prev);
    });
  });

  return (
    <div className="text-right">
      <div className="flex py-4">
        <Input
          placeholder="Filter Deal Titles..."
          value={
            (table.getColumn("dealTitle")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("dealTitle")?.setFilterValue(event.target.value)
          }
          className="w-full"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="text-right" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: any, idx: number) => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    data-rowindex={idx}
                    ref={(el: HTMLTableRowElement | null) => {
                      rowRefs.current[idx] = el;
                    }}
                  >
                    {row.getVisibleCells().map((cell: any) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
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
  );
}
