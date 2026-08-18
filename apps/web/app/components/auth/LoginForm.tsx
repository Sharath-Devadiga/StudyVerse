"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import Link from "next/link";
import { Chrome } from "lucide-react";
import { signin, getGoogleAuthUrl } from "../../../lib/api/auth";
import { getUserProfile } from "../../../lib/api/user";
import { getUserRooms } from "../../../lib/api/room";
import { useAuthStore } from "../../store/AuthStore/useAuthStore";
import { getApiErrorMessage, isOnboardingComplete } from "../../../lib/utils";

const formSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { setUser, setRooms } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await signin(values.email, values.password);
      setUser(response.user);

      const profile = await getUserProfile();
      setUser(profile);

      if (isOnboardingComplete(profile)) {
        const rooms = await getUserRooms();
        setRooms(rooms);
        if (rooms.length > 0) {
          router.push("/dashboard");
          return;
        }
      }

      router.push("/onBoarding");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: getApiErrorMessage(error, "An unexpected error occurred."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Log in to your StudyVerse account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com"
                      type="email"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          <span className="text-xs text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full flex items-center gap-2"
          onClick={() => {
            window.location.href = getGoogleAuthUrl("signin");
          }}
        >
          <Chrome size={18} />
          Continue with Google
        </Button>
      </CardContent>
      <CardFooter className="justify-center text-sm">
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
