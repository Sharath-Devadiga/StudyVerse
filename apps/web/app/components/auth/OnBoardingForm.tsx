"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Check, ChevronLeft, GraduationCap, Layers, School } from "lucide-react";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { useToast } from "../ui/use-toast";
import { useAuthStore } from "../../store/AuthStore/useAuthStore";
import {
  getUniversities,
  getDepartments,
  getSemesters,
} from "../../../lib/api/academic";
import { joinRoom } from "../../../lib/api/room";
import { getUserRooms } from "../../../lib/api/room";
import { updateUserProfile } from "../../../lib/api/user";
import { getApiErrorMessage, isOnboardingComplete } from "../../../lib/utils";
import type { University, Department, Semester } from "../../../lib/types";

type StepKey = "university" | "department" | "semester";

const STEPS: { key: StepKey; label: string; icon: typeof School }[] = [
  { key: "university", label: "University", icon: School },
  { key: "department", label: "Department", icon: GraduationCap },
  { key: "semester", label: "Semester", icon: Layers },
];

export function OnBoardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addingSemester = searchParams.get("add") === "1";
  const { toast } = useToast();
  const { user, isHydrated, isAuthenticated, setUser, setRooms } = useAuthStore();

  const [stepIndex, setStepIndex] = useState(0);

  const [universities, setUniversities] = useState<University[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [universityId, setUniversityId] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [semesterIds, setSemesterIds] = useState<string[]>([]);
  const [joinedSemesterIds, setJoinedSemesterIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect users who already finished onboarding.
  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
  }, [isHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!isHydrated || !user) return;
    if (isOnboardingComplete(user) && !addingSemester) {
      (async () => {
        try {
          const rooms = await getUserRooms();
          setRooms(rooms);
          if (rooms.length > 0) router.replace("/dashboard");
        } catch {
          /* stay on onboarding to let user join a room */
        }
      })();
    }
  }, [isHydrated, user, router, setRooms, addingSemester]);

  useEffect(() => {
    if (addingSemester && user?.universityId && user.departmentId) { setUniversityId(user.universityId); setDepartmentId(user.departmentId); setStepIndex(2); getUserRooms().then((rooms) => setJoinedSemesterIds(rooms.map((room) => room.semester.id))).catch(() => {}); }
  }, [addingSemester, user]);

  // Load universities on mount.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setListError(null);
      try {
        const data = await getUniversities();
        if (!cancelled) setUniversities(data);
      } catch (error) {
        if (!cancelled)
          setListError(getApiErrorMessage(error, "Failed to load universities."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load departments when a university is chosen.
  useEffect(() => {
    if (!universityId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setListError(null);
      try {
        const data = await getDepartments(universityId!);
        if (!cancelled) setDepartments(data);
      } catch (error) {
        if (!cancelled)
          setListError(getApiErrorMessage(error, "Failed to load departments."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [universityId]);

  // Load semesters when a department is chosen.
  useEffect(() => {
    if (!departmentId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setListError(null);
      try {
        const data = await getSemesters(departmentId!);
        if (!cancelled) setSemesters(data);
      } catch (error) {
        if (!cancelled)
          setListError(getApiErrorMessage(error, "Failed to load semesters."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [departmentId]);

  const currentStep = STEPS[stepIndex]!;

  const options = useMemo(() => {
    if (currentStep.key === "university")
      return universities.map((u) => ({ id: u.id, label: u.name }));
    if (currentStep.key === "department")
      return departments.map((d) => ({ id: d.id, label: d.name }));
    return semesters.map((s) => ({ id: s.id, label: `Semester ${s.number}` }));
  }, [currentStep.key, universities, departments, semesters]);

  const selectedId =
    currentStep.key === "university"
      ? universityId
      : currentStep.key === "department"
        ? departmentId
        : semesterIds[0] ?? null;

  function selectOption(id: string) {
    if (currentStep.key === "university") {
      setUniversityId(id);
      setDepartmentId(null);
      setSemesterIds([]);
      setDepartments([]);
      setSemesters([]);
    } else if (currentStep.key === "department") {
      setDepartmentId(id);
      setSemesterIds([]);
      setSemesters([]);
    } else if (!joinedSemesterIds.includes(id)) {
      setSemesterIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
    }
  }

  function goBack() {
    setListError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  async function goNext() {
    if (!selectedId) return;
    if (stepIndex < STEPS.length - 1) {
      setListError(null);
      setStepIndex((i) => i + 1);
      return;
    }
    await finish();
  }

  async function finish() {
    if (!universityId || !departmentId || semesterIds.length === 0) return;
    setSubmitting(true);
    try {
      // Persist the user's academic selection, then join the semester room.
      if (!addingSemester) { const updated = await updateUserProfile({ universityId, departmentId }); setUser(updated); }

      await Promise.all(semesterIds.map((semesterId) => joinRoom(semesterId)));

      const rooms = await getUserRooms();
      setRooms(rooms);

      toast({
        title: "Welcome to StudyVerse",
        description: "You're all set. Redirecting to your dashboard.",
      });
      router.replace("/dashboard");
    } catch (error) {
      toast({
        title: "Could not complete onboarding",
        description: getApiErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!isHydrated) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
          <BookOpen className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Set up your workspace
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {addingSemester ? "Choose another semester in your current academic workspace." : "Tell us where you study so we can connect you to the right study room."}
        </p>
      </div>

      {/* Step indicator */}
      <ol className="mb-6 flex items-center justify-center gap-2">
        {STEPS.map((step, idx) => {
          const StepIcon = step.icon;
          const done = idx < stepIndex;
          const active = idx === stepIndex;
          return (
            <li key={step.key} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium transition-colors ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white"
                    : done
                      ? "border-blue-200 bg-blue-50 text-blue-600"
                      : "border-gray-200 bg-white text-gray-400"
                }`}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
              </div>
              {idx < STEPS.length - 1 && (
                <span
                  className={`h-px w-8 ${idx < stepIndex ? "bg-blue-300" : "bg-gray-200"}`}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-medium text-gray-500">
          Step {stepIndex + 1} of {STEPS.length}
        </h2>
        <p className="mb-4 text-lg font-semibold text-gray-900">
          Select your {currentStep.label.toLowerCase()}
        </p>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : listError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm text-red-700">{listError}</p>
          </div>
        ) : options.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
            <p className="text-sm text-gray-500">
              No {currentStep.label.toLowerCase()} options are available yet.
            </p>
          </div>
        ) : currentStep.key === "semester" && addingSemester && semesters.length > 0 && semesters.every((semester) => joinedSemesterIds.includes(semester.id)) ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center"><p className="text-sm text-gray-500">You&apos;re already part of all available semesters.</p><Button type="button" className="mt-4" onClick={() => router.replace("/dashboard")}>Back to dashboard</Button></div>
        ) : currentStep.key === "semester" ? (
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {options.map((opt) => {
              const joined = joinedSemesterIds.includes(opt.id); const isSelected = semesterIds.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => selectOption(opt.id)}
                  disabled={joined}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="truncate font-medium">{opt.label}</span>
                  {joined ? <span className="text-xs font-medium text-emerald-600">Joined</span> : isSelected && <Check className="h-4 w-4 shrink-0 text-blue-600" />}
                </button>
              );
            })}
          </div>
        ) : (
          <Select value={selectedId ?? ""} onChange={(event) => selectOption(event.target.value)} placeholder={`Select your ${currentStep.label.toLowerCase()}`}>
            {options.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
          </Select>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={goBack}
            disabled={stepIndex === 0 || addingSemester || submitting}
            className={stepIndex === 0 || addingSemester ? "invisible" : ""}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            onClick={goNext}
            disabled={(!selectedId || (currentStep.key === "semester" && semesterIds.length === 0) || (addingSemester && semesters.length > 0 && semesters.every((semester) => joinedSemesterIds.includes(semester.id)))) || submitting}
          >
            {submitting
              ? "Joining..."
              : stepIndex === STEPS.length - 1
                ? "Join study room"
                : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
