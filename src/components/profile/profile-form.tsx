"use client";
import { useState } from "react";
import { toast } from "sonner";
import { type UserProfile, updateUserProfile } from "@/actions/user.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const result = await updateUserProfile({ fullName });
    setSaving(false);
    if (!result.success)
      toast.error(result.message ?? "Unable to update profile.");
    else toast.success(result.message ?? "Profile updated.");
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={profile.email} readOnly />
          </div>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>Role</span>
            <span className="font-medium text-foreground">
              {profile.role ?? "Member"}
            </span>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
