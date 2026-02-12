import { useNavigate } from "react-router";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import api from "../../utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import MainLayout from "@/app/components/MainLayout";
import PageHeader from "@/app/components/PageHeader";
import { Search, Plus, ArrowRight, Flame, Zap, Droplet, Filter, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export const createLead = async (payload: any) => {
  const res = await api.post("/leads", payload);
  return res.data;
};

export const getLeadById = async (leadId: string) => {
  const res = await api.get(`/leads/${leadId}`);
  return res.data;
};
export default function LeadRepository() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const data = await api.get("/leads");
        setLeads(data.data);
      } catch (error) {
        console.error("Failed to fetch leads:", error);
        toast.error("Failed to load leads");
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      (lead.companyName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (lead.industry?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === "all" || lead.industry === industryFilter;
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesIndustry && matchesStatus;
  });

  const leadsToShow = filteredLeads.slice(0, displayCount);

  return (
    <MainLayout>
      <PageHeader
        title="Lead Repository"
        subtitle="Access and manage all your sales opportunities"
        actions={
          <Button size="sm" onClick={() => navigate("/leads/create")} className="gap-2 h-9">
            <Plus className="w-4 h-4" />
            Create Lead
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by company or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[180px] h-9">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="FinTech">FinTech</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Initial Contact">Initial Contact</SelectItem>
                  <SelectItem value="Discovery Call Scheduled">Discovery Call</SelectItem>
                  <SelectItem value="Proposal Requested">Proposal</SelectItem>
                  <SelectItem value="Requirements Gathering">Requirements</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{leadsToShow.length}</span> of{" "}
            <span className="font-medium text-gray-900">{filteredLeads.length}</span> leads
          </p>
        </div>

        {/* Leads Table */}
        <Card>
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
                    Created Date
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-600">
                    Services
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-600">
                    Score
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-600">
                    Owner
                  </th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="text-sm text-gray-500">Loading leads...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="text-gray-500">
                        <p className="text-sm">No leads found</p>
                        <p className="text-xs mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leadsToShow.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/intelligence/alignment/${lead.id}`)}
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          {lead.score >= 80 ? <Flame className="w-4 h-4 text-orange-500" /> : <Zap className="w-4 h-4 text-blue-400" />}
                          <span className="text-sm font-medium text-gray-900">
                            {lead.companyName || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-sm text-gray-600">{lead.industry || "N/A"}</span>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-sm text-gray-600">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <Badge variant="outline" className="text-xs">
                          {lead.servicesCount || 0}
                        </Badge>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-xs text-gray-600 font-medium px-2 py-1 bg-gray-100 rounded-full">{lead.status}</span>
                      </td>
                      <td className="py-3 px-6">
                        <Badge className={`${lead.score >= 80 ? "bg-green-100 text-green-800" : lead.score >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"} text-xs px-2 py-0.5`}>
                          {lead.score || 0}%
                        </Badge>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-sm text-gray-600">{lead.owner || "Unassigned"}</span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={(e) => {
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

          {filteredLeads.length > displayCount && !loading && (
            <div className="p-4 border-t bg-gray-50 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDisplayCount(prev => prev + 5)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Load More Results
              </Button>
            </div>
          )}
        </Card>

        {/* Empty State - Alternate Design */}
        {filteredLeads.length === 0 && searchQuery === "" && (
          <Card className="p-12 text-center">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads yet</h3>
                <p className="text-sm text-gray-600">
                  Start building your pipeline by creating your first lead
                </p>
              </div>
              <Button onClick={() => navigate("/leads/create")} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Lead
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
