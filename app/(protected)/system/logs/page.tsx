import { getAllSystemLogs } from "@/prisma/queries";
import { UserActionLog } from "@prisma/client";
import React from "react";

// Reusable slim log card component
const LogCard = ({ log }: { log: UserActionLog }) => {
  return (
    <div
      key={log.id}
      className="mb-2 rounded-lg border p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-primary">{log.action}</h4>
        <span className="text-xs text-muted-foreground">
          {log.createdAt.toLocaleString()}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{log.description}</p>
    </div>
  );
};

const SystemLogs = async () => {
  const systemLogs = await getAllSystemLogs();
  return (
    <div className="big-container block-space">
      <h1>View System Logs</h1>
      <div className="mt-4 w-full space-y-4 md:mt-6 lg:mt-12">
        {systemLogs.map((log) => (
          <LogCard key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
};

export default SystemLogs;
