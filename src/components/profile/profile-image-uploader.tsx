"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  deleteProfileImage,
  type UserProfile,
  updateProfileImage,
} from "@/actions/user.action";
import { AvatarWithFallback } from "@/components/avatar-with-fallback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function ProfileImageUploader({ profile }: { profile: UserProfile }) {
  const [saving, setSaving] = useState(false);
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const result = await updateProfileImage(file);
    setSaving(false);
    if (!result.success)
      toast.error(result.message ?? "Unable to update picture.");
    else toast.success(result.message ?? "Picture updated.");
  }
  async function remove() {
    setSaving(true);
    const result = await deleteProfileImage();
    setSaving(false);
    if (!result.success)
      toast.error(result.message ?? "Unable to delete picture.");
    else toast.success(result.message ?? "Picture deleted.");
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile picture</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <AvatarWithFallback
          name={profile.fullName}
          imageUrl={profile.profileImageUrl}
          size="lg"
        />
        <div className="space-y-2">
          <Label htmlFor="profile-image">Upload image</Label>
          <Input
            id="profile-image"
            type="file"
            accept="image/*"
            onChange={upload}
            disabled={saving}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => void remove()}
            disabled={saving || !profile.profileImageUrl}
          >
            Remove picture
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
