export interface Lead {
  id: string;
  companyName: string;
  industry: string;
  score: number;
  temperature: "hot" | "warm" | "cold";
  status: string;
  nextAction: string;
  owner: string;
  createdAt: string;
  website?: string;
  size?: string;
  budget?: string;
  timeline?: string;
  painPoints?: string;
  domain?: string;
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactLinkedIn?: string;
  leadSource?: string;
  notes?: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  matchScore: number;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  features: string[];
  timeline: string;
  investment: string;
  caseStudies: Array<{
    client: string;
    outcome: string;
  }>;
}

export const mockLeads: Lead[] = [
  {
    id: "1",
    companyName: "TechCorp Inc.",
    industry: "FinTech",
    score: 94,
    temperature: "hot",
    status: "Proposal Requested",
    nextAction: "Send Proposal",
    owner: "Sarah Johnson",
    createdAt: "2026-01-27",
    website: "https://techcorp.example.com",
    size: "Enterprise (1000+)",
    budget: "$250K-$500K",
    timeline: "Short-term (1-3 months)",
    painPoints: "Legacy system modernization, security concerns",
    domain: "Finance",
    contactName: "John Doe",
    contactTitle: "CTO",
    contactEmail: "john.doe@techcorp.example.com",
    contactLinkedIn: "https://linkedin.com/in/johndoe",
    leadSource: "Trade Show",
    notes: "Interested in cloud migration and modernization.",
  },
  {
    id: "2",
    companyName: "HealthPlus Solutions",
    industry: "Healthcare",
    score: 78,
    temperature: "warm",
    status: "Discovery Call Scheduled",
    nextAction: "Discovery Call",
    owner: "Michael Thompson",
    createdAt: "2026-01-26",
    website: "https://healthplus.example.com",
    size: "Mid-Market (201-1000)",
    budget: "$100K-$250K",
    timeline: "Medium-term (3-6 months)",
    painPoints: "Data management, compliance issues",
    domain: "Healthcare",
    contactName: "Jane Smith",
    contactTitle: "CIO",
    contactEmail: "jane.smith@healthplus.example.com",
    contactLinkedIn: "https://linkedin.com/in/janesmith",
    leadSource: "Referral",
    notes: "Needs a robust cloud solution for data management.",
  },
  {
    id: "3",
    companyName: "RetailMax",
    industry: "Retail",
    score: 62,
    temperature: "cold",
    status: "Initial Contact",
    nextAction: "Share Research",
    owner: "Jennifer Kim",
    createdAt: "2026-01-25",
    website: "https://retailmax.example.com",
    size: "SME (51-200)",
    budget: "<$50K",
    timeline: "Long-term (6+ months)",
    painPoints: "Inventory management, customer engagement",
    domain: "Retail",
    contactName: "Alice Johnson",
    contactTitle: "Operations Manager",
    contactEmail: "alice.johnson@retailmax.example.com",
    contactLinkedIn: "https://linkedin.com/in/alicejohnson",
    leadSource: "Online Ad",
    notes: "Interested in automation solutions for inventory.",
  },
  {
    id: "4",
    companyName: "DataFlow Systems",
    industry: "Technology",
    score: 88,
    temperature: "hot",
    status: "Requirements Gathering",
    nextAction: "Technical Workshop",
    owner: "Sarah Johnson",
    createdAt: "2026-01-24",
    website: "https://dataflow.example.com",
    size: "Enterprise (1000+)",
    budget: "$500K-$1M",
    timeline: "Immediate (<1 month)",
    painPoints: "Legacy system modernization, security concerns",
    domain: "Technology",
    contactName: "Bob Brown",
    contactTitle: "CTO",
    contactEmail: "bob.brown@dataflow.example.com",
    contactLinkedIn: "https://linkedin.com/in/bobbrown",
    leadSource: "Trade Show",
    notes: "Needs a secure cloud migration solution.",
  },
];

