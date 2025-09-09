"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Info, Loader2, ExternalLink } from "lucide-react";
import { FaSlack, FaLinkedin } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BloodGroup, User } from "@/models/user";

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
    .min(1, { message: "LinkedIn profile is required." })
    .url({ message: "Please enter a valid URL." })
    .refine((url) => url.includes("linkedin.com/"), {
      message: "URL must be a LinkedIn profile.",
    }),
  bloodGroup: z.string().optional(),
  slackUserId: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface ProfileDetailsFormProps {
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

  const response = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update profile");
  }

  return response.json();
};

// Helper function to convert database enum values to display values
const getDisplayBloodGroup = (bloodGroup?: BloodGroup): string | undefined => {
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

// Helper function to extract username from LinkedIn URL
const extractLinkedInUsername = (url: string): string => {
  try {
    // Handle different LinkedIn URL formats
    if (url.includes("linkedin.com/in/")) {
      // Extract username from linkedin.com/in/username
      const username = url
        .split("linkedin.com/in/")[1]
        .split("/")[0]
        .split("?")[0];
      return username;
    } else if (url.includes("linkedin.com/company/")) {
      // Extract company name from linkedin.com/company/company-name
      const companyName = url
        .split("linkedin.com/company/")[1]
        .split("/")[0]
        .split("?")[0];
      return companyName;
    }
    // If we can't parse it, just return the URL
    return url;
  } catch (error) {
    return url;
  }
};

// Custom SlackIdTooltip component for consistent usage
function SlackIdTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 rounded-full p-0"
          type="button"
        >
          <Info className="h-4 w-4 text-muted-foreground hover:text-primary" />
          <span className="sr-only">Slack ID Info</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="w-80 p-4 space-y-3">
        <h3 className="font-medium">How to Find Your Slack User ID</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Step 1:</span> Open Slack
          </div>
          <div>
            <span className="font-medium">Step 2:</span> Click your profile
            picture on the bottom left
          </div>
          <div>
            <span className="font-medium">Step 3:</span> Select "Profile"
          </div>
          <div>
            <span className="font-medium">Step 4:</span> Click the vertical
            three dots (⋮) and select "Copy member ID"
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function ProfileDetailsForm({
  userData,
  onSuccess,
}: ProfileDetailsFormProps) {
  const [formChanged, setFormChanged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Initialize form with user data
  const defaultValues = {
    phone: userData.phone || "",
    address: userData.address || "",
    linkedinProfile: userData.linkedinProfile || "",
    bloodGroup: getDisplayBloodGroup(userData.bloodGroup),
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
      queryClient.invalidateQueries({ queryKey: ["userData", userData.id] });

      toast.success("Profile updated", {
        description: "Your profile details have been updated successfully.",
      });

      // Reset the form change state since we've saved the changes
      setFormChanged(false);

      // Exit edit mode
      setIsEditing(false);

      // Call onSuccess callback if provided
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
            : "Failed to update profile. Please try again.",
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
        value.bloodGroup !== defaultValues.bloodGroup ||
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
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Profile Details</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              "Cancel"
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        </div>

        {isEditing ? (
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
                          {[
                            "A+",
                            "A-",
                            "B+",
                            "B-",
                            "AB+",
                            "AB-",
                            "O+",
                            "O-",
                          ].map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <div className="flex items-center gap-1">
                        <FormLabel>Slack User ID</FormLabel>
                        <SlackIdTooltip />
                      </div>
                      <FormControl>
                        <Input placeholder="U01234ABC" {...field} />
                      </FormControl>
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
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Phone
                </h4>
                <p>{userData.phone || "Not provided"}</p>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Blood Group
                </h4>
                <p>
                  {getDisplayBloodGroup(userData.bloodGroup) || "Not provided"}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">
                  LinkedIn Profile
                </h4>
                {userData.linkedinProfile ? (
                  <div className="flex items-center gap-1">
                    <FaLinkedin className="h-4 w-4 text-[#0A66C2]" />
                    <a
                      href={userData.linkedinProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {extractLinkedInUsername(userData.linkedinProfile)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ) : (
                  <p>Not provided</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Slack ID
                  </h4>
                  <SlackIdTooltip />
                </div>
                {userData.slackUserId ? (
                  <div className="flex items-center gap-1">
                    <FaSlack className="h-4 w-4 text-[#4A154B]" />
                    <a
                      href={`https://fastcodeai.slack.com/team/${userData.slackUserId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {userData.slackUserId}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ) : (
                  <p>Not provided</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                Address
              </h4>
              <p className="whitespace-pre-wrap">
                {userData.address || "Not provided"}
              </p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
