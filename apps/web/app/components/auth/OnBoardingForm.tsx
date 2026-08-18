// components/auth/OnBoardingForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
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

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const formSchema = z.object({
  bio: z.string().max(500, "Bio must be less than 500 characters.").optional(),
  interests: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
});

export function OnBoardingForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: "",
      interests: "",
      profileImageUrl: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error ❌",
          description: "No authentication token found. Please log in again.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      await axios.post(
        `${API_URL}/user/profile`,
        {
          bio: values.bio,
          interests: values.interests?.split(",").map((i) => i.trim()),
          profileImageUrl: values.profileImageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Success ✅",
        description: "Profile updated successfully!",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("OnBoarding failed:", error);
      toast({
        title: "Error ❌",
        description:
          error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Tell us a bit about yourself to personalize your experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Bio (Optional)</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Tell us about yourself..."
                      className="flex min-h-24 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-50 dark:placeholder:text-gray-500 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-950"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interests"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Interests (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Web Development, AI, Data Science (comma-separated)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profileImageUrl"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Profile Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Complete Profile
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={handleSkip}
        >
          Skip for now
        </Button>
      </CardFooter>
    </Card>
  );
}
