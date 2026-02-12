import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Progress } from "@/app/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Target,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  FileText,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Lead, Service } from "@/data/mockData";

interface ServiceAlignmentTabProps {
  lead: Lead;
  services: Service[];
}

export default function ServiceAlignmentTab({ lead, services }: ServiceAlignmentTabProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showPitchDialog, setShowPitchDialog] = useState(false);

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-100 text-green-800">🟢 High Confidence</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">🟡 Medium Confidence</Badge>;
      case "low":
        return <Badge className="bg-gray-100 text-gray-800">⚪ Low Confidence</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Lead Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Lead Intelligence Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Company</p>
            <p className="font-semibold">{lead.companyName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Industry</p>
            <p className="font-semibold">{lead.industry}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Size</p>
            <p className="font-semibold">{lead.size}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Lead Score</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">{lead.score}%</span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg">
          <p className="text-sm text-gray-700">
            <Sparkles className="w-4 h-4 inline mr-1 text-yellow-500" />
            <strong>AI Insight:</strong> High-value opportunity with strong alignment to INT's cloud
            migration and {lead.industry} expertise. Recommend immediate engagement with enterprise package.
          </p>
        </div>
      </Card>

      {/* View Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <Button variant="outline" size="sm">All Services ({services.length})</Button>
            <Button variant="ghost" size="sm">High Match (≥80%)</Button>
            <Button variant="ghost" size="sm">Selected ({selectedServices.length})</Button>
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <TrendingUp className="w-4 h-4" />
            Refresh Analysis
          </Button>
        </div>
      </Card>

      {/* Service Cards */}
      <div className="space-y-4">
        {services.map((service, index) => (
          <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Best Match Banner */}
            {index === 0 && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">⭐ BEST MATCH</span>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>
                  {getConfidenceBadge(service.confidence)}
                </div>
                <Checkbox
                  checked={selectedServices.includes(service.id)}
                  onCheckedChange={() => toggleService(service.id)}
                  className="w-6 h-6"
                />
              </div>

              {/* Match Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Match Score</span>
                  <span className="text-2xl font-bold text-blue-600">{service.matchScore}%</span>
                </div>
                <Progress value={service.matchScore} className="h-2" />
              </div>

              {/* Reasoning */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">✨ Why This Matches:</p>
                <p className="text-sm text-gray-700">{service.reasoning}</p>
              </div>

              {/* Key Features */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-2">🔑 Key Features & Benefits:</p>
                <ul className="space-y-1">
                  {service.features.map((feature, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Expandable Details */}
              <Accordion type="single" collapsible>
                <AccordionItem value="details" className="border-none">
                  <AccordionTrigger className="text-sm hover:no-underline py-2">
                    📊 Show Score Breakdown & Case Studies
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {/* Score Breakdown */}
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-3">Match Score Breakdown:</p>
                        <div className="space-y-2">
                          {[
                            { name: "Industry Alignment", score: 90 },
                            { name: "Domain Alignment", score: 95 },
                            { name: "Tech Stack Fit", score: 100 },
                            { name: "Company Size Match", score: 92 },
                            { name: "Historical Success", score: 88 },
                          ].map((factor) => (
                            <div key={factor.name}>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-600">{factor.name}</span>
                                <span className="font-medium">{factor.score}%</span>
                              </div>
                              <Progress value={factor.score} className="h-1.5" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Case Studies */}
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">🏆 Relevant Success Stories:</p>
                        <div className="space-y-2">
                          {service.caseStudies.map((study, i) => (
                            <div key={i} className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-900">{study.client}</p>
                              <p className="text-xs text-gray-600">{study.outcome}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Timeline & Investment */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Timeline: <strong>{service.timeline}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>Investment: <strong>{service.investment}</strong></span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  🔍 View Full Details
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    if (!selectedServices.includes(service.id)) {
                      toggleService(service.id);
                    }
                    setShowPitchDialog(true);
                  }}
                >
                  📝 Generate Pitch
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Service Bundle Suggestion */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          💡 Recommended Service Bundle
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          Based on successful engagements with similar clients, we recommend this bundle:
        </p>
        <div className="p-4 bg-white rounded-lg space-y-3">
          <h4 className="font-semibold text-gray-900">Complete Cloud Transformation Package</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Cloud Migration & Modernization</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>DevOps & Automation</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Managed Cloud Services</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-sm">
              <span className="text-gray-600">Bundle Discount: </span>
              <Badge className="bg-green-100 text-green-800">💰 Save 15%</Badge>
            </div>
            <Button size="sm">Select Bundle</Button>
          </div>
        </div>
      </Card>

      {/* Bottom Action Bar */}
      {selectedServices.length > 0 && (
        <Card className="p-4 sticky bottom-0 bg-white border-t-2 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} selected
              </span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedServices([])}>
                Clear All
              </Button>
            </div>
            <Button className="gap-2" onClick={() => setShowPitchDialog(true)}>
              <FileText className="w-4 h-4" />
              Generate Sales Pitch
            </Button>
          </div>
        </Card>
      )}

      {/* Pitch Generation Dialog */}
      <Dialog open={showPitchDialog} onOpenChange={setShowPitchDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Sales Pitch</DialogTitle>
            <DialogDescription>
              Configure your sales pitch parameters
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">Selected Services:</p>
              <ul className="space-y-1">
                {selectedServices.map((id) => {
                  const service = services.find((s) => s.id === id);
                  return service ? (
                    <li key={id} className="text-sm text-gray-700">• {service.name}</li>
                  ) : null;
                })}
              </ul>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Audience</label>
              <select className="w-full p-2 border rounded-md">
                <option>C-Level Executive (CEO, CFO, COO)</option>
                <option>Technical Leader (CTO, VP Engineering)</option>
                <option>Business Unit Head</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tone & Style</label>
              <select className="w-full p-2 border rounded-md">
                <option>Professional & Consultative (Recommended)</option>
                <option>Formal & Corporate</option>
                <option>Technical & Detailed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Length</label>
              <select className="w-full p-2 border rounded-md">
                <option>Standard Proposal (5-8 pages)</option>
                <option>Executive Summary (1-2 pages)</option>
                <option>Comprehensive Deck (10-15 pages)</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowPitchDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Pitch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
