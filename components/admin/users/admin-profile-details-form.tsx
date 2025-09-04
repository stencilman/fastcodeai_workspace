"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { BloodGroup, User, UserRole } from "@/models/user";
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
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
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
  bloodGroup: z.string().optional(),
  role: z.string(),
  slackUserId: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface AdminProfileDetailsFormProps {
  userData: User;
  onSuccess?: () => void;
}

// Function to update user profile via API
const updateUserProfile = async (
  userId: string,
  data: FormValues
): Promise<User> => {
  // Convert A+ format to A_POSITIVE format for the API
  let apiData = { ...data };

  if (apiData.bloodGroup) {
    // Map the display value to the enum value expected by the API
    const bloodGroupMapping: Record<string, BloodGroup> = {
      "A+": BloodGroup.A_POSITIVE,
      "A-": BloodGroup.A_NEGATIVE,
      "B+": BloodGroup.B_POSITIVE,
      "B-": BloodGroup.B_NEGATIVE,
      "AB+": BloodGroup.AB_POSITIVE,
      "AB-": BloodGroup.AB_NEGATIVE,
      "O+": BloodGroup.O_POSITIVE,
      "O-": BloodGroup.O_NEGATIVE,
    };

    apiData.bloodGroup =
      bloodGroupMapping[apiData.bloodGroup] || apiData.bloodGroup;
  }

  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update user profile");
  }

  return response.json();
};

export function AdminProfileDetailsForm({
  userData,
  onSuccess,
}: AdminProfileDetailsFormProps) {
  const [formChanged, setFormChanged] = useState(false);
  const queryClient = useQueryClient();

  // Convert database enum values to display values
  const getDisplayBloodGroup = (
    bloodGroup?: BloodGroup
  ): string | undefined => {
    if (!bloodGroup) return undefined;

    // Map database enum values to display values
    const bloodGroupMapping: Record<string, string> = {
      A_POSITIVE: "A+",
      A_NEGATIVE: "A-",
      B_POSITIVE: "B+",
      B_NEGATIVE: "B-",
      AB_POSITIVE: "AB+",
      AB_NEGATIVE: "AB-",
      O_POSITIVE: "O+",
      O_NEGATIVE: "O-",
    };

    return bloodGroupMapping[bloodGroup as string] || undefined;
  };

  // Initialize form with user data
  const defaultValues = {
    name: userData.name || "",
    phone: userData.phone || "",
    address: userData.address || "",
    linkedinProfile: userData.linkedinProfile || "",
    bloodGroup: getDisplayBloodGroup(userData.bloodGroup),
    role: userData.role || UserRole.USER,
    slackUserId: userData.slackUserId || "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Setup mutation with TanStack Query
  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) => updateUserProfile(userData.id, values),
    onSuccess: () => {
      // Invalidate and refetch the user data query
      queryClient.invalidateQueries({ queryKey: ["user", userData.id] });

      toast.success("User profile updated", {
        description: "User profile details have been updated successfully.",
      });

      // Reset the form change state since we've saved the changes
      setFormChanged(false);

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to update user profile. Please try again.",
      });
    },
  });

  // Watch for form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Check if any field has changed from its default value
      const hasChanged =
        value.name !== defaultValues.name ||
        value.phone !== defaultValues.phone ||
        value.address !== defaultValues.address ||
        value.linkedinProfile !== defaultValues.linkedinProfile ||
        value.bloodGroup !== defaultValues.bloodGroup ||
        value.role !== defaultValues.role ||
        value.slackUserId !== defaultValues.slackUserId;

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
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>User's full name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                <FormDescription>User's contact phone number</FormDescription>
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
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Blood group for emergency purposes
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
                <FormDescription>User's LinkedIn profile URL</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Slack User ID */}
          <FormField
            control={form.control}
            name="slackUserId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slack User ID</FormLabel>
                <FormControl>
                  <Input placeholder="U01234ABC" {...field} />
                </FormControl>
                <FormDescription>User's Slack ID</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* User Role */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UserRole.USER}>User</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  User's role and permissions level
                </FormDescription>
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
                  placeholder="Enter permanent address"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                User's permanent residential address
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
