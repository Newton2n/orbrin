export interface DashboardActivity {
  name: string;
  action: string;
  time: string;
  initials: string;
}

export function ActivityFeed({
  activities,
}: {
  activities: DashboardActivity[];
}) {
  return (
    <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
      {activities.map((activity) => (
        <div
          key={`${activity.name}-${activity.time}`}
          className="flex gap-3 py-4 first:pt-0 last:pb-0"
        >
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-zinc-100 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {activity.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm leading-5 text-zinc-900 dark:text-zinc-50">
              <span className="font-medium">{activity.name}</span>{" "}
              {activity.action}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
