"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { BloodGroup, User } from "@/models/user";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Form schema with validation
const formSchema = z.object({
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  linkedinProfile: z
    .string()
    .url({ message: "Please enter a valid LinkedIn URL." })
    .optional()
    .or(z.literal("")),
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProfileDetailsFormProps {
  userData: User;
}

// Mock function to update user data
const updateUserProfile = async (data: FormValues): Promise<User> => {
  // This would be an API call in a real implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...data,
      } as User);
    }, 1000);
  });
};

export function ProfileDetailsForm({ userData }: ProfileDetailsFormProps) {
  const [formChanged, setFormChanged] = useState(false);
  const queryClient = useQueryClient();

  // Initialize form with user data
  const defaultValues = {
    phone: userData.phone || "",
    address: userData.address || "",
    linkedinProfile: userData.linkedinProfile || "",
    bloodGroup: userData.bloodGroup,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Setup mutation with TanStack Query
  const { mutate, isPending } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      // Invalidate and refetch the user data query
      queryClient.invalidateQueries({ queryKey: ["userData"] });

      toast.success("Profile updated", {
        description: "Your profile details have been updated successfully.",
      });

      // Reset the form change state since we've saved the changes
      setFormChanged(false);
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error("Error", {
        description: "Failed to update profile. Please try again.",
      });
    },
  });

  // Watch for form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Check if any field has changed from its default value
      const hasChanged =
        value.phone !== defaultValues.phone ||
        value.address !== defaultValues.address ||
        value.linkedinProfile !== defaultValues.linkedinProfile ||
        value.bloodGroup !== defaultValues.bloodGroup;

      setFormChanged(hasChanged);
    });

    return () => subscription.unsubscribe();
  }, [form, form.watch, defaultValues]);

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+91 9876543210" {...field} />
                </FormControl>
                <FormDescription>Your contact phone number</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Blood Group */}
          <FormField
            control={form.control}
            name="bloodGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Group</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your blood group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(BloodGroup).map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Your blood group for emergency purposes
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* LinkedIn Profile */}
          <FormField
            control={form.control}
            name="linkedinProfile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn Profile</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://linkedin.com/in/username"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Your LinkedIn profile URL</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Permanent Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permanent Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your permanent address"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your permanent residential address
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending || !formChanged}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
