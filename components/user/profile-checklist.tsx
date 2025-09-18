"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Circle,
  Upload,
  Image,
  ImagePlus,
  X,
  ExternalLink,
  Eye,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { FaLinkedin } from "react-icons/fa6";

interface ProfileChecklistProps {
  userId: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
}

export function ProfileChecklist({ userId }: ProfileChecklistProps) {
  const queryClient = useQueryClient();

  // States for form inputs
  const [teamBio, setTeamBio] = useState("");
  const [initialTeamBio, setInitialTeamBio] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [initialImagePreview, setInitialImagePreview] = useState<string | null>(
    null
  );

  // Image preview dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Create a ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch checklist data
  const { data: checklistData, isLoading } = useQuery({
    queryKey: ["checklist", userId],
    queryFn: async () => {
      const response = await fetch("/api/users/checklist");
      if (!response.ok) {
        throw new Error("Failed to fetch checklist data");
      }
      return response.json();
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Update states when data is loaded
  useEffect(() => {
    if (checklistData) {
      const bio = checklistData.teamBio || "";
      setTeamBio(bio);
      setInitialTeamBio(bio);

      if (checklistData.teamImageUrl) {
        setImagePreview(checklistData.teamImageUrl);
        setInitialImagePreview(checklistData.teamImageUrl);
      }
    }
  }, [checklistData]);

  // Mutations
  const updateChecklistMutation = useMutation({
    mutationFn: async (data: {
      linkedinUpdated?: boolean;
      profilePictureUpdated?: boolean;
      teamBio?: string;
    }) => {
      const response = await fetch("/api/users/checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update checklist");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", userId] });
      queryClient.invalidateQueries({ queryKey: ["userDashboard"] });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/users/checklist/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", userId] });
      queryClient.invalidateQueries({ queryKey: ["userDashboard"] });
      setImageFile(null);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      toast.success("Image selected", {
        description: "Your profile image has been selected",
      });
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTeamBio(e.target.value);
  };

  const handleSaveBio = () => {
    // Save the bio to the API
    updateChecklistMutation.mutate({ teamBio }, {
      onSuccess: () => {
        // Update the initial state to match the current state
        setInitialTeamBio(teamBio);
        
        // Show success message
        toast.success("Bio updated successfully");
      }
    });

    // If there's a new image file, upload it
    if (imageFile) {
      uploadImageMutation.mutate(imageFile, {
        onSuccess: () => {
          // Update the initial state to match the current state
          if (imagePreview) {
            setInitialImagePreview(imagePreview);
          }
          
          // Show success message
          toast.success("Profile image updated successfully");
        }
      });
    }
  };

  const handleLinkedinToggle = () => {
    updateChecklistMutation.mutate({
      linkedinUpdated: !checklistData?.linkedinUpdated,
    });
  };

  const handleProfilePictureToggle = () => {
    updateChecklistMutation.mutate({
      profilePictureUpdated: !checklistData?.profilePictureUpdated,
    });
  };

  return (
    <div className="space-y-6">
      {/* LinkedIn Update Checklist Item */}
      <div className="flex items-start space-x-4 p-4 rounded-md transition-colors bg-slate-50 border border-slate-100">
        <div className="flex-shrink-0 pt-0.5">
          <Checkbox
            id="linkedin-check"
            checked={checklistData?.linkedinUpdated || false}
            onCheckedChange={handleLinkedinToggle}
            disabled={updateChecklistMutation.isPending}
          />
        </div>
        <div className="flex-grow space-y-1">
          <div className="flex items-center">
            <FaLinkedin className="h-5 w-5 text-[#0A66C2]" />
            <Label
              htmlFor="linkedin-check"
              className="ml-2 font-medium cursor-pointer"
            >
              Update LinkedIn Profile
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Please update your job on LinkedIn to reflect your current position
            at Fast Code AI
          </p>
          <div className="mt-2">
            <a
              href="https://www.linkedin.com/in/me/edit/forms/position/new/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Add experience on LinkedIn
            </a>
          </div>
        </div>
      </div>

      {/* Profile Picture Checklist Item */}
      <div className="flex items-start space-x-4 p-4 rounded-md transition-colors bg-slate-50 border border-slate-100">
        <div className="flex-shrink-0 pt-0.5">
          <Checkbox
            id="profile-picture-check"
            checked={checklistData?.profilePictureUpdated || false}
            onCheckedChange={handleProfilePictureToggle}
            disabled={updateChecklistMutation.isPending}
          />
        </div>
        <div className="flex-grow space-y-1">
          <div className="flex items-center">
            <Image className="h-5 w-5 text-blue-500" />
            <Label
              htmlFor="profile-picture-check"
              className="ml-2 font-medium cursor-pointer"
            >
              Professional Profile Picture
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Please use a professional profile picture on your Gmail and Slack
          </p>
          <div className="mt-2 space-y-1">
            <a
              href="https://support.google.com/mail/answer/35529?hl=en&co=GENIE.Platform%3DDesktop"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              How to change Gmail profile picture
            </a>
            <a
              href="https://slack.com/help/articles/115005506003-Upload-a-profile-photo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              How to change Slack profile picture
            </a>
          </div>
        </div>
      </div>

      {/* Team Bio with Input Fields */}
      <div className="p-4 rounded-md bg-slate-50 border border-slate-100">
        <div className="flex items-center mb-3">
          <Upload className="h-5 w-5 text-green-500 mr-2" />
          <h3 className="font-medium">Team Page Bio</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          Please upload an image and a small intro/bio that will be visible on
          the teams page on the main website
        </p>
        <div className="mb-4">
          <a
            href="https://www.fastcode.ai/team"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View team page for reference
          </a>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-3 w-full">
            {/* Image Upload */}
            <div className="flex-shrink-0 w-full sm:w-[100px] flex flex-col items-center">
              {imagePreview ? (
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="relative w-24 h-24 rounded-md overflow-hidden border border-slate-200 cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDialogOpen(true);
                      setIsImageLoading(true);
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="w-24 h-24 rounded-md bg-slate-200 flex items-center justify-center border border-slate-300 cursor-pointer hover:bg-slate-300 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-8 w-8 text-slate-400" />
                </div>
              )}

              <div
                className="mt-2 flex justify-center"
                style={{ width: "100px" }}
              >
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  style={{ width: "100px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  {imagePreview ? "Change" : "Upload"}
                </Button>
              </div>
            </div>

            {/* Bio Text */}
            <div className="w-full flex-grow space-y-2 sm:max-w-[calc(100%-120px)]">
              <div className="flex justify-between items-center">
                <Label htmlFor="team-bio" className="text-sm font-medium">
                  Short Bio
                </Label>
                <span className="text-xs text-muted-foreground">
                  {teamBio.length}/200
                </span>
              </div>
              <Textarea
                id="team-bio"
                placeholder="Write a short professional bio (max 200 characters)"
                value={teamBio}
                onChange={handleBioChange}
                maxLength={200}
                className="resize-none h-28 sm:h-24 min-h-[112px] sm:min-h-[96px] max-h-[112px] sm:max-h-[96px] overflow-y-auto w-full break-words"
                rows={5}
              />
              <div className="text-xs text-muted-foreground">
                <span>
                  Brief introduction that will appear on the team page
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveBio}
              disabled={
                // Disable if no changes or if loading
                (teamBio === initialTeamBio && !imageFile) ||
                updateChecklistMutation.isPending ||
                uploadImageMutation.isPending
              }
            >
              {updateChecklistMutation.isPending ||
              uploadImageMutation.isPending
                ? "Saving..."
                : "Save Bio & Image"}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] max-w-full">
          <DialogHeader>
            <DialogTitle className="pr-8">
              Team Profile Image
              <div className="hidden sm:block mt-2 sm:mt-0">
                {imagePreview && (
                  <a
                    href={imagePreview as string}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in new tab
                  </a>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[60vh] md:h-[70vh] mt-2">
            {isImageLoading && (
              <div className="absolute inset-0 flex justify-center items-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {imageError ? (
              <div className="flex flex-col items-center justify-center h-full bg-slate-50">
                <p className="mb-4 text-red-600">
                  Unable to load image preview.
                </p>
                {imagePreview && (
                  <a
                    href={imagePreview as string}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in new tab
                  </a>
                )}
              </div>
            ) : (
              imagePreview && (
                <img
                  src={imagePreview as string}
                  alt="Team profile"
                  className="w-full h-full object-contain"
                  onLoad={() => setIsImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setIsImageLoading(false);
                  }}
                />
              )
            )}
          </div>

          {/* Footer with Open in new tab button - visible only on small screens */}
          <DialogFooter className="mt-4 sm:hidden">
            {imagePreview && (
              <a
                href={imagePreview as string}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4" />
                Open in new tab
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
