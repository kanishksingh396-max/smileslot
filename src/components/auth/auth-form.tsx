"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import {
  initiateEmailSignIn,
  initiateEmailSignUp,
} from "@/firebase/non-blocking-login";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type AuthFormProps = {
  type: "login" | "signup";
};

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "login") {
        await initiateEmailSignIn(auth, values.email, values.password);
      } else {
        await initiateEmailSignUp(auth, values.email, values.password);
      }
      router.push("/");
    } catch (error) {
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
            errorMessage = "Invalid email or password.";
            break;
          case "auth/email-already-in-use":
            errorMessage = "This email is already in use.";
            break;
          default:
            errorMessage = error.message;
            break;
        }
      }
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {type === "login" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password below to{" "}
          {type === "login" ? "log in" : "create your account"}.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
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
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            {type === "login" ? "Log In" : "Sign Up"}
          </Button>
        </form>
      </Form>
      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link
          href={type === "login" ? "/signup" : "/login"}
          className="underline underline-offset-4 hover:text-primary"
        >
          {type === "login"
            ? "Don't have an account? Sign Up"
            : "Already have an account? Log In"}
        </Link>
      </p>
    </div>
  );
}
