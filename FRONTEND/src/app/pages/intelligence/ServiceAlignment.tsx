import { useNavigate, useParams, useLocation } from "react-router"; // Added useLocation
import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import MainLayout from "@/app/components/MainLayout";
import PageHeader from "@/app/components/PageHeader";
import PitchConfigModal from "@/app/components/PitchConfigModal";
import {
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Edit,
  FileText,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Copy,
  Check,
  Download,
  ChevronDown,
  RefreshCw,
  Loader2,
  Globe,
  AlertCircle,
  Filter,
  ArrowUpDown,
  X,
  ChevronUp,
  Building2,
  Briefcase,
  User,
  AlertTriangle,
  RotateCcw,
  Info,
  ExternalLink,
} from "lucide-react";
import { mockLeads } from "@/data/mockData";
import { toast } from "sonner";
import { API_BASE_URL } from "@/app/utils/api";

export default function ServiceAlignment() {
  const navigate = useNavigate();
  const { leadId } = useParams<{ leadId: string }>();
  const location = useLocation(); // Access state passed from CreateLead

  // 1. STATE MANAGEMENT
  const [services, setServices] = useState<any[]>([]);
  const [currentLead, setCurrentLead] = useState<any>(null); // Replaces computed 'lead'
  const [loading, setLoading] = useState(true);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState<string | null>(null);
  const [pitchVersion, setPitchVersion] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const [reworkPrompt, setReworkPrompt] = useState("");
  const [sortBy, setSortBy] = useState<"match" | "confidence">("match");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showLowMatch, setShowLowMatch] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!leadId) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        console.log("ServiceAlignment: Initializing for leadId:", leadId);
        let leadData = null;

        // A. Resolve Lead Data
        try {
          const leadRes = await fetch(`${API_BASE_URL}/leads/${leadId}`);
          if (leadRes.ok) {
            leadData = await leadRes.json();
          }
        } catch (e) {
          console.error("Failed to fetch lead metadata", e);
        }

        setCurrentLead(leadData);

        // B. Resolve Service Data
        const normalize = (data: any) => {
          return data.map((item: any, index: number) => {
            return {
              id: String(index),
              name: item.service,
              category: "AI Recommended",
              reasoning: item.reasoning || "Not specified",
              relevantExperience: item.relevant_experience || [],
              keyFeatures: item.key_features || [],
              serviceFigures: item.service_figures || "",
              matchScore: item.cosine_similarity || item.score || 0,
              confidence: (item.cosine_similarity || item.score || 0) >= 80 ? "high" : (item.cosine_similarity || item.score || 0) >= 60 ? "medium" : "low",
              timeline: "4-6 months",
              investment: "$200K-$500K",
              caseStudies: item.relevant_experience || []
            };
          });
        };

        // Prefer stored results, otherwise fetch alignment
        if (leadData?.matched_services && leadData.matched_services.length > 0) {
          console.log("Using stored alignment results from database");
          setServices(normalize(leadData.matched_services));
          setLoading(false);
        } else if (location.state?.initialData) {
          setServices(normalize(location.state.initialData));
          setLoading(false);
        } else {
          const servicesRes = await fetch(`${API_BASE_URL}/intelligence/service-alignment/${leadId || ""}`);
          if (!servicesRes.ok) throw new Error("Failed to fetch service alignment");
          const data = await servicesRes.json();
          setServices(normalize(data));
          setLoading(false);
        }

        // C. Trigger LinkedIn Validation Independently (Asynchronous background)
        const triggerValidation = async () => {
          setLinkedinLoading(true);
          try {
            console.log("Triggering LinkedIn validation for lead:", leadId);
            const valRes = await fetch(`${API_BASE_URL}/intelligence/validate-profile/${leadId}`);
            const profileData = await valRes.json();

            if (profileData && profileData.status === "completed") {
              setCurrentLead((prev: any) => ({
                ...prev,
                profileScore: profileData.profile_score,
                finalScore: profileData.final_score,
                qualificationDecision: profileData.qualification_decision,
                profileValidation: profileData.profile_validation,
                validationStatus: "completed"
              }));
              toast.success("LinkedIn profile validation complete!");
            } else if (profileData && (profileData.status === "failed" || profileData.status === "error")) {
              setCurrentLead((prev: any) => ({
                ...prev,
                validationStatus: "failed",
                lastError: profileData.reason || profileData.message || "Unknown error"
              }));
              toast.error(`LinkedIn validation failed: ${profileData.reason || "Unknown error"}`);
            } else if (profileData && profileData.status === "skipped") {
              setCurrentLead((prev: any) => ({
                ...prev,
                validationStatus: "skipped"
              }));
            }
          } catch (err) {
            console.error("LinkedIn background task failed:", err);
            setCurrentLead((prev: any) => ({ ...prev, validationStatus: "failed" }));
          } finally {
            setLinkedinLoading(false);
          }
        };

        const currentValidationStatus = leadData?.validation_status || leadData?.validationStatus;

        if (currentValidationStatus === "completed") {
          // Already done, no need to trigger again
          console.log("LinkedIn validation already completed.");
        } else if (currentValidationStatus === "processing") {
          console.log("LinkedIn validation already processing, waiting for result...");
          triggerValidation();
        } else if (!currentValidationStatus || currentValidationStatus === "pending") {
          triggerValidation();
        }

      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    init();
  }, [leadId, location.state]);

  const handleRetryValidation = async () => {
    setLinkedinLoading(true);
    toast.info("Retrying LinkedIn validation...");
    try {
      const valRes = await fetch(`${API_BASE_URL}/intelligence/validate-profile/${leadId}`);
      const profileData = await valRes.json();

      if (profileData && profileData.status === "completed") {
        setCurrentLead((prev: any) => ({
          ...prev,
          profileScore: profileData.profile_score,
          finalScore: profileData.final_score,
          qualificationDecision: profileData.qualification_decision,
          profileValidation: profileData.profile_validation,
          validationStatus: "completed"
        }));
        toast.success("LinkedIn profile validation complete!");
      } else {
        setCurrentLead((prev: any) => ({
          ...prev,
          validationStatus: profileData.status || "failed",
          lastError: profileData.reason
        }));
        toast.error(`Retry failed: ${profileData.reason || "Unknown error"}`);
      }
    } catch (err) {
      toast.error("Failed to re-trigger validation");
      setCurrentLead((prev: any) => ({ ...prev, validationStatus: "failed" }));
    } finally {
      setLinkedinLoading(false);
    }
  };

  const lead = currentLead; // Use state variable for rendering

  // Derive unique categories from fetched services
  const serviceCategories = Array.from(
    new Set(services.map((s) => s.category))
  );

  const filteredServices = services
    .sort((a, b) => {
      if (sortBy === "match") {
        return b.matchScore - a.matchScore;
      } else {
        const confidenceOrder: any = { high: 3, medium: 2, low: 1 };
        return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
      }
    });

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleCardClick = (serviceId: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button[role="checkbox"]')) return;
    handleServiceToggle(serviceId);
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((id) => id !== serviceId));
  };

  const handleReworkPitch = async () => {
    if (!reworkPrompt.trim()) {
      toast.error("Please provide instructions for reworking the pitch");
      return;
    }

    toast.info("Regenerating pitch based on your feedback...");
    setIsReworkModalOpen(false);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const selectedServiceNames = services
      .filter((s) => selectedServices.includes(s.id))
      .map((s) => s.name);

    const reworkedPitch = `Dear [Decision Maker Name],

I hope this message finds you well. ${reworkPrompt}

**Why This Matters to You**

Based on our understanding of your current infrastructure challenges and growth objectives, we've identified key opportunities where our services can deliver immediate value:

${selectedServiceNames
        .map(
          (serviceName, idx) => `
**${idx + 1}. ${serviceName}**
Our comprehensive approach has helped companies in the ${lead?.industry} industry achieve:
• 50% cost reduction in infrastructure spend
• 40% improvement in system performance 
• Industry compliance out-of-the-box
• Seamless digital transformation
`
        )
        .join("\n")}

**ROI Projection**
• Timeline: 4-6 months
• Expected Annual Savings: $800K+
• Payback Period: <12 months

Best regards,
Sarah Johnson`;

    setGeneratedPitch(reworkedPitch);
    setPitchVersion((prev) => prev + 1);
    setReworkPrompt("");
    toast.success("Pitch regenerated successfully!");
  };

  const handleCopy = () => {
    if (generatedPitch) {
      navigator.clipboard.writeText(generatedPitch);
      setIsCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };


  return (
    <MainLayout>
      <PageHeader
        title="Service Alignment"
        subtitle="AI-powered service recommendations"
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-500">Analyze lead...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
              Error: {error}
            </div>
          )}

          {!loading && (!leadId || !lead) && !error && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="max-w-2xl w-full p-12 text-center border-0 shadow-sm bg-white/50 backdrop-blur-md">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-[#0f172a] mb-4">Select a Lead to Begin</h2>
                <p className="text-gray-500 text-lg mb-10 leading-relaxed max-w-lg mx-auto">
                  Choose a lead from your repository to view AI-powered service recommendations and generate targeted sales pitches.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/leads")} // Verified route to Lead Repository
                    className="px-8 h-12 font-bold text-gray-700 border-gray-200 hover:bg-gray-50 transition-all rounded-xl"
                  >
                    Browse Leads
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => navigate("/leads/create")} // Verified route to Create Lead
                    className="px-8 h-12 font-bold bg-[#0f172a] hover:bg-black text-white transition-all rounded-xl shadow-lg hover:shadow-xl"
                  >
                    Create New Lead
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {!loading && currentLead && (
            <>
              {/* Lead Summary Card */}
              <Card className="p-6 border-0 shadow-sm bg-white">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {currentLead.companyName}
                      </h3>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                        {currentLead.industry}
                      </Badge>
                      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                        Alignment: {currentLead.score || 0}%
                      </Badge>
                      {currentLead.profileScore > 0 && (
                        <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                          LinkedIn: {currentLead.profileScore}%
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-gray-900 border-gray-900 bg-gray-50 border-2 font-bold">
                        Final Score: {currentLead.finalScore || currentLead.score}%
                      </Badge>
                      {(() => {
                        const score = currentLead.finalScore || currentLead.score || 0;
                        const decision = currentLead.qualificationDecision || (score >= 70 ? "Proceed" : "Hold");
                        return (
                          <Badge className={`${decision === "Proceed" ? "bg-green-600" : "bg-red-600"} text-white border-0`}>
                            Decision: {decision}
                          </Badge>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Submitted on {new Date(currentLead.createdAt).toLocaleDateString()} at {new Date(currentLead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate("/leads/create")}>
                    <Edit className="w-4 h-4 mr-2" /> Edit Lead
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-y-6 gap-x-12 mb-8">
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{currentLead.website || "example.com"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{currentLead.industry}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{currentLead.companySize || "Enterprise (1000+)"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{currentLead.budget || "$250K-$500K"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{currentLead.timeline || "Short-term (1-3 months)"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Owner: Sarah Johnson</span>
                  </div>
                </div>

                {/* Pain Points Alert */}
                <div className="flex gap-3 p-4 bg-orange-50 border border-orange-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-orange-900 mb-1">Pain Points & Requirements</h4>
                    <p className="text-sm text-orange-800 leading-relaxed">
                      {currentLead.painPoints || "Legacy system modernization, security concerns, and scalability issues."}
                    </p>
                  </div>
                </div>
              </Card>

              {/* NEW: Lead Profile Validation Summary */}
              {linkedinLoading && (
                <Card className="p-6 border-0 shadow-sm bg-purple-50/50 border-l-4 border-l-purple-500 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-900">Validating LinkedIn Profile...</h3>
                      <p className="text-sm text-purple-700">This may take a minute but won't block your results</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="h-20 bg-white/50 rounded-xl" />
                    <div className="h-20 bg-white/50 rounded-xl" />
                    <div className="h-20 bg-white/50 rounded-xl" />
                  </div>
                  <div className="h-12 bg-white/30 rounded-xl" />
                </Card>
              )}

              {!linkedinLoading && currentLead.validationStatus === "failed" && (
                <Card className="p-6 border-0 shadow-sm bg-red-50/50 border-l-4 border-l-red-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-red-900">LinkedIn Extraction Failed</h3>
                        <p className="text-sm text-red-700">The agent couldn't verify this profile automatically.</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetryValidation}
                      className="border-red-200 text-red-700 hover:bg-red-100"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" /> Retry Validation
                    </Button>
                  </div>
                  {currentLead.lastError && (
                    <p className="mt-3 text-xs text-red-500 bg-white/50 p-2 rounded border border-red-100">
                      Reason: {currentLead.lastError}
                    </p>
                  )}
                </Card>
              )}

              {!linkedinLoading && currentLead.validationStatus === "skipped" && !currentLead.profileValidation && (
                <Card className="p-6 border-0 shadow-sm bg-gray-50 border-l-4 border-l-gray-400">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Info className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-700">Profile Validation Unavailable</h3>
                      <p className="text-sm text-gray-500">No LinkedIn URL provided for the primary contact.</p>
                    </div>
                  </div>
                </Card>
              )}

              {!linkedinLoading && currentLead.profileValidation && (
                <Card className="p-6 border-0 shadow-sm bg-purple-50/50 border-l-4 border-l-purple-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-900">LinkedIn Profile Validation</h3>
                      <p className="text-sm text-purple-700">Verified identity and relevance of the primary contact</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Company Match</p>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-purple-600">{currentLead.profileValidation.company_match_score}%</span>
                        <div className="h-1.5 flex-1 bg-gray-100 rounded-full mb-2 overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${currentLead.profileValidation.company_match_score}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Designation</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-purple-600">{currentLead.profileValidation.designation_score}%</span>
                        <Badge variant="outline" className="text-[10px] bg-purple-50 border-purple-200 truncate">
                          {currentLead.profileValidation.designation}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Content Relevance</p>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-purple-600">{currentLead.profileValidation.content_relevance_score}%</span>
                        <div className="h-1.5 flex-1 bg-gray-100 rounded-full mb-2 overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${currentLead.profileValidation.content_relevance_score}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 ring-2 ring-purple-500/20">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Profile Score</p>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-purple-900">{currentLead.profileValidation.total_profile_score}%</span>
                        <div className="h-1.5 flex-1 bg-gray-200 rounded-full mb-2 overflow-hidden">
                          <div className="h-full bg-purple-600" style={{ width: `${currentLead.profileValidation.total_profile_score}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 p-4 rounded-xl border border-purple-100 italic">
                    <div className="flex gap-2 text-purple-900">
                      <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed">
                        {currentLead.profileValidation.reasoning}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* AI Insight Banner */}
              {!loading && !error && (
                <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">AI Analysis Complete</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Based on the lead's requirements and our service portfolio, we've identified <span className="font-semibold">{filteredServices.length} relevant services</span> with high match potential. Select the services you want to include in your pitch.
                    </p>
                  </div>
                </div>
              )}

              {/* Controls */}
              {!loading && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-9 border-gray-200">
                      <ArrowUpDown className="w-4 h-4 mr-2 text-gray-500" />
                      Sort by Match Score
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 border-gray-200">
                      <Filter className="w-4 h-4 mr-2 text-gray-500" />
                      All Categories
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowLowMatch(!showLowMatch)} className="text-gray-500">
                    {showLowMatch ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                    {showLowMatch ? "Hide" : "Show"} Low Match Services
                  </Button>
                </div>
              )}

              {/* Floating Selection Bar */}
              {selectedServices.length > 0 && !isPitchModalOpen && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-4xl px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="bg-white/70 backdrop-blur-xl border border-blue-100/50 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl p-4 flex items-center justify-between ring-1 ring-black/5">
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#2563EB] flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Selected Services ({selectedServices.length})
                        </span>
                        <button
                          onClick={() => setSelectedServices([])}
                          className="text-[11px] font-black text-[#ef4444] hover:text-red-700 transition-colors uppercase tracking-widest"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto px-1 custom-scrollbar">
                        {selectedServices.map(id => {
                          const service = services.find(s => s.id === id);
                          return (
                            <div key={id} className="group flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm hover:shadow-md transition-all border border-blue-500/20">
                              <span className="max-w-[150px] truncate">{service?.name}</span>
                              <button onClick={() => handleRemoveService(id)} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="ml-6 flex items-center gap-1 pl-6 border-l border-gray-100">
                      <Button
                        size="lg"
                        onClick={() => setIsPitchModalOpen(true)}
                        className="bg-[#2563EB] hover:bg-blue-700 text-white font-black px-8 h-12 rounded-2xl text-[13px] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_10px_20px_rgba(37,99,235,0.3)] flex items-center gap-2 group"
                      >
                        <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Generate Pitch
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Cards */}
              <div className="space-y-6">
                {filteredServices.map((service, index) => {
                  const isSelected = selectedServices.includes(service.id);
                  const isBestMatch = index === 0 && service.matchScore > 90;

                  return (
                    <Card
                      key={service.id}
                      className={`relative overflow-hidden transition-all duration-200 border-0 shadow-sm hover:shadow-md ${isSelected ? "ring-2 ring-blue-500" : ""
                        }`}
                      onClick={(e: React.MouseEvent) => handleCardClick(service.id, e)}
                    >
                      {/* Top Stripe for Best Match */}
                      {isBestMatch && (
                        <div className="absolute top-0 left-0 w-1 bg-blue-600 h-full" />
                      )}

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleServiceToggle(service.id)}
                              className="mt-1"
                            />
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-lg font-bold text-gray-900">{service.name}</h4>
                                {isBestMatch && (
                                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-0 gap-1 px-2">
                                    <Sparkles className="w-3 h-3 fill-current" /> Best Match
                                  </Badge>
                                )}
                                <Badge variant="secondary" className={`${getConfidenceBadge(service.confidence)} border-0`}>
                                  {service.confidence} Confidence
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">{service.category}</p>
                            </div>
                          </div>

                          {/* Ring Score */}
                          <div className="flex flex-col items-center">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                  className="text-gray-100"
                                />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                  strokeDasharray={175}
                                  strokeDashoffset={175 - (175 * service.matchScore) / 100}
                                  className={`text-gray-900 transition-all duration-1000 ease-out`}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute text-sm font-bold text-gray-900">{service.matchScore}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Why this matches section */}
                        <div className="mb-6 bg-gray-50/50 rounded-lg p-5 border border-gray-100/50">
                          <div className="flex gap-2 mb-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                            <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">Why this matches</span>
                          </div>
                          <p className="text-[15px] text-gray-600 leading-relaxed pl-7 whitespace-pre-wrap">
                            {service.reasoning}
                          </p>
                        </div>

                        {/* Features Grid and figures */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 mb-6 pl-7">
                          {service.keyFeatures.map((feature: string, i: number) => (
                            <div key={i} className="flex items-start gap-3">
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-sm font-medium text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Highlighted Service Figures below grid */}
                        {service.serviceFigures && (
                          <div className="flex items-start gap-3 mb-8 pl-7">
                            <TrendingUp className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <span className="text-[14px] font-extrabold text-[#2563EB] leading-tight">
                              {service.serviceFigures}
                            </span>
                          </div>
                        )}

                        {/* Relevant Experience Box */}
                        <div className="bg-[#fdfaff] rounded-xl p-5 border border-purple-100/60 mb-6 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <Briefcase className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-bold text-purple-800 uppercase tracking-tight">Relevant INT Experience</span>
                          </div>
                          <div className="space-y-3 pl-7">
                            {service.relevantExperience.map((study: any, i: number) => (
                              <div key={i} className="text-[15px]">
                                <span className="font-bold text-purple-950">{study.client}: </span>
                                <span className="text-purple-800/90 leading-relaxed">{study.outcome}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-8 pt-5 border-t border-gray-100 pl-7">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{service.timeline}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span>{service.investment}</span>
                          </div>
                        </div>

                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )
          }
        </div >
      </div >

      <PitchConfigModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
        leadId={leadId}
        selectedServices={selectedServices}
        onPitchGenerated={(pitchId: string) => {
          setIsPitchModalOpen(false);
          navigate(`/intelligence/pitch-result/${pitchId}`);
        }}
      />
    </MainLayout >
  );
}