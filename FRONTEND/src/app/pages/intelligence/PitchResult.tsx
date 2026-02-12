import { useNavigate, useParams } from "react-router";
import React, { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import MainLayout from "@/app/components/MainLayout";
import PageHeader from "@/app/components/PageHeader";
import {
    Download,
    Copy,
    FileText,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    Calendar,
    User,
    ExternalLink
} from "lucide-react";
import { toast } from "sonner";

export default function PitchResult() {
    const { pitchId } = useParams();
    const navigate = useNavigate();
    const [pitch, setPitch] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPitch = async () => {
            try {
                const baseUrl = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:8000";
                const response = await fetch(`${baseUrl}/intelligence/pitches/${pitchId}`);
                if (response.ok) {
                    const data = await response.json();
                    setPitch(data);
                } else {
                    toast.error("Failed to load pitch details");
                    navigate("/intelligence/output");
                }
            } catch (error) {
                console.error("Failed to fetch pitch:", error);
                toast.error("An error occurred while loading the pitch");
            } finally {
                setLoading(false);
            }
        };

        if (pitchId) {
            fetchPitch();
        }
    }, [pitchId, navigate]);

    const handleCopyPitch = () => {
        if (pitch?.content) {
            const textArea = document.createElement("textarea");
            textArea.value = pitch.content;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                textArea.remove();
                toast.success("Proposal copied to clipboard!");
            } catch (err) {
                textArea.remove();
                toast.error("Failed to copy to clipboard");
            }
        }
    };

    const handleExport = (format: "pdf" | "word") => {
        toast.success(`Exporting as ${format.toUpperCase()}...`);
        // Export logic placeholder
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <p className="text-gray-500 font-medium">Retrieving your enterprise proposal...</p>
                </div>
            </MainLayout>
        );
    }

    if (!pitch) return null;

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto">
                <div className="p-8 space-y-8">
                    {/* Top Actions */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/intelligence/output")}
                            className="hover:bg-blue-50 text-gray-600 h-10"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to History
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={handleCopyPitch} className="h-10">
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Text
                            </Button>
                            <Button onClick={() => handleExport("pdf")} className="h-10 bg-blue-600 hover:bg-blue-700">
                                <Download className="w-4 h-4 mr-2" />
                                Export as PDF
                            </Button>
                        </div>
                    </div>

                    {/* Success Banner */}
                    <div className="bg-green-50 border border-green-100 rounded-xl p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-green-900 font-semibold text-lg">Proposal Ready!</h3>
                            <p className="text-green-700 text-sm">
                                The enterprise proposal for <strong>{pitch.companyName}</strong> has been generated with professional precision.
                            </p>
                        </div>
                        <Button
                            variant="link"
                            className="text-green-700 p-0 h-auto font-semibold flex items-center gap-1 underline"
                            onClick={() => navigate("/intelligence/output")}
                        >
                            Review history
                            <ExternalLink className="w-3 h-3" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="p-8 shadow-sm border-gray-200">
                                <div className="prose prose-blue max-w-none">
                                    <div className="whitespace-pre-wrap text-base text-gray-800 font-sans leading-relaxed">
                                        {pitch.content}
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar Details */}
                        <div className="space-y-6">
                            <Card className="p-6 space-y-6 sticky top-24">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                        Proposal Details
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
                                            <span className="text-gray-500">Company</span>
                                            <span className="font-semibold text-gray-900">{pitch.companyName}</span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
                                            <span className="text-gray-500">Industry</span>
                                            <Badge variant="outline" className="font-medium">{pitch.industry}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
                                            <span className="text-gray-500">Target Audience</span>
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-normal">
                                                {pitch.targetAudience}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
                                            <span className="text-gray-500">Tone</span>
                                            <Badge variant="secondary" className="bg-purple-50 text-purple-700 font-normal">
                                                {pitch.tone}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                        Metadata
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>Generated on {new Date(pitch.generatedDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <User className="w-3.5 h-3.5" />
                                            <span>By {pitch.generatedBy}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                        Selected Services
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {pitch.services.map((service: string, idx: number) => (
                                            <Badge key={idx} variant="outline" className="text-[10px] py-0 px-2 bg-gray-50">
                                                {service}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-2">
                                    <Button variant="outline" className="w-full h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => navigate("/intelligence/output")}>
                                        Discard & Regenerate
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
