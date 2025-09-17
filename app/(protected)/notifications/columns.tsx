import { Notification } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

function timeSince(date: Date) {
  var seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

export const columns: ColumnDef<Notification>[] = [
  {
		accessorKey: "dealTitle",
    header: "Deal Title",
    cell: ({ row }) => (
      <a className="underline" href={"/raw-deals/" + row.original.dealId}>{row.original.dealTitle}</a>
    ),
    // enableSorting: true,
		enableColumnFilter: true,
		filterFn: 'includesString',
    enableHiding: false,
  },
  {
		accessorKey: "createdAt",
    header: "Queued",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {timeSince(row.original.createdAt)} ago
      </span>
    ),
  },
];
