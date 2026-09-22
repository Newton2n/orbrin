import { Bell, Lock, Palette, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const modules = [
  {
    title: "Profile",
    description: "Update personal details and avatar",
    icon: UserRound,
  },
  {
    title: "Security",
    description: "Password, recovery, and recent sessions",
    icon: Lock,
  },
  {
    title: "Notifications",
    description: "Fine-tune the signals you want to receive",
    icon: Bell,
  },
  {
    title: "Appearance",
    description: "Theme and visual preferences",
    icon: Palette,
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Account
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Control how your workspace feels, behaves, and stays secure.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {modules.map(({ title, description, icon: Icon }) => (
          <Card key={title} className="border-border/70 shadow-none">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-md bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <CardTitle>{title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle>Security summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>Account protection</span>
              <span>86%</span>
            </div>
            <Progress value={86} className="h-1.5" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input defaultValue="********" type="password" />
            <Button variant="outline">Change password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