export const mockServices: Service[] = [
  {
    id: "1",
    name: "Cloud Migration & Modernization",
    category: "Cloud & Infrastructure",
    matchScore: 94,
    confidence: "high",
    reasoning: "TechCorp's need for legacy system modernization aligns perfectly with our cloud migration expertise. Their FinTech background requires security-first approach, which is our specialty. The scale of their operations (Enterprise) matches our proven track record.",
    features: [
      "AWS/Azure/GCP migration with zero downtime",
      "Security & compliance (PCI-DSS, SOC2, GDPR)",
      "40% average cost reduction post-migration",
      "Microservices architecture transformation",
      "24/7 support and monitoring",
    ],
    timeline: "4-6 months",
    investment: "$200K-$500K",
    caseStudies: [
      {
        client: "FinanceFirst Corp",
        outcome: "$2M cloud migration, 50% cost reduction",
      },
      {
        client: "BankTech Solutions",
        outcome: "Legacy modernization, 6-month delivery",
      },
    ],
  },
  {
    id: "2",
    name: "DevOps & Automation",
    category: "DevOps & Automation",
    matchScore: 85,
    confidence: "high",
    reasoning: "Complementary to cloud migration efforts. Automation will accelerate deployment cycles and reduce manual errors. CI/CD implementation aligns with modernization goals.",
    features: [
      "CI/CD pipeline implementation",
      "Infrastructure as Code (Terraform, CloudFormation)",
      "Automated testing frameworks",
      "Container orchestration (Kubernetes)",
      "Monitoring and alerting setup",
    ],
    timeline: "2-4 months",
    investment: "$100K-$200K",
    caseStudies: [
      {
        client: "TechStartup Inc",
        outcome: "80% faster deployments, 95% automation",
      },
    ],
  },
  {
    id: "3",
    name: "Custom Software Development",
    category: "Application Development",
    matchScore: 72,
    confidence: "medium",
    reasoning: "While not the primary need, custom development capabilities could complement the modernization effort. TechCorp may need new features built alongside migration.",
    features: [
      "Full-stack development (React, Node.js, Python)",
      "API development and integration",
      "Mobile application development",
      "Scalable architecture design",
      "Agile development methodology",
    ],
    timeline: "3-8 months",
    investment: "$150K-$400K",
    caseStudies: [
      {
        client: "E-commerce Platform Co",
        outcome: "Custom platform, 2M+ users",
      },
    ],
  },
];

export const mockUser = {
  name: "Sarah Johnson",
  email: "sarah.johnson@indusnet.co.in",
  role: "Sales Executive",
  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
};

export const mockMetrics = {
  hotLeads: 12,
  totalLeads: 45,
  reportsGenerated: 78,
  avgTimeToClose: 23,
  pipelineValue: 4200000,
  avgLeadScore: 76,
  winRate: 68,
};

export const mockPipelineData = [
  { stage: "New", count: 24, percentage: 100 },
  { stage: "Contacted", count: 18, percentage: 75 },
  { stage: "Proposal Sent", count: 12, percentage: 50 },
  { stage: "Negotiation", count: 8, percentage: 33 },
  { stage: "Won", count: 5, percentage: 21 },
];

// 🔹 Raw API response from Service Alignment engine
export interface ServiceAlignmentResponse {
  service: string;
  score: number;
  problems: string;
  capabilities: string;
  industries: string;
  technologies: string;
  intent: string;
  identity: string;
}


export function mapAlignmentToService(
  api: ServiceAlignmentResponse
): Service {
  const score = api.score;

  return {
    id: api.service.toLowerCase().replace(/\s+/g, "-"),
    name: api.service,
    category: "AI Recommended",

    matchScore: score,
    confidence: score >= 85 ? "high" : score >= 65 ? "medium" : "low",

    // SA-07
    reasoning: api.problems.replace(/\*/g, "").trim(),

    // SA-08
    features: api.capabilities
      .split("*")
      .map((v) => v.trim())
      .filter(Boolean),

    timeline: "3–6 months",
    investment: "$200K–$500K",

    caseStudies: [], // optional future enhancement
  };
}
