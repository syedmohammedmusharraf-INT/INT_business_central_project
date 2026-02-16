import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import MainLayout from "@/app/components/MainLayout";
import PageHeader from "@/app/components/PageHeader";
import {
  TrendingUp,
  FileText,
  Users,
  Mail,
  Flame,
  Zap,
  Droplet,
  ArrowRight,
  Plus,
  Brain,
  Loader2,
} from "lucide-react";
import { mockMetrics } from "@/data/mockData";
import { toast } from "sonner";
import { API_BASE_URL } from "@/app/utils/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState<any[]>([]);
  const [pitches, setPitches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch leads and pitches in parallel
        const [leadsRes, pitchesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/leads`),
          fetch(`${API_BASE_URL}/intelligence/pitches`)
        ]);

        if (leadsRes.ok && pitchesRes.ok) {
          const leadsData = await leadsRes.json();
          const pitchesData = await pitchesRes.json();
          setLeads(leadsData);
          setPitches(pitchesData);
        } else {
          toast.error("Failed to load dashboard data");
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error("An error occurred while loading the dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const getTemperatureIcon = (temperature: string) => {
    switch (temperature) {
      case "hot":
        return <Flame className="w-3.5 h-3.5 text-orange-500" />;
      case "warm":
        return <Zap className="w-3.5 h-3.5 text-yellow-500" />;
      case "cold":
        return <Droplet className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 text-xs px-2 py-0.5";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5";
    return "bg-gray-100 text-gray-800 text-xs px-2 py-0.5";
  };

  const getPipelineStages = () => {
    const stages = [
      { name: "New", color: "bg-blue-500" },
      { name: "Contacted", color: "bg-indigo-500" },
      { name: "Proposal", color: "bg-purple-500" },
      { name: "Negotiation", color: "bg-pink-500" },
      { name: "Won", color: "bg-green-500" },
    ];

    return stages.map(stage => ({
      ...stage,
      count: leads.filter(l => l.status === stage.name).length
    }));
  };

  const pipelineStages = getPipelineStages();
  const totalLeadsCount = leads.length;

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Your sales pipeline overview"
        actions={
          <Button size="sm" onClick={() => navigate("/leads/create")} className="gap-2 h-9">
            <Plus className="w-4 h-4" />
            Create Lead
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        {/* KPI Cards - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : leads.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">High-Intent Leads</p>
                <p className="text-2xl font-bold text-orange-600">
                  {loading ? "..." : leads.filter(l => l.score >= 80).length}
                </p>
              </div>
              <Flame className="w-8 h-8 text-orange-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Pitches Generated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : pitches.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Unique Companies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : new Set(leads.map(l => l.companyName)).size}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
          </Card>
        </div>

        {/* Lead Pipeline */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Lead Pipeline</h3>
            <span className="text-xs text-gray-500">{totalLeadsCount} total leads</span>
          </div>

          <div className="space-y-4">
            {/* Horizontal segmented bar */}
            <div className="flex h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              {totalLeadsCount > 0 ? (
                pipelineStages.map((stage) => (
                  stage.count > 0 && (
                    <button
                      key={stage.name}
                      onClick={() => navigate("/leads/repository")}
                      className={`${stage.color} flex items-center justify-center text-white text-xs font-medium hover:opacity-90 transition-opacity`}
                      style={{ width: `${(stage.count / totalLeadsCount) * 100}%` }}
                    >
                      {stage.count}
                    </button>
                  )
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-xs italic">
                  No active pipeline data
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between">
              {pipelineStages.map((stage) => (
                <div key={stage.name} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${stage.color}`} />
                  <span className="text-xs text-gray-600">
                    {stage.name} ({stage.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Leads Table */}
        <Card>
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Recent Leads</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => navigate("/leads/repository")}
              >
                View All
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-600">
                    Company
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-600">
                    Industry
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-600">
                    Score
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-600">
                    Next Action
                  </th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span>Loading recent leads...</span>
                      </div>
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      No leads found. Create your first lead to get started.
                    </td>
                  </tr>
                ) : (
                  leads.slice(0, 5).map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/intelligence/alignment/${lead.id}`)}
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          {lead.score >= 80 ? (
                            <Flame className="w-3.5 h-3.5 text-orange-500" />
                          ) : lead.score >= 50 ? (
                            <Zap className="w-3.5 h-3.5 text-yellow-500" />
                          ) : (
                            <Droplet className="w-3.5 h-3.5 text-blue-500" />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {lead.companyName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-sm text-gray-600">{lead.industry}</span>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-xs text-gray-600">{lead.status}</span>
                      </td>
                      <td className="py-3 px-6">
                        <Badge className={getScoreBadge(lead.score)}>{lead.score}%</Badge>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-xs text-gray-600 font-medium">
                          {lead.score > 70 ? "Ready for Pitch" : "Profile Incomplete"}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-blue-600 hover:text-blue-700 font-medium"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            navigate(`/intelligence/alignment/${lead.id}`);
                          }}
                        >
                          View <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => navigate("/leads/create")}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Create Lead</p>
                  <p className="text-xs text-gray-500">Add new opportunity</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => navigate("/intelligence/alignment")}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Service Alignment</p>
                  <p className="text-xs text-gray-500">AI-powered matching</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={() => navigate("/engagement/create")}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Create Engagement</p>
                  <p className="text-xs text-gray-500">Draft email content</p>
                </div>
              </div>
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}