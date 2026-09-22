"use client";

import { Activity, ArrowUpRight, CalendarDays, CheckCircle2, CircleDot, Clock3, FolderKanban, ListTodo, MoreHorizontal, Plus, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const projects = [
  { name: "Platform redesign", team: "Product", status: "In progress", progress: 72, tasks: 25, deadline: "Sep 30" },
  { name: "Mobile experience", team: "Growth", status: "At risk", progress: 45, tasks: 20, deadline: "Oct 08" },
  { name: "API modernization", team: "Engineering", status: "On track", progress: 88, tasks: 35, deadline: "Sep 26" },
  { name: "Customer onboarding", team: "Success", status: "Planning", progress: 18, tasks: 12, deadline: "Oct 21" },
];
const tasks = [
  { title: "Review onboarding flow", project: "Platform redesign", status: "In progress", priority: "High", due: "Today", assignee: "SC" },
  { title: "Write API documentation", project: "API modernization", status: "Todo", priority: "Medium", due: "Tomorrow", assignee: "AM" },
  { title: "QA mobile navigation", project: "Mobile experience", status: "Review", priority: "Low", due: "Sep 26", assignee: "PS" },
];
const columns = ["Todo", "In progress", "Review", "Done"];

function StatusBadge({ value }: { value: string }) {
  return <Badge variant={value === "At risk" || value === "High" ? "outline" : value === "Done" || value === "On track" ? "secondary" : "default"}>{value}</Badge>;
}

function PageHeader({ title, description, action }: { title: string; description: string; action: string }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Workspace</p><h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{description}</p></div><Dialog><DialogTrigger render={<Button><Plus data-icon="inline-start" />{action}</Button>} /><DialogContent><DialogHeader><DialogTitle>{action}</DialogTitle></DialogHeader><div className="flex flex-col gap-4 py-2"><label className="flex flex-col gap-2 text-sm font-medium">Name<Input placeholder="Give this item a name" /></label><label className="flex flex-col gap-2 text-sm font-medium">Description<textarea className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Add context for your team" /></label></div><DialogFooter><Button variant="outline">Cancel</Button><Button>Save draft</Button></DialogFooter></DialogContent></Dialog></div>;
}

function ProjectRows() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => projects.filter((project) => project.name.toLowerCase().includes(query.toLowerCase())), [query]);
  return <Card className="shadow-none"><CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between"><CardTitle>All projects</CardTitle><div className="relative w-full sm:w-64"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search projects" value={query} onChange={(event) => setQuery(event.target.value)} /></div></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead className="border-b text-left text-xs text-muted-foreground"><tr><th className="pb-3 font-medium">Project</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Progress</th><th className="pb-3 font-medium">Tasks</th><th className="pb-3 font-medium">Deadline</th><th /></tr></thead><tbody className="divide-y">{filtered.map((project) => <tr key={project.name}><td className="py-4"><p className="font-medium">{project.name}</p><p className="mt-1 text-xs text-muted-foreground">{project.team} team</p></td><td><StatusBadge value={project.status} /></td><td><div className="flex max-w-40 items-center gap-3"><Progress value={project.progress} className="h-1.5" /><span className="text-xs text-muted-foreground">{project.progress}%</span></div></td><td className="text-muted-foreground">{project.tasks}</td><td className="text-muted-foreground">{project.deadline}</td><td className="text-right"><Button size="icon" variant="ghost" aria-label={`More actions for ${project.name}`}><MoreHorizontal /></Button></td></tr>)}</tbody></table>{!filtered.length && <p className="py-12 text-center text-sm text-muted-foreground">No projects match your search.</p>}</div></CardContent></Card>;
}

function TaskBoard() {
  return <div className="flex gap-4 overflow-x-auto pb-2">{columns.map((column) => { const columnTasks = tasks.filter((task) => task.status === column); return <Card key={column} className="min-w-[270px] flex-1 bg-muted/25 shadow-none"><CardHeader className="flex-row items-center justify-between space-y-0 pb-3"><CardTitle className="text-sm">{column}</CardTitle><Badge variant="secondary">{columnTasks.length}</Badge></CardHeader><CardContent className="flex flex-col gap-3">{columnTasks.map((task) => <button key={task.title} type="button" className="rounded-lg border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"><div className="flex items-start justify-between gap-2"><p className="text-sm font-medium leading-5">{task.title}</p><CircleDot className="mt-0.5 size-3.5 text-muted-foreground" /></div><p className="mt-2 text-xs text-muted-foreground">{task.project}</p><div className="mt-4 flex items-center justify-between"><StatusBadge value={task.priority} /><span className="text-xs text-muted-foreground">{task.due}</span></div><div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground"><span className="grid size-5 place-items-center rounded-full bg-muted font-medium">{task.assignee}</span>Assigned to team member</div></button>)}<Button variant="ghost" className="justify-start text-muted-foreground"><Plus data-icon="inline-start" /> Add task</Button></CardContent></Card>; })}</div>;
}

function TeamsView() {
  const teams = [{ name: "Product", members: 8, projects: 3, load: 78 }, { name: "Engineering", members: 14, projects: 5, load: 64 }, { name: "Growth", members: 6, projects: 2, load: 52 }];
  return <div className="grid gap-4 md:grid-cols-3">{teams.map((team) => <Card key={team.name} className="shadow-none"><CardHeader><div className="flex items-center justify-between"><div className="grid size-10 place-items-center rounded-lg bg-muted"><Users /></div><Button size="icon" variant="ghost" aria-label={`More actions for ${team.name}`}><MoreHorizontal /></Button></div><CardTitle className="pt-2">{team.name}</CardTitle><p className="text-sm text-muted-foreground">{team.members} members · {team.projects} projects</p></CardHeader><CardContent><div className="flex justify-between text-xs"><span className="text-muted-foreground">Team workload</span><span>{team.load}%</span></div><Progress value={team.load} className="mt-2 h-1.5" /></CardContent></Card>)}</div>;
}

export function WorkspaceView({ section }: { section: string[] }) {
  const page = section[0] ?? "overview";
  if (page === "projects") return <div className="flex flex-col gap-7"><PageHeader title="Projects" description="Manage and track your organization's projects." action="Create project" /><ProjectRows /></div>;
  if (page === "tasks") return <div className="flex flex-col gap-7"><PageHeader title="Tasks" description="Turn plans into visible, accountable progress." action="Create task" /><div className="flex flex-col gap-4 sm:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search tasks" /></div><Select defaultValue="all"><SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{columns.map((column) => <SelectItem key={column} value={column}>{column}</SelectItem>)}</SelectContent></Select></div><TaskBoard /></div>;
  if (page === "teams" || page === "team") return <div className="flex flex-col gap-7"><PageHeader title="Teams" description="See how your teams are organized and where capacity is available." action="Create team" /><TeamsView /></div>;
  if (page === "activity") return <div className="flex flex-col gap-7"><PageHeader title="Activity" description="A clear timeline of changes across your workspace." action="Filter activity" /><Card className="shadow-none"><CardContent className="divide-y p-0">{["Newton created Platform redesign", "Sarah moved Authentication flow to Review", "Alex completed Dashboard UI", "Priya joined the Product team"].map((item, index) => <div key={item} className="flex items-center gap-4 px-6 py-5"><div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary"><Activity /></div><div className="flex-1"><p className="text-sm font-medium">{item}</p><p className="mt-1 text-xs text-muted-foreground">{index + 2} hours ago · Workspace activity</p></div><ArrowUpRight className="text-muted-foreground" /></div>)}</CardContent></Card></div>;
  return <div className="flex flex-col gap-7"><PageHeader title={page === "sprints" ? "Sprints" : page === "notifications" ? "Notifications" : "Workspace"} description="Keep your team aligned with a focused, practical view of the work." action={page === "sprints" ? "Create sprint" : "Create new"} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Open tasks", value: "47", icon: ListTodo }, { label: "Active projects", value: "8", icon: FolderKanban }, { label: "Due this week", value: "12", icon: CalendarDays }, { label: "Completed", value: "142", icon: CheckCircle2 }].map(({ label, value, icon: Icon }) => <Card key={label} className="shadow-none"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-heading text-3xl font-semibold">{value}</p></div><Icon className="text-muted-foreground" /></div></CardContent></Card>)}</div><div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]"><Card className="shadow-none"><CardHeader><CardTitle>Project progress</CardTitle></CardHeader><CardContent className="flex flex-col gap-5">{projects.slice(0, 3).map((project) => <div key={project.name}><div className="flex justify-between text-sm"><span className="font-medium">{project.name}</span><span className="text-muted-foreground">{project.progress}%</span></div><Progress value={project.progress} className="mt-2 h-1.5" /></div>)}</CardContent></Card><Card className="shadow-none"><CardHeader><CardTitle>Upcoming deadlines</CardTitle></CardHeader><CardContent className="flex flex-col gap-4">{tasks.map((task) => <div key={task.title} className="flex gap-3"><Clock3 className="mt-0.5 text-muted-foreground" /><div><p className="text-sm font-medium">{task.title}</p><p className="mt-1 text-xs text-muted-foreground">{task.due} · {task.project}</p></div></div>)}</CardContent></Card></div></div>;
}

export default WorkspaceView;
