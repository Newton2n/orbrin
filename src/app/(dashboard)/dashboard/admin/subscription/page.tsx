import { ArrowUpRight, Check, CreditCard } from "lucide-react";
import Link from "next/link";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";

const plans = [
  {
    name: "Growth",
    price: "$49",
    description: "For scaling teams",
    active: true,
  },
  {
    name: "Scale",
    price: "$99",
    description: "For larger organizations",
    active: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For complex governance",
    active: false,
  },
];

export default function AdminSubscriptionPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Billing
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          Subscription
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your plan, billing status, and payment history.
        </p>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle>Current plan</CardTitle>
          <Badge>Active</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-primary p-5 text-primary-foreground">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Growth plan</p>
                <p className="mt-3 text-3xl font-semibold">
                  $49<span className="text-sm opacity-80">/seat</span>
                </p>
              </div>
              <CreditCard className="size-8 opacity-80" />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Renewal</span>
            <span className="font-medium">October 12, 2026</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Seats used</span>
            <span className="font-medium">18 / 50</span>
          </div>
          <Button asChild>
            <Link href="#">Manage subscription</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle>Available plans</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={[
                "rounded-lg border p-4",
                plan.active
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{plan.name}</h3>
                {plan.active ? <Badge>Current</Badge> : null}
              </div>
              <p className="mt-4 text-2xl font-semibold">{plan.price}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-emerald-600" /> Unlimited
                  projects
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-emerald-600" /> Team
                  collaboration
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-emerald-600" /> Advanced
                  reporting
                </li>
              </ul>
              <Button
                variant={plan.active ? "secondary" : "default"}
                className="mt-5 w-full"
                asChild
              >
                <Link href="#">{plan.active ? "View plan" : "Upgrade"}</Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-none">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle>Payment history</CardTitle>
          <Link
            href="#"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Download invoice <ArrowUpRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="border-b text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Payment ID</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-4">Sep 12, 2026</td>
                <td className="py-4">$49.00</td>
                <td className="py-4">
                  <Badge variant="secondary">Paid</Badge>
                </td>
                <td className="py-4 text-muted-foreground">pay_10293</td>
              </tr>
              <tr>
                <td className="py-4">Aug 12, 2026</td>
                <td className="py-4">$49.00</td>
                <td className="py-4">
                  <Badge variant="secondary">Paid</Badge>
                </td>
                <td className="py-4 text-muted-foreground">pay_98483</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
