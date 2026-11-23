"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});
type Values = z.infer<typeof schema>;

export function AcceptInviteForm({ token }: { token?: string }) {
  const { acceptInvite } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    data: info,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["invite", token],
    queryFn: () => authService.inviteInfo(token as string),
    enabled: !!token,
    retry: false,
  });

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", password: "" },
  });

  const onSubmit = async (values: Values) => {
    if (!token) return;
    setSubmitting(true);
    try {
      await acceptInvite({ token, ...values });
      toast.success("Welcome aboard!");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (token && isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!token || isError || !info) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Invitation not valid</CardTitle>
          <CardDescription>
            This invitation link is invalid, has expired, or was already used. Ask your admin to
            send a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Go to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Join {info.organizationName}</CardTitle>
        <CardDescription>
          You were invited as <span className="font-medium">{info.email}</span>. Choose a name and
          password to create your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" {...field} />
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
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
