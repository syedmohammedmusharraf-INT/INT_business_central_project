import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Newspaper,
  TrendingUp,
  FileText,
  Award,
  BarChart3,
  Mail,
  Download,
  Eye,
  Sparkles,
} from "lucide-react";
import { Lead } from "@/data/mockData";

interface ContentHubTabProps {
  lead: Lead;
}

export default function ContentHubTab({ lead }: ContentHubTabProps) {
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  const contentTypes = [
    {
      id: "int-news",
      icon: <Newspaper className="w-8 h-8 text-blue-600" />,
      title: "INT News & Updates",
      description: "Share latest INT achievements, partnerships, awards, and company updates",
      lastGenerated: "2 days ago",
      recommendedFor: "Discovery stage",
      impact: "Medium",
    },
    {
      id: "market-research",
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      title: "Market Research",
      description: "Industry trends and analysis relevant to client industry",
      lastGenerated: "1 week ago",
      recommendedFor: "Proposal stage",
      impact: "High",
    },
    {
      id: "whitepaper",
      icon: <FileText className="w-8 h-8 text-green-600" />,
      title: "White Papers",
      description: "Technical insights & thought leadership content",
      lastGenerated: "3 days ago",
      recommendedFor: "Education & awareness",
      impact: "High",
    },
    {
      id: "case-study",
      icon: <Award className="w-8 h-8 text-orange-600" />,
      title: "Case Studies",
      description: "Success stories from similar engagements",
      lastGenerated: "5 days ago",
      recommendedFor: "Proposal stage",
      impact: "High",
    },
    {
      id: "industry-insights",
      icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
      title: "Industry Insights",
      description: "Sector-specific best practices and insights",
      lastGenerated: "Never",
      recommendedFor: "Discovery stage",
      impact: "Medium",
    },
    {
      id: "email-template",
      icon: <Mail className="w-8 h-8 text-pink-600" />,
      title: "Email Templates",
      description: "Pre-written email templates for different scenarios",
      lastGenerated: "1 day ago",
      recommendedFor: "All stages",
      impact: "Medium",
    },
  ];

  const generatedContent = [
    {
      id: "1",
      type: "Market Research",
      title: "FinTech Cloud Adoption Trends 2026",
      date: "Jan 27, 2026",
      author: "Sarah Johnson",
      downloads: 3,
      sentToClient: true,
      engagement: { opened: true, viewed: 2 },
    },
    {
      id: "2",
      type: "Whitepaper",
      title: "Zero-Downtime Cloud Migration Strategies",
      date: "Jan 25, 2026",
      author: "Sarah Johnson",
      downloads: 1,
      sentToClient: false,
    },
    {
      id: "3",
      type: "Case Study",
      title: "BankTech Cloud Migration Success Story",
      date: "Jan 24, 2026",
      author: "Sarah Johnson",
      downloads: 5,
      sentToClient: true,
      engagement: { opened: true, viewed: 4, forwarded: 1 },
    },
  ];

  const handleGenerateContent = (contentType: typeof contentTypes[0]) => {
    setSelectedContentType(contentType.id);
    setShowGenerateDialog(true);
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "High":
        return <Badge className="bg-green-100 text-green-800">High Impact</Badge>;
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Impact</Badge>;
      case "Low":
        return <Badge className="bg-gray-100 text-gray-800">Low Impact</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📨 Content Hub - Engagement Materials
        </h3>
        <p className="text-sm text-gray-700">
          Generate personalized content to nurture and engage <strong>{lead.companyName}</strong>
        </p>
      </Card>

      {/* Content Type Selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Select Content Type to Generate:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentTypes.map((contentType) => (
            <Card
              key={contentType.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="mb-4">
                <div className="mb-3">{contentType.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{contentType.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{contentType.description}</p>
              </div>

              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div>Last generated: <span className="font-medium">{contentType.lastGenerated}</span></div>
                <div>Recommended for: <span className="font-medium">{contentType.recommendedFor}</span></div>
                <div className="flex items-center gap-2">
                  Impact: {getImpactBadge(contentType.impact)}
                </div>
              </div>

              <Button
                size="sm"
                className="w-full gap-2"
                onClick={() => handleGenerateContent(contentType)}
              >
                <Sparkles className="w-4 h-4" />
                Generate →
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Generated Content Library */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900">📚 Generated Content Library</h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Filter</Button>
            <Button variant="outline" size="sm">Sort</Button>
          </div>
        </div>

        <div className="space-y-3">
          {generatedContent.map((content) => (
            <Card key={content.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-gray-900">{content.title}</h4>
                    <Badge variant="outline" className="text-xs">{content.type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                    <span>Generated: {content.date}</span>
                    <span>By: {content.author}</span>
                    <span>Downloads: {content.downloads}</span>
                    {content.sentToClient && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Sent to client
                      </Badge>
                    )}
                  </div>
                  {content.engagement && (
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      {content.engagement.opened && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Opened
                        </span>
                      )}
                      {content.engagement.viewed && (
                        <span>Viewed {content.engagement.viewed}x</span>
                      )}
                      {content.engagement.forwarded && (
                        <span>Forwarded {content.engagement.forwarded}x</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Eye className="w-3 h-3" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                  <Button size="sm" className="gap-1">
                    <Mail className="w-3 h-3" />
                    Send
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Content Generation Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Market Research</DialogTitle>
            <DialogDescription>
              Configure your market research parameters
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                Generating content for: <strong>{lead.companyName}</strong> ({lead.industry})
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Industry Focus</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                defaultValue={lead.industry}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Geographic Scope</label>
              <select className="w-full p-2 border rounded-md">
                <option>Global</option>
                <option>North America</option>
                <option>Europe</option>
                <option>Asia-Pacific</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <select className="w-full p-2 border rounded-md">
                <option>Current State (latest data)</option>
                <option>Historical + Current (last 12 months)</option>
                <option>Historical + Forecast (12m back + 12m forward)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Research Depth</label>
              <select className="w-full p-2 border rounded-md">
                <option>Standard Report (8-12 pages) [Recommended]</option>
                <option>Quick Insights (2-3 pages)</option>
                <option>Comprehensive Study (15-20 pages)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Research Aspects</label>
              <div className="space-y-2 p-3 border rounded-md">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Market Size & Growth</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Key Trends & Drivers</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Competitive Landscape</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" />
                  <span className="text-sm">Technology Adoption</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" />
                  <span className="text-sm">Regulatory Changes</span>
                </label>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-gray-700">
                <Sparkles className="w-3 h-3 inline mr-1 text-yellow-600" />
                <strong>AI Recommendation:</strong> For {lead.companyName} ({lead.industry}), we
                recommend including Technology Adoption and Regulatory Changes aspects. 82% relevance
                to client profile.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowGenerateDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Research →
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
