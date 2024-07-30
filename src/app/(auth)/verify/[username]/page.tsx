"use client";
import { useToast } from "@/components/ui/use-toast";
import { verifySchema } from "@/schema/verify.schema";
import { ApiResponse } from "@/types/ApiResponse.type";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
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

function VerifyAccount() {
  // Get username and toast instance from context
  const router = useRouter();
  const params = useParams<{ username: string }>(); // Destructure username
  const { toast } = useToast();

  // Form instance with Zod resolver for verification code
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  // Handle form submission for verification
  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      // Send verification code and username to the server
      const response = await axios.post<ApiResponse>("/api/verify-code", {
        username: params.username,
        code: data.code,
      });
      toast({
        title: "Success",
        description: response.data.message,
      });
      router.replace(`sign-in`); // Redirect to verification page
    } catch (error) {
      console.error("Error in SignUp of User", error);
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessages = axiosError.response?.data.message;
      toast({
        title: "SignUp failed",
        description: errorMessages,
        variant: "destructive",
      });
    }
  };
  // Render the verification form
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Verify</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default VerifyAccount;
