"use client";
import { useState } from "react";
import { PublicLayout, SectionIntro } from "@/components/public-site";

import { Button } from "@base-ui/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@base-ui/react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <PublicLayout>
      <main className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <SectionIntro
          eyebrow="Contact"
          title="Let’s talk about your workspace."
          body="Have a question about ORBRIN or want to understand how it could fit your team? Send a note and we’ll be ready for the next step."
        />
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle>
              {submitted ? "Message ready" : "Send a message"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 text-sm leading-6">
                Thanks for reaching out. This form is ready for the contact API
                connection.
              </div>
            ) : (
              <form
                className="flex flex-col gap-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSubmitted(true);
                }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" className="min-h-32" required />
                </div>
                <Button type="submit">Prepare message</Button>
                <p className="text-xs text-muted-foreground">
                  No backend contact endpoint is connected yet; this UI does not
                  send data.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </PublicLayout>
  );
}
