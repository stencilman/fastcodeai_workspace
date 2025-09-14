import React from "react";
import { Loader2, Loader } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { cva, type VariantProps } from "class-variance-authority";

const loadingVariants = cva("animate-spin text-muted-foreground inline-block", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
    variant: {
      default: "",
      primary: "text-primary",
      secondary: "text-secondary",
      success: "text-green-600",
      warning: "text-amber-600",
      danger: "text-red-600",
      white: "text-white",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  text?: string;
  textPlacement?: "left" | "right" | "top" | "bottom";
  fullPage?: boolean;
  icon?: "circle" | "spinner";
  textClassName?: string;
}

export function Loading({
  size,
  variant,
  text,
  textPlacement = "right",
  fullPage = false,
  icon = "spinner",
  className,
  textClassName,
  ...props
}: LoadingProps) {
  const LoadingIcon = icon === "spinner" ? Loader2 : Loader;

  const loadingContent = (
    <>
      <LoadingIcon className={cn(loadingVariants({ size, variant }))} />
      {text && (
        <span
          className={cn(
            {
              "ml-2": textPlacement === "right",
              "mr-2": textPlacement === "left",
              "mt-2": textPlacement === "bottom",
              "mb-2": textPlacement === "top",
            },
            textClassName
          )}
        >
          {text}
        </span>
      )}
    </>
  );

  if (fullPage) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
        {...props}
      >
        <div
          className={cn(
            "flex flex-col items-center justify-center p-4",
            {
              "flex-row": textPlacement === "right" || textPlacement === "left",
              "flex-col": textPlacement === "top" || textPlacement === "bottom",
              "flex-col-reverse": textPlacement === "top",
              "flex-row-reverse": textPlacement === "left",
            },
            className
          )}
        >
          {loadingContent}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        {
          "flex-row": textPlacement === "right" || textPlacement === "left",
          "flex-col": textPlacement === "top" || textPlacement === "bottom",
          "flex-col-reverse": textPlacement === "top",
          "flex-row-reverse": textPlacement === "left",
        },
        className
      )}
      {...props}
    >
      {loadingContent}
    </div>
  );
}
