import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { ArrowLeft, LogOut, Settings, HelpCircle } from "lucide-react";
import { mockLeads, mockUser, mockServices } from "@/data/mockData";
import LeadProfileTab from "@/app/components/LeadProfileTab";
import ServiceAlignmentTab from "@/app/components/ServiceAlignmentTab";
import ContentHubTab from "@/app/components/ContentHubTab";

export default function LeadDetail() {
  const navigate = useNavigate();
  const { leadId } = useParams<{ leadId: string }>();
  const [activeTab, setActiveTab] = useState("profile");

  const lead = mockLeads.find((l) => l.id === leadId);

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Lead Not Found</h2>
          <p className="text-gray-600 mb-4">The lead you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">{lead.companyName}</h1>
                <p className="text-xs text-gray-500">{lead.industry} • {lead.status}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Avatar>
                  <AvatarImage src={mockUser.photo} alt={mockUser.name} />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium">{mockUser.name}</p>
                  <p className="text-xs text-gray-500">{mockUser.email}</p>
                </div>
                <DropdownMenuItem className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Help
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600">
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile">📝 Lead Profile</TabsTrigger>
            <TabsTrigger value="alignment">🎯 Service Alignment</TabsTrigger>
            <TabsTrigger value="content">📨 Content Hub</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <LeadProfileTab lead={lead} />
          </TabsContent>

          <TabsContent value="alignment" className="space-y-6">
            <ServiceAlignmentTab lead={lead} services={mockServices} />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ContentHubTab lead={lead} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}