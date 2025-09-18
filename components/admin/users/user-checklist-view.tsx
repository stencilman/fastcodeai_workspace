"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Circle,
  Upload,
  Image,
  Loader2,
  ExternalLink,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FaLinkedin } from "react-icons/fa6";

interface UserChecklistViewProps {
  user: {
    id: string;
    linkedinProfile?: string;
    linkedinUpdated?: boolean;
    profilePictureUpdated?: boolean;
    teamBioProvided?: boolean;
    teamBio?: string;
    teamImageS3Key?: string;
    teamImageUrl?: string;
  };
}

export function UserChecklistView({ user }: UserChecklistViewProps) {
  const [teamImageUrl, setTeamImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Use the teamImageUrl from the API response if available, otherwise fetch it
  useEffect(() => {
    if (user.teamImageUrl) {
      setTeamImageUrl(user.teamImageUrl);
    } else if (user.teamImageS3Key) {
      setIsLoading(true);
      const fetchTeamImage = async () => {
        try {
          const response = await fetch(`/api/users/${user.id}/team-image`);
          if (response.ok) {
            const data = await response.json();
            setTeamImageUrl(data.url);
          }
        } catch (error) {
          console.error("Error fetching team image URL:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchTeamImage();
    }
  }, [user.id, user.teamImageS3Key, user.teamImageUrl]);

  // Use real data from the user object
  const checklistStatus = {
    linkedinUpdated: user.linkedinUpdated || false,
    profilePictureUpdated: user.profilePictureUpdated || false,
    // Consider the checklist item completed if either the flag is true OR if there's an image/bio
    teamBioProvided: user.teamBioProvided || !!user.teamBio || !!user.teamImageS3Key || false,
  };

  const teamBio = user.teamBio || "This user has not provided a team bio yet.";

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Onboarding Checklist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* LinkedIn Update Status */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 p-4 rounded-md bg-slate-50 border border-slate-100">
            {/* Status Icon - Centered at top on mobile */}
            <div className="flex justify-center sm:justify-start mb-2 sm:mb-0 sm:pt-0.5 sm:flex-shrink-0">
              {checklistStatus.linkedinUpdated ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300" />
              )}
            </div>
            <div className="flex-grow space-y-2 text-center sm:text-left">
              {/* Title with icon */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <div className="flex justify-center sm:justify-start">
                  <FaLinkedin className="h-5 w-5 text-[#0A66C2]" />
                </div>
                <h3 className="font-medium">LinkedIn Profile Update</h3>
              </div>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground">
                {checklistStatus.linkedinUpdated
                  ? "User has updated their LinkedIn profile to reflect their position at Fast Code AI"
                  : "User has not yet updated their LinkedIn profile"}
              </p>
              
              {/* Status Badge */}
              <div className="flex justify-center sm:justify-start">
                <Badge
                  className={
                    checklistStatus.linkedinUpdated
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-100"
                  }
                >
                  {checklistStatus.linkedinUpdated ? "Completed" : "Pending"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Profile Picture Status */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 p-4 rounded-md bg-slate-50 border border-slate-100">
            {/* Status Icon - Centered at top on mobile */}
            <div className="flex justify-center sm:justify-start mb-2 sm:mb-0 sm:pt-0.5 sm:flex-shrink-0">
              {checklistStatus.profilePictureUpdated ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300" />
              )}
            </div>
            <div className="flex-grow space-y-2 text-center sm:text-left">
              {/* Title with icon */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <div className="flex justify-center sm:justify-start">
                  <Image className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-medium">
                  Professional Profile Picture
                </h3>
              </div>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground">
                {checklistStatus.profilePictureUpdated
                  ? "User has set a professional profile picture on Gmail and Slack"
                  : "User has not yet set a professional profile picture"}
              </p>
              
              {/* Status Badge */}
              <div className="flex justify-center sm:justify-start">
                <Badge
                  className={
                    checklistStatus.profilePictureUpdated
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-100"
                  }
                >
                  {checklistStatus.profilePictureUpdated
                    ? "Completed"
                    : "Pending"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Team Bio Status */}
          <div className="p-4 rounded-md bg-slate-50 border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
              {/* Status Icon - Centered at top on mobile */}
              <div className="flex justify-center sm:justify-start mb-2 sm:mb-0 sm:pt-0.5 sm:flex-shrink-0">
                {checklistStatus.teamBioProvided ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-300" />
                )}
              </div>
              <div className="flex-grow space-y-2 text-center sm:text-left">
                {/* Title with icon */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <div className="flex justify-center sm:justify-start">
                    <Upload className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="font-medium">Team Page Bio</h3>
                </div>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground">
                  {checklistStatus.teamBioProvided
                    ? "User has provided a bio and image for the team page"
                    : "User has not yet provided a bio and image for the team page"}
                </p>
                
                {/* Status Badge */}
                <div className="flex justify-center sm:justify-start">
                  <Badge
                    className={
                      checklistStatus.teamBioProvided
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-100"
                    }
                  >
                    {checklistStatus.teamBioProvided ? "Completed" : "Pending"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Team Bio Content */}
            <div className="mt-4 border-t pt-4">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Team Image */}
                <div className="flex-shrink-0">
                  {isLoading ? (
                    <div className="w-24 h-24 rounded-md bg-slate-200 flex items-center justify-center border border-slate-300">
                      <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                    </div>
                  ) : teamImageUrl ? (
                    <div
                      className="w-24 h-24 rounded-md overflow-hidden border border-slate-200 relative group cursor-pointer"
                      onClick={() => setDialogOpen(true)}
                    >
                      <img
                        src={teamImageUrl}
                        alt="Team profile"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-md bg-slate-200 flex items-center justify-center border border-slate-300">
                      <Image className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Bio Text */}
                <div className="flex-grow max-w-full">
                  <h4 className="text-sm font-medium mb-2">Bio</h4>
                  <p className="text-sm break-words whitespace-normal overflow-wrap-anywhere w-full">
                    {teamBio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] max-w-full">
          <DialogHeader>
            <DialogTitle className="pr-8">
              Team Profile Image
              <div className="hidden sm:block mt-2 sm:mt-0">
                {teamImageUrl && (
                  <a
                    href={teamImageUrl}
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
            {isLoading && (
              <div className="absolute inset-0 flex justify-center items-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {imageError ? (
              <div className="flex flex-col items-center justify-center h-full bg-slate-50">
                <p className="mb-4 text-red-600">
                  Unable to load image preview.
                </p>
                {teamImageUrl && (
                  <a
                    href={teamImageUrl}
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
              teamImageUrl && (
                <img
                  src={teamImageUrl}
                  alt="Team profile"
                  className="w-full h-full object-contain"
                  onError={() => setImageError(true)}
                />
              )
            )}
          </div>
          
          {/* Footer with Open in new tab button - visible only on small screens */}
          <DialogFooter className="mt-4 sm:hidden">
            {teamImageUrl && (
              <a
                href={teamImageUrl}
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
    </Card>
  );
}
