// components/auth/LoginForm.tsx
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
import Link from "next/link";
import { Chrome } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const formSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: values.email,
        password: values.password,
      });

      // Store token if returned
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      toast({
        title: "Success ✅",
        description: "You have logged in successfully.",
      });
      router.push("/onBoarding");
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed ❌",
        description: error.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Log in to your Studyverse account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </Form>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 border-t" />
          <span className="text-xs text-gray-500">OR</span>
          <div className="flex-1 border-t" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full flex items-center gap-2"
          onClick={handleGoogleLogin}
        >
          <Chrome size={18} />
          Continue with Google
        </Button>
      </CardContent>
      <CardFooter className="text-center text-sm">
        <p>
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline dark:text-blue-400">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
