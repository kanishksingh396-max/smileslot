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
  initiateGoogleSignIn,
} from "@/firebase/non-blocking-login";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";
import { updateProfile } from "firebase/auth";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.75 8.36,4.73 12.19,4.73C15.28,4.73 17.27,6.8 17.27,6.8L19.6,4.54C19.6,4.54 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.2 6.42,22 12.19,22C17.6,22 21.5,18.33 21.5,12.33C21.5,11.76 21.45,11.43 21.35,11.1Z"
    />
  </svg>
);


const formSchema = z.object({
  name: z.string().optional(),
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
    resolver: zodResolver(formSchema.superRefine((data, ctx) => {
      if (type === 'signup' && !data.name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['name'],
          message: 'Name is required.',
        });
      }
    })),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "login") {
        await initiateEmailSignIn(auth, values.email, values.password);
      } else {
        const userCredential = await initiateEmailSignUp(auth, values.email, values.password);
        if (userCredential?.user && values.name) {
          await updateProfile(userCredential.user, {
            displayName: values.name,
          });
        }
      }
      router.push("/");
    } catch (error) {
      handleAuthError(error);
    }
  }

  async function handleGoogleSignIn() {
    try {
      await initiateGoogleSignIn(auth);
      router.push("/");
    } catch (error) {
      handleAuthError(error);
    }
  }

  function handleAuthError(error: any) {
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password.";
          break;
        case "auth/email-already-in-use":
          errorMessage = "This email is already in use.";
          break;
        case "auth/popup-closed-by-user":
          errorMessage = "Sign-in process was cancelled.";
          break;
        default:
          errorMessage = error.message;
          break;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast({
      title: "Authentication Failed",
      description: errorMessage,
      variant: "destructive",
    });
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {type === "login" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to{" "}
          {type === "login" ? "log in" : "create your account"}.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {type === 'signup' && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
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

       <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button variant="outline" onClick={handleGoogleSignIn}>
        <GoogleIcon />
        Sign in with Google
      </Button>

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
