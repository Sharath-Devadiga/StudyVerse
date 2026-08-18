"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, GraduationCap, Loader2, Mail } from "lucide-react";
import { AppHeader } from "../layout/AppHeader";
import { Avatar } from "../layout/Avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { useAuthStore } from "../../store/AuthStore/useAuthStore";
import { getUserProfile, updateUserProfile } from "../../../lib/api/user";
import { getApiErrorMessage } from "../../../lib/utils";
import type { User } from "../../../lib/types";

export function ProfileContent() {
  const { setUser } = useAuthStore();
  const { toast } = useToast();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getUserProfile()
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setUser(data);
        setUsername(data.username ?? "");
        setAvatar(data.avatar ?? "");
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Failed to load your profile."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setUser]);

  const dirty =
    profile !== null &&
    (username.trim() !== (profile.username ?? "") ||
      avatar.trim() !== (profile.avatar ?? ""));

  async function save() {
    if (!profile) return;
    setSaving(true);
    try {
      const updates: { username?: string; avatar?: string | null } = {};
      if (username.trim() !== (profile.username ?? "")) {
        updates.username = username.trim();
      }
      if (avatar.trim() !== (profile.avatar ?? "")) {
        updates.avatar = avatar.trim() === "" ? null : avatar.trim();
      }
      const updated = await updateUserProfile(updates);
      setProfile(updated);
      setUser(updated);
      setUsername(updated.username ?? "");
      setAvatar(updated.avatar ?? "");
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch (err) {
      toast({
        title: "Update failed",
        description: getApiErrorMessage(err, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Identity header */}
            <section className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <Avatar name={profile.name} src={avatar || profile.avatar} size={72} />
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold text-gray-900">
                  {profile.name}
                </h1>
                {profile.username && (
                  <p className="text-sm text-gray-500">@{profile.username}</p>
                )}
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail className="h-3.5 w-3.5" />
                  {profile.email}
                </p>
              </div>
            </section>

            {/* Academic info (read-only, set during onboarding) */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Academic
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Building2 className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">University</p>
                    <p className="truncate text-sm font-medium text-gray-900">
                      {profile.university?.name ??
                        profile.department?.university?.name ??
                        "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <GraduationCap className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Department</p>
                    <p className="truncate text-sm font-medium text-gray-900">
                      {profile.department?.name ?? "Not set"}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-400">
                To change your university or department,{" "}
                <Link href="/onBoarding" className="text-blue-600 hover:underline">
                  update your workspace setup
                </Link>
                .
              </p>
            </section>

            {/* Editable fields */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Edit profile
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label
                    htmlFor="avatar"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Avatar URL
                  </label>
                  <Input
                    id="avatar"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    type="url"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Leave blank to use your initials.
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button type="button" onClick={save} disabled={!dirty || saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
