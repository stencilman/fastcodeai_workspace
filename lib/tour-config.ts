import { Step } from "onborda";

interface Tour {
  tour: string;
  steps: Step[];
}

// Desktop tour configuration
export const userOnboardingTourDesktop: Tour[] = [
  {
    tour: "userOnboardingDesktop",
    steps: [
      {
        icon: "📄",
        title: "Upload Documents",
        content:
          "Start by uploading your required documents. Click the 'Upload Documents' button to begin the document submission process.",
        selector: "#upload-documents-button",
        side: "top-right",
        pointerPadding: 12,
        pointerRadius: 12,
      },
      {
        icon: "📋",
        title: "Required Documents",
        content:
          "Here you can see all the documents you need to upload. Each document type is required for your onboarding process.",
        selector: "#required-documents-section",
        side: "top-left",
        pointerPadding: 12,
        pointerRadius: 12,
      },
      {
        icon: "📘",
        title: "User Guide",
        content:
          "Check out the General Guidelines to learn about company policies, communication guidelines, and office entry procedures.",
        selector: "#user-guide-button",
        side: "bottom-left",
        pointerPadding: 12,
        pointerRadius: 12,
      },
    ],
  },
];

// Mobile tour configuration
export const userOnboardingTourMobile: Tour[] = [
  {
    tour: "userOnboardingMobile",
    steps: [
      {
        icon: "📄",
        title: "Upload Documents",
        content:
          "Start by uploading your required documents. Click the 'Upload Documents' button to begin the document submission process.",
        selector: "#upload-documents-button",
        side: "top-right",
        pointerPadding: 12,
        pointerRadius: 12,
      },
      {
        icon: "📋",
        title: "Required Documents",
        content:
          "Here you can see all the documents you need to upload. Each document type is required for your onboarding process.",
        selector: "#required-documents-section",
        side: "top-left",
        pointerPadding: 12,
        pointerRadius: 12,
      },
      {
        icon: "📘",
        title: "User Guide",
        content:
          "Check out the General Guidelines to learn about company policies, communication guidelines, and office entry procedures.",
        selector: "#user-guide-button",
        side: "bottom-left",
        pointerPadding: 12,
        pointerRadius: 12,
      },
    ],
  },
];

// Default tour (will be determined dynamically)
export const userOnboardingTour: Tour[] = userOnboardingTourDesktop;

export const documentUploadTour: Tour[] = [
  {
    tour: "documentUpload",
    steps: [
      {
        icon: "📁",
        title: "Document Types",
        content:
          "Select the type of document you want to upload from the dropdown menu.",
        selector: "#document-type-selector",
        side: "bottom",
        pointerPadding: 12,
        pointerRadius: 12,
      },
      {
        icon: "📤",
        title: "Upload Area",
        content:
          "Drag and drop your files here or click to browse and select files from your computer.",
        selector: "#file-upload-area",
        side: "top",
        pointerPadding: 12,
        pointerRadius: 12,
      },
      {
        icon: "✅",
        title: "Submit Document",
        content:
          "Once you've selected your file, click 'Upload Document' to submit it for review.",
        selector: "#upload-submit-button",
        side: "top",
        pointerPadding: 12,
        pointerRadius: 12,
      },
    ],
  },
];
