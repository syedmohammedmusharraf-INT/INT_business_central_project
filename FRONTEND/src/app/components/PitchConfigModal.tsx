import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Card } from "@/app/components/ui/card";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { mockServices } from "@/data/mockData";

interface PitchConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string | undefined;
  selectedServices: string[];
  onPitchGenerated: (pitchId: string) => void;
}

export default function PitchConfigModal({
  isOpen,
  onClose,
  leadId,
  selectedServices,
  onPitchGenerated,
}: PitchConfigModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState({
    audience: "c-level",
    tone: "professional",
    length: "detailed",
    focusAreas: ["roi"] as string[],
  });

  const handleFocusAreaToggle = (area: string) => {
    setConfig((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const handleGeneratePitch = async () => {
    if (config.focusAreas.length === 0) {
      toast.error("Please select at least one focus area");
      return;
    }

    setIsGenerating(true);

    try {
      const baseUrl = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/intelligence/generate-pitch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lead_id: leadId,
          selected_services: selectedServices,
          config: config,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate pitch");
      }

      const result = await response.json();

      toast.success("Sales pitch generated successfully!");

      setTimeout(() => {
        setIsGenerating(false);
        onClose();
        onPitchGenerated(result.id);
      }, 1000);

    } catch (error) {
      console.error("Error generating pitch:", error);
      toast.error("Failed to generate pitch. Please try again.");
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Configure Sales Pitch</DialogTitle>
          <DialogDescription className="text-sm">
            Customize the pitch generation parameters to create a targeted sales pitch
          </DialogDescription>
        </DialogHeader>

        {isGenerating ? (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <div className="space-y-2">
              <p className="font-semibold text-gray-900">Generating Your Sales Pitch...</p>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Analyzing selected services</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Crafting value propositions</span>
                </div>
                <div className="flex items-center justify-center gap-2 opacity-50">
                  <span>Personalizing content</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Target Audience */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">Target Audience</Label>
              <p className="text-xs text-gray-500">Who will be reading this pitch?</p>
              <RadioGroup
                value={config.audience}
                onValueChange={(value) =>
                  setConfig((prev) => ({ ...prev, audience: value }))
                }
                className="gap-3"
              >
                <Card
                  className={`p-4 cursor-pointer transition-all ${config.audience === "c-level"
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                    }`}
                  onClick={() => setConfig((prev) => ({ ...prev, audience: "c-level" }))}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="c-level" id="c-level" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="c-level" className="font-medium text-gray-900 cursor-pointer">
                        C-Level Executives
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        CEO, CTO, CFO - Focus on strategic value and ROI
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer transition-all ${config.audience === "technical"
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                    }`}
                  onClick={() => setConfig((prev) => ({ ...prev, audience: "technical" }))}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="technical" id="technical" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="technical" className="font-medium text-gray-900 cursor-pointer">
                        Technical Decision Makers
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        VP Engineering, Tech Lead - Emphasize technical architecture
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer transition-all ${config.audience === "business"
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                    }`}
                  onClick={() => setConfig((prev) => ({ ...prev, audience: "business" }))}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="business" id="business" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="business" className="font-medium text-gray-900 cursor-pointer">
                        Business Stakeholders
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Product Managers, Business Analysts - Balance business and technical aspects
                      </p>
                    </div>
                  </div>
                </Card>
              </RadioGroup>
            </div>

            {/* Tone */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">Tone of Pitch</Label>
              <p className="text-xs text-gray-500">How should the pitch sound?</p>
              <RadioGroup
                value={config.tone}
                onValueChange={(value) =>
                  setConfig((prev) => ({ ...prev, tone: value }))
                }
                className="gap-3"
              >
                <Card
                  className={`p-4 cursor-pointer transition-all ${config.tone === "professional"
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                    }`}
                  onClick={() => setConfig((prev) => ({ ...prev, tone: "professional" }))}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="professional" id="professional" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="professional" className="font-medium text-gray-900 cursor-pointer">
                        Professional & Value-Focused
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Direct, confident, emphasizing business value
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer transition-all ${config.tone === "consultative"
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                    }`}
                  onClick={() => setConfig((prev) => ({ ...prev, tone: "consultative" }))}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="consultative" id="consultative" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="consultative" className="font-medium text-gray-900 cursor-pointer">
                        Consultative & Advisory
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Collaborative, problem-solving approach
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer transition-all ${config.tone === "technical"
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                    }`}
                  onClick={() => setConfig((prev) => ({ ...prev, tone: "technical" }))}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="technical" id="technical-tone" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="technical-tone" className="font-medium text-gray-900 cursor-pointer">
                        Technical & Detailed
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        In-depth technical specifications and architecture
                      </p>
                    </div>
                  </div>
                </Card>
              </RadioGroup>
            </div>

            {/* Length */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">Pitch Length</Label>
              <p className="text-xs text-gray-500">How detailed should the pitch be?</p>
              <RadioGroup
                value={config.length}
                onValueChange={(value) =>
                  setConfig((prev) => ({ ...prev, length: value }))
                }
                className="gap-3"
              >
                <div className="grid grid-cols-3 gap-3">
                  <Card
                    className={`p-4 cursor-pointer transition-all ${config.length === "brief"
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                      }`}
                    onClick={() => setConfig((prev) => ({ ...prev, length: "brief" }))}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <RadioGroupItem value="brief" id="brief" />
                      <div>
                        <Label htmlFor="brief" className="font-medium text-gray-900 cursor-pointer block">
                          Brief
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          200-300 words
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Quick intro email
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card
                    className={`p-4 cursor-pointer transition-all ${config.length === "standard"
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                      }`}
                    onClick={() => setConfig((prev) => ({ ...prev, length: "standard" }))}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <div>
                        <Label htmlFor="standard" className="font-medium text-gray-900 cursor-pointer block">
                          Standard
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          300-500 words
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Balanced overview
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card
                    className={`p-4 cursor-pointer transition-all ${config.length === "detailed"
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                      }`}
                    onClick={() => setConfig((prev) => ({ ...prev, length: "detailed" }))}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <RadioGroupItem value="detailed" id="detailed" />
                      <div>
                        <Label htmlFor="detailed" className="font-medium text-gray-900 cursor-pointer block">
                          Detailed
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          500+ words
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Comprehensive
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </RadioGroup>
            </div>

            {/* Focus Areas */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">Focus Areas</Label>
              <p className="text-xs text-gray-500">Select one or more areas to emphasize (required)</p>
              <div className="space-y-3">
                <Card
                  className={`p-4 cursor-pointer transition-all ${config.focusAreas.includes("roi")
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                    }`}
                  onClick={() => handleFocusAreaToggle("roi")}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="roi"
                      checked={config.focusAreas.includes("roi")}
                      onCheckedChange={() => handleFocusAreaToggle("roi")}
                      className="mt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <Label htmlFor="roi" className="font-medium text-gray-900 cursor-pointer">
                        ROI & Business Value
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Emphasize cost savings, revenue impact, and financial benefits
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer transition-all ${config.focusAreas.includes("technical")
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                    }`}
                  onClick={() => handleFocusAreaToggle("technical")}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="technical"
                      checked={config.focusAreas.includes("technical")}
                      onCheckedChange={() => handleFocusAreaToggle("technical")}
                      className="mt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <Label htmlFor="technical" className="font-medium text-gray-900 cursor-pointer">
                        Technical Excellence
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Highlight architecture, implementation quality, and best practices
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer transition-all ${config.focusAreas.includes("timeline")
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                    }`}
                  onClick={() => handleFocusAreaToggle("timeline")}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="timeline"
                      checked={config.focusAreas.includes("timeline")}
                      onCheckedChange={() => handleFocusAreaToggle("timeline")}
                      className="mt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <Label htmlFor="timeline" className="font-medium text-gray-900 cursor-pointer">
                        Timeline & Delivery
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Focus on implementation speed, milestones, and quick wins
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="h-10">
                Cancel
              </Button>
              <Button onClick={handleGeneratePitch} className="h-10 gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Pitch
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}