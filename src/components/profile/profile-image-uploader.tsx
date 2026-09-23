"use client";
import { useState } from "react";
import { toast } from "sonner";
import { deleteProfileImage, type UserProfile, updateProfileImage } from "@/actions/user.action";
import { ImageUploadPreview } from "@/components/image-upload-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function ProfileImageUploader({ profile }: { profile: UserProfile }) { const [saving, setSaving] = useState(false); async function select(file: File | null) { if (!file) return; setSaving(true); const result = await updateProfileImage(file); setSaving(false); if (!result.success) toast.error(result.message ?? "Unable to update picture."); else toast.success(result.message ?? "Picture updated."); } async function remove() { setSaving(true); const result = await deleteProfileImage(); setSaving(false); if (!result.success) toast.error(result.message ?? "Unable to delete picture."); else toast.success(result.message ?? "Picture deleted."); } return <Card><CardHeader><CardTitle>Profile picture</CardTitle></CardHeader><CardContent><ImageUploadPreview label="Profile picture" fallbackName={profile.fullName} currentImageUrl={profile.profileImageUrl} disabled={saving} onFileSelect={(file) => void select(file)} onDeleteCurrentImage={() => remove()} isDeleting={saving} helperText="PNG, JPG, or WEBP up to 5 MB." /></CardContent></Card>; }
