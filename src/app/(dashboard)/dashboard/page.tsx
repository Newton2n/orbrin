import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Workspace overview</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          Good morning
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Here is what is moving across your organization.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Active projects", "12"],
          ["Open tasks", "48"],
          ["Team members", "24"],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your workspace activity will appear here.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
