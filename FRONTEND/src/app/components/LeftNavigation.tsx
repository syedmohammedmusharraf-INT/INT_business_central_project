import { useState } from "react";
import { NavLink } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/app/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  Home,
  FileText,
  Brain,
  Mail,
  ChevronDown,
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { mockUser } from "@/data/mockData";
import { useNavigate } from "react-router";

const navItems = [
  {
    id: "dashboard",
    icon: Home,
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    id: "leads",
    icon: FileText,
    label: "Leads",
    path: "/leads",
    subItems: [
      { label: "Create Lead", path: "/leads/create" },
      { label: "Lead Repository", path: "/leads/repository" },
    ],
  },
  {
    id: "intelligence",
    icon: Brain,
    label: "Intelligence",
    path: "/intelligence",
    subItems: [
      { label: "Service Alignment", path: "/intelligence/alignment" },
      { label: "Alignment History", path: "/intelligence/history" },
      { label: "Output", path: "/intelligence/output" },
    ],
  },
  {
    id: "engagement",
    icon: Mail,
    label: "Engagement",
    path: "/engagement",
    subItems: [
      { label: "Create Engagement", path: "/engagement/create" },
      { label: "Engagement History", path: "/engagement/history" },
    ],
  },
];

export default function LeftNavigation() {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>(["leads", "intelligence", "engagement"]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="w-64 bg-white border-r flex flex-col h-screen fixed left-0 top-0">
      {/* Logo Section */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-white">INT</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">INT Business Central</h1>
            <p className="text-xs text-gray-500">Sales Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItems.includes(item.id);

            return (
              <div key={item.id}>
                {/* Main Nav Item */}
                {hasSubItems ? (
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                )}

                {/* Sub Items */}
                {hasSubItems && isExpanded && (
                  <div className="ml-10 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
                    {item.subItems!.map((subItem) => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        className={({ isActive }) =>
                          `block px-3 py-1.5 rounded-md text-sm transition-colors ${
                            isActive
                              ? "text-blue-700 bg-blue-50 font-medium"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`
                        }
                      >
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarImage src={mockUser.photo} alt={mockUser.name} />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">{mockUser.name}</p>
                <p className="text-xs text-gray-500">{mockUser.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-2">
              <p className="text-sm font-medium">{mockUser.name}</p>
              <p className="text-xs text-gray-500">{mockUser.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <HelpCircle className="w-4 h-4" />
              Help & Documentation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600">
              <LogOut className="w-4 h-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
