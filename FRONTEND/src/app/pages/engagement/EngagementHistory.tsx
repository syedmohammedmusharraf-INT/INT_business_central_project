import { useNavigate } from "react-router";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import MainLayout from "@/app/components/MainLayout";
import PageHeader from "@/app/components/PageHeader";
import {
  Search,
  Calendar,
  Eye,
  Copy,
  Trash2,
  Mail,
  Newspaper,
  TrendingUp,
  Lightbulb,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

type EmailPurpose = "news" | "insight" | "thought-leadership";

interface EngagementRecord {
  id: string;
  purpose: EmailPurpose;
  subject: string;
  body: string;
  createdAt: string;
  recipient?: string;
  status: "draft" | "sent";
}

const mockEngagementHistory: EngagementRecord[] = [
  {
    id: "e1",
    purpose: "news",
    subject: "INT's Latest Achievement: Recognized as Top Digital Transformation Partner",
    body: `Hi [Contact Name],\n\nI wanted to share some exciting news from our team...`,
    createdAt: "2026-01-27",
    status: "draft",
  },
  {
    id: "e2",
    purpose: "insight",
    subject: "3 Cloud Migration Trends Reshaping FinTech in 2026",
    body: `Hi [Contact Name],\n\nAs someone leading technology decisions...`,
    createdAt: "2026-01-26",
    recipient: "TechCorp Inc.",
    status: "sent",
  },
  {
    id: "e3",
    purpose: "thought-leadership",
    subject: "The Hidden Cost of Delaying Cloud Modernization",
    body: `Hi [Contact Name],\n\nIn working with healthcare leaders...`,
    createdAt: "2026-01-25",
    status: "draft",
  },
  {
    id: "e4",
    purpose: "news",
    subject: "INT Launches New AI-Powered Service Delivery Platform",
    body: `Hi [Contact Name],\n\nWe're excited to announce...`,
    createdAt: "2026-01-24",
    recipient: "DataFlow Systems",
    status: "sent",
  },
];

const purposeConfig = {
  news: { icon: Newspaper, label: "News", color: "blue" },
  insight: { icon: TrendingUp, label: "Insight", color: "purple" },
  "thought-leadership": { icon: Lightbulb, label: "Thought Leadership", color: "green" },
};

export default function EngagementHistory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<EngagementRecord | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredHistory = mockEngagementHistory.filter(
    (record) =>
      record.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.recipient && record.recipient.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleView = (record: EngagementRecord) => {
    setSelectedEmail(record);
    setIsViewDialogOpen(true);
  };

  const handleCopy = (record: EngagementRecord) => {
    const fullEmail = `Subject: ${record.subject}\n\n${record.body}`;
    navigator.clipboard.writeText(fullEmail);
    toast.success("Email copied to clipboard!");
  };

  const handleDelete = (id: string) => {
    toast.success("Email deleted successfully!");
    // In a real app, this would delete from state/database
  };

  const getPurposeIcon = (purpose: EmailPurpose) => {
    const Icon = purposeConfig[purpose].icon;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <MainLayout>
      <PageHeader
        title="Engagement History"
        subtitle="View and reuse saved email drafts"
        actions={
          <Button
            size="sm"
            onClick={() => navigate("/engagement/create")}
            className="gap-2 h-9"
          >
            <Plus className="w-4 h-4" />
            Create Engagement
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        {/* Search Bar */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by subject or recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredHistory.length}</span>{" "}
            of{" "}
            <span className="font-medium text-gray-900">{mockEngagementHistory.length}</span>{" "}
            emails
          </p>
        </div>

        {/* History Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-600">
                    Purpose
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-600">
                    Subject
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-600">
                    Date Created
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-600">
                    Recipient
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="text-gray-500">
                        <p className="text-sm">No engagement history found</p>
                        <p className="text-xs mt-1">Try adjusting your search</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              record.purpose === "news"
                                ? "bg-blue-50"
                                : record.purpose === "insight"
                                ? "bg-purple-50"
                                : "bg-green-50"
                            }`}
                          >
                            {getPurposeIcon(record.purpose)}
                          </div>
                          <span className="text-xs text-gray-600">
                            {purposeConfig[record.purpose].label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-sm font-medium text-gray-900 line-clamp-1">
                          {record.subject}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar className="w-3.5 h-3.5" />
                          {record.createdAt}
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span className="text-sm text-gray-600">
                          {record.recipient || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <Badge
                          className={`text-xs px-2 py-0.5 ${
                            record.status === "sent"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {record.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleView(record)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleCopy(record)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Empty State */}
        {filteredHistory.length === 0 && searchQuery === "" && (
          <Card className="p-12 text-center">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No engagement emails yet
                </h3>
                <p className="text-sm text-gray-600">
                  Create your first AI-powered email to engage with clients
                </p>
              </div>
              <Button onClick={() => navigate("/engagement/create")} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Engagement
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              {selectedEmail && (
                <Badge
                  className={`text-xs px-2 py-0.5 ${
                    selectedEmail.status === "sent"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedEmail.status}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Subject</p>
                <p className="text-sm font-medium text-gray-900">{selectedEmail.subject}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Body</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {selectedEmail.body}
                  </pre>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleCopy(selectedEmail)}
                  className="h-9 gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
                <Button onClick={() => setIsViewDialogOpen(false)} className="h-9">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}