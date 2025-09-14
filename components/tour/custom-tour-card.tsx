"use client";

import React from "react";
import type { CardComponentProps } from "onborda";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useOnborda } from "onborda";

export const CustomTourCard: React.FC<CardComponentProps> = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}) => {
  const { closeOnborda } = useOnborda();
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <Card className="w-80 shadow-2xl border-2 border-primary/30 bg-white/95 backdrop-blur-sm relative z-[10001] max-w-sm md:w-80 w-72">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{step.icon}</span>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {step.title}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeOnborda}
            className="h-6 w-6 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700 leading-relaxed">{step.content}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">
              {currentStep + 1} of {totalSteps}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "bg-primary"
                      : index < currentStep
                      ? "bg-primary/70"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                className="h-8 px-3 text-xs"
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                Prev
              </Button>
            )}

            {isLastStep ? (
              <Button
                onClick={closeOnborda}
                size="sm"
                className="h-8 px-3 text-xs bg-primary hover:bg-primary/90"
              >
                Skip Tour
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                size="sm"
                className="h-8 px-3 text-xs bg-primary hover:bg-primary/90"
              >
                Next
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      {arrow}
    </Card>
  );
};
