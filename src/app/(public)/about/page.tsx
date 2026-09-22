import { PublicLayout, SectionIntro } from "@/components/public-site";
export default function AboutPage() {
  return (
    <PublicLayout>
      <main className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionIntro
          eyebrow="About ORBRIN"
          title="A more thoughtful way to operate."
          body="ORBRIN is a product-focused workspace for organizations that care about clarity, ownership, and steady progress."
        />
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Clarity",
              body: "Make the shape of the work understandable at a glance.",
            },
            {
              title: "Context",
              body: "Keep decisions, people, and delivery connected.",
            },
            { title: "Momentum", body: "Create a rhythm teams can sustain." },
          ].map((item) => (
            <div key={item.title} className="border-t border-border pt-5">
              <h2 className="font-heading text-lg font-semibold">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </main>
    </PublicLayout>
  );
}
