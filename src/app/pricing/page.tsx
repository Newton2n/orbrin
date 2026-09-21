import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicLayout, SectionIntro } from "@/components/public-site";
const plans = [
  {
    name: "Enterprise",
    desc: "A considered setup for larger organizations.",
    items: [
      "Everything in Scale",
      "Advanced organization controls",
      "Dedicated support",
    ],
  },
];
export default function PricingPage() {
  return (
    <PublicLayout>
      <main className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionIntro
          eyebrow="Plans that grow with you"
          title="A clear foundation for every stage."
          body="Plan details and pricing are designed to be configured as the subscription system comes online. Start with the workspace that fits your operating model."
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={
                index === 1
                  ? "border-primary/50 shadow-lg shadow-primary/10"
                  : "border-border/70 shadow-none"
              }
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">
                  {plan.desc}
                </p>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl font-semibold">Custom</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Configured for your organization
                </p>
                <ul className="mt-7 flex flex-col gap-3">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full"
                  variant={index === 1 ? "default" : "outline"}
                  asChild
                >
                  <Link href="/contact">Talk to our team</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </PublicLayout>
  );
}
