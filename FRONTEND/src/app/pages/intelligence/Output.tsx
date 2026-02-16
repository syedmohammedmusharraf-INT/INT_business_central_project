import { useNavigate } from "react-router";
import React, { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import MainLayout from "@/app/components/MainLayout";
import PageHeader from "@/app/components/PageHeader";
import {
  Download,
  MoreHorizontal,
  Copy,
  FileText,
  Eye,
  Trash2,
  Calendar,
  User,
  ChevronDown,
  Loader2,
  Sparkles,
  Send,
  Edit3
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/app/components/ui/dialog";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "sonner";
import { API_BASE_URL } from "@/app/utils/api";



export default function Output() {
  const navigate = useNavigate();
  const [selectedPitch, setSelectedPitch] = useState<string | null>(null);
  const [expandedPitch, setExpandedPitch] = useState<string | null>(null);
  const [pitches, setPitches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(5);
  const [isRefining, setIsRefining] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pitchToRegenerate, setPitchToRegenerate] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchPitches = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/intelligence/pitches`);
        if (response.ok) {
          const data = await response.json();
          setPitches(data);
        }
      } catch (error) {
        console.error("Failed to fetch pitches:", error);
        toast.error("Failed to load pitch history");
      } finally {
        setLoading(false);
      }
    };
    fetchPitches();
  }, []);

  const handleViewPitch = (pitchId: string) => {
    setExpandedPitch(expandedPitch === pitchId ? null : pitchId);
  };

  const handleCopyPitch = (pitchId: string) => {
    const pitch = pitches.find((p) => p.id === pitchId);
    if (pitch) {
      const textArea = document.createElement("textarea");
      textArea.value = pitch.content || "";
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        textArea.remove();
        toast.success("Pitch copied to clipboard!");
      } catch (err) {
        textArea.remove();
        toast.error("Failed to copy to clipboard");
      }
    }
  };

  const handleExport = (pitchId: string, format: "pdf" | "word") => {
    toast.success(`Exporting pitch as ${format.toUpperCase()}...`);
  };

  const handleDeletePitch = (pitchId: string) => {
    toast.success("Pitch deleted successfully!");
  };

  const handleRegenerate = async () => {
    if (!pitchToRegenerate || !feedback.trim()) {
      toast.error("Please provide some feedback for regeneration");
      return;
    }

    setIsRefining(true);
    try {
      const response = await fetch(`${API_BASE_URL}/intelligence/regenerate-pitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitch_id: pitchToRegenerate,
          user_feedback: feedback
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Proposal regenerated to v${data.version}!`);
        setIsDialogOpen(false);
        setFeedback("");
        // Redirect to the result page of the new pitch
        navigate(`/intelligence/pitch-result/${data.id}`);
      } else {
        toast.error("Failed to regenerate proposal");
      }
    } catch (error) {
      console.error("Regeneration error:", error);
      toast.error("An error occurred during regeneration");
    } finally {
      setIsRefining(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Output"
        subtitle="View and manage all generated sales pitches"
      />

      <div className="p-8 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Pitches</p>
                <p className="text-xl font-bold text-gray-900">{pitches.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Active</p>
                <p className="text-xl font-bold text-gray-900">
                  {pitches.filter((p) => p.status === "Active").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Unique Leads</p>
                <p className="text-xl font-bold text-gray-900">
                  {new Set(pitches.map((p) => p.leadId)).size}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">This Month</p>
                <p className="text-xl font-bold text-gray-900">
                  {pitches.filter((p) =>
                    new Date(p.generatedDate).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pitch History List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Pitch History</h3>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => navigate("/leads/create")}
            >
              Create New Pitch
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : pitches.length === 0 ? (
            <Card className="p-12 text-center">
              {/* ... empty state ... */}
            </Card>
          ) : (
            <div className="space-y-3">
              {pitches.slice(0, displayCount).map((pitch) => (
                <Card key={pitch.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-base font-semibold text-gray-900">
                            {pitch.companyName}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {pitch.industry}
                          </Badge>
                          <Badge className={`${getStatusColor(pitch.status)} text-xs px-2 py-0.5`}>
                            {pitch.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            v{pitch.version}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(pitch.generatedDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            <span>{pitch.generatedBy}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            setPitchToRegenerate(pitch.id);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Regenerate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9"
                          onClick={() => handleViewPitch(pitch.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {expandedPitch === pitch.id ? "Hide" : "View"}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => {
                              setPitchToRegenerate(pitch.id);
                              setIsDialogOpen(true);
                            }}>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Regenerate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyPitch(pitch.id)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy to Clipboard
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(pitch.id, "pdf")}>
                              <FileText className="w-4 h-4 mr-2" />
                              Export as PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(pitch.id, "word")}>
                              <FileText className="w-4 h-4 mr-2" />
                              Export as Word
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeletePitch(pitch.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Pitch
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="pl-0">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {pitch.excerpt}
                      </p>
                    </div>

                    {/* Metadata Tags */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        {pitch.targetAudience}
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                        {pitch.tone}
                      </Badge>
                      <Badge variant="secondary" className="bg-green-50 text-green-700">
                        {pitch.length}
                      </Badge>
                      {Array.isArray(pitch.focusAreas) && pitch.focusAreas.map((area: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="bg-orange-50 text-orange-700">
                          {area}
                        </Badge>
                      ))}
                    </div>

                    {/* Services Used */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium">Services:</span>
                      <span>
                        {pitch.services && pitch.services.length > 0
                          ? pitch.services.join(", ")
                          : "No services selected"}
                      </span>
                    </div>

                    {/* Expanded Content */}
                    {expandedPitch === pitch.id && (
                      <div className="pt-4 border-t">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-gray-900 mb-3">Full Pitch Content</h5>
                          <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-mono">
                              {pitch.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              {pitches.length > displayCount && (
                <div className="pt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setDisplayCount(prev => prev + 5)}
                    className="gap-2"
                  >
                    Load More Pitches
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Regeneration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" />
              Regenerate with AI
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-gray-500">
              Provide instructions to modify the existing proposal. The AI will create a new version based on your feedback.
            </p>
            <Textarea
              placeholder="e.g., 'Make the executive summary shorter' or 'Add a section about our post-implementation support'"
              className="min-h-[120px] resize-none focus:ring-blue-500 text-sm"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isRefining}>
              Cancel
            </Button>
            <Button
              onClick={handleRegenerate}
              disabled={isRefining || !feedback.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
            >
              {isRefining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}