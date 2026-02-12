import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import MainLayout from "@/app/components/MainLayout";
import PageHeader from "@/app/components/PageHeader";
import api from "../../utils/api";
import {
  Search,
  Calendar,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface AlignmentRecord {
  id: string;
  leadId: string;
  leadName: string;
  industry: string;
  createdAt: string;
  servicesCount: number;
  status: "completed" | "in-progress";
  avgMatchScore: number;
}

const mockAlignmentHistory: AlignmentRecord[] = [
  {
    id: "a1",
    leadId: "1",
    leadName: "TechCorp Inc.",
    industry: "FinTech",
    createdAt: "2026-01-27",
    servicesCount: 3,
    status: "completed",
    avgMatchScore: 84,
  },
  {
    id: "a2",
    leadId: "2",
    leadName: "HealthPlus Solutions",
    industry: "Healthcare",
    createdAt: "2026-01-26",
    servicesCount: 2,
    status: "completed",
    avgMatchScore: 72,
  },
  {
    id: "a3",
    leadId: "4",
    leadName: "DataFlow Systems",
    industry: "Technology",
    createdAt: "2026-01-24",
    servicesCount: 4,
    status: "completed",
    avgMatchScore: 88,
  },
  {
    id: "a4",
    leadId: "3",
    leadName: "RetailMax",
    industry: "Retail",
    createdAt: "2026-01-25",
    servicesCount: 2,
    status: "completed",
    avgMatchScore: 65,
  },
];

export default function AlignmentHistory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get("/leads");
        // Only show leads that have been analyzed (score > 0)
        setHistory(res.data.filter((l: any) => l.score > 0));
      } catch (error) {
        console.error("Failed to fetch history:", error);
        toast.error("Failed to load alignment history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(
    (record) =>
      record.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout>
      <PageHeader
        title="Alignment History"
        subtitle="Review past AI-powered service alignments and recommendations"
      />

      <div className="p-8 space-y-6">
        {/* Search Bar */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by company or industry..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-9 h-9"
            />
          </div>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-bold text-gray-900">{Math.min(filteredHistory.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span className="font-bold text-gray-900">{Math.min(filteredHistory.length, currentPage * itemsPerPage)}</span>{" "}
            of{" "}
            <span className="font-bold text-gray-900">{filteredHistory.length}</span>{" "}
            alignments
          </p>
        </div>

        {/* History Table */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Company
                  </th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Industry
                  </th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Services
                  </th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Avg Match
                  </th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="text-sm text-gray-500">Loading history...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="text-gray-500">
                        <p className="text-sm font-medium">No alignment history found</p>
                        <p className="text-xs mt-1">Try adjusting your search</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedHistory.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/intelligence/alignment/${record.id}`)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            {record.companyName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600 font-medium capitalize">{record.industry}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(record.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600 font-medium">
                          {record.matched_services?.length || 5} services
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant="secondary"
                          className={`${getScoreBadge(record.score)} font-bold px-2 py-0.5 border-0 shadow-sm`}
                        >
                          {record.score}%
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-xs font-bold text-green-600 uppercase tracking-tight">
                            completed
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[12px] font-bold text-gray-500 hover:text-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/intelligence/alignment/${record.id}`);
                            }}
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            Regenerate
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[12px] font-black text-gray-900 hover:text-blue-600 group-hover:translate-x-1 transition-transform"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/intelligence/alignment/${record.id}`);
                            }}
                          >
                            View <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="h-9 px-4 font-bold rounded-lg border-gray-200"
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 text-sm font-bold rounded-lg transition-all ${currentPage === i + 1
                      ? "bg-[#0f172a] text-white shadow-md scale-105"
                      : "text-gray-500 hover:bg-white hover:shadow-sm"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="h-9 px-4 font-bold rounded-lg border-gray-200"
              >
                Next
              </Button>
            </div>
          )}
        </Card>

        {/* Empty State */}
        {!loading && filteredHistory.length === 0 && searchQuery === "" && (
          <Card className="p-12 text-center border-0 shadow-sm bg-white/50 backdrop-blur-sm mt-12">
            <div className="max-w-sm mx-auto space-y-6">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#0f172a] mb-2">
                  No alignment history yet
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Create leads and generate service alignments to see them here for historical review.
                </p>
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/leads")}
                  className="font-bold border-gray-200"
                >
                  Browse Leads
                </Button>
                <Button onClick={() => navigate("/leads/create")} className="font-bold bg-[#0f172a]">
                  Create Lead
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
