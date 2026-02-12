import { useNavigate, useLocation } from "react-router";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import MainLayout from "@/app/components/MainLayout";
import PageHeader from "@/app/components/PageHeader";
import {
  Mail,
  TrendingUp,
  Lightbulb,
  Newspaper,
  Copy,
  Save,
  RefreshCw,
  CheckCircle2,
  Loader2,
  Sparkles,
  FileText,
  Rocket,
  Users,
  Award,
  Target,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type EmailPurpose = "news" | "insight" | "thought-leadership" | "whitepaper" | "product-launch" | "collaboration" | "case-study" | "webinar" | "partnership" | "";

const purposeOptions = [
  {
    id: "news" as const,
    icon: Newspaper,
    title: "INT News",
    description: "Share company updates and achievements",
    color: "blue",
    gradient: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-50 to-blue-100/50",
  },
  {
    id: "insight" as const,
    icon: TrendingUp,
    title: "Market Insight",
    description: "Industry trends and analysis",
    color: "purple",
    gradient: "from-purple-500 to-purple-600",
    bgGradient: "from-purple-50 to-purple-100/50",
  },
  {
    id: "thought-leadership" as const,
    icon: Lightbulb,
    title: "Thought Leadership",
    description: "Expert perspectives and best practices",
    color: "green",
    gradient: "from-green-500 to-green-600",
    bgGradient: "from-green-50 to-green-100/50",
  },
  {
    id: "whitepaper" as const,
    icon: FileText,
    title: "Whitepaper",
    description: "Technical deep-dives and research",
    color: "orange",
    gradient: "from-orange-500 to-orange-600",
    bgGradient: "from-orange-50 to-orange-100/50",
  },
  {
    id: "product-launch" as const,
    icon: Rocket,
    title: "New Product Launch",
    description: "Announce INT's latest innovations",
    color: "pink",
    gradient: "from-pink-500 to-pink-600",
    bgGradient: "from-pink-50 to-pink-100/50",
  },
  {
    id: "collaboration" as const,
    icon: Users,
    title: "New Collaborations",
    description: "Strategic partnerships and alliances",
    color: "teal",
    gradient: "from-teal-500 to-teal-600",
    bgGradient: "from-teal-50 to-teal-100/50",
  },
  {
    id: "case-study" as const,
    icon: Award,
    title: "Success Story",
    description: "Client achievements and outcomes",
    color: "indigo",
    gradient: "from-indigo-500 to-indigo-600",
    bgGradient: "from-indigo-50 to-indigo-100/50",
  },
  {
    id: "webinar" as const,
    icon: Target,
    title: "Webinar Invite",
    description: "Educational events and workshops",
    color: "cyan",
    gradient: "from-cyan-500 to-cyan-600",
    bgGradient: "from-cyan-50 to-cyan-100/50",
  },
  {
    id: "partnership" as const,
    icon: Zap,
    title: "Partnership Opportunity",
    description: "Collaborative business proposals",
    color: "amber",
    gradient: "from-amber-500 to-amber-600",
    bgGradient: "from-amber-50 to-amber-100/50",
  },
];

const mockEmailTemplates: Record<string, { subject: string; body: string }> = {
  news: {
    subject: "INT's Latest Achievement: Recognized as Top Digital Transformation Partner",
    body: `Hi [Contact Name],

I wanted to share some exciting news from our team at Indus Net Technologies.

We were recently recognized as a Top Digital Transformation Partner for 2026 by Industry Leaders Magazine. This recognition validates our commitment to delivering exceptional cloud migration and modernization solutions.

What this means for companies like [Company Name]:
• Proven track record in [Industry] sector transformations
• Cutting-edge expertise in cloud architecture and DevOps
• 95% client satisfaction rate across 200+ successful projects

I'd love to schedule a brief call to discuss how our award-winning approach could accelerate [Company Name]'s digital transformation goals.

Would you be available for a 15-minute conversation next week?

Best regards,
[Your Name]
Indus Net Technologies`,
  },
  insight: {
    subject: "3 Cloud Migration Trends Reshaping [Industry] in 2026",
    body: `Hi [Contact Name],

As someone leading technology decisions at [Company Name], I thought you'd find our latest industry research valuable.

We've analyzed 500+ cloud migrations across the [Industry] sector and identified three critical trends:

1. **Security-First Migration** - 78% of enterprises now prioritize compliance before cost
2. **Hybrid Cloud Adoption** - Multi-cloud strategies increasing 3x year-over-year
3. **AI-Powered Operations** - Automation reducing post-migration costs by 40%

Based on [Company Name]'s profile, the security-first approach particularly resonates with your needs. We've helped similar organizations achieve:
• Zero-downtime migrations with PCI-DSS compliance
• 50% reduction in infrastructure costs
• 6-month average project delivery

I'd be happy to share our detailed research report and discuss how these trends apply to your specific situation.

Available for a quick call this week?

Best regards,
[Your Name]
Indus Net Technologies`,
  },
  "thought-leadership": {
    subject: "The Hidden Cost of Delaying Cloud Modernization",
    body: `Hi [Contact Name],

In working with [Industry] leaders over the past decade, I've noticed a recurring pattern: the cost of delayed modernization compounds faster than most organizations expect.

Here's what we're seeing:

**The 18-Month Window**
Companies that delay cloud migration for 18+ months face:
• 3x higher migration complexity
• 60% increase in total project cost
• Competitive disadvantage as rivals move faster

**The Alternative Approach**
Our phased migration methodology helps organizations like [Company Name]:
• Start small with high-impact workloads
• Build confidence through early wins
• Scale transformation incrementally

We recently helped a [Industry] company with similar challenges achieve ROI in just 4 months by focusing on their most critical systems first.

I've outlined a preliminary roadmap specific to [Company Name]'s situation. Would you be open to a 20-minute discussion to explore if this approach makes sense for your timeline?

Best regards,
[Your Name]
Indus Net Technologies`,
  },
  whitepaper: {
    subject: "New Whitepaper: Complete Guide to Secure Cloud Migration",
    body: `Hi [Contact Name],

I'm excited to share our latest whitepaper: "The Complete Guide to Secure Cloud Migration in 2026."

This 45-page resource covers:
• Security-first migration frameworks
• Compliance requirements (SOC2, PCI-DSS, GDPR)
• Cost optimization strategies
• Real-world case studies from [Industry] sector

Key takeaway for [Company Name]: We've included a step-by-step checklist that's helped 50+ companies ensure zero security incidents during migration.

Download your copy: [Link]

Would you like to schedule a 30-minute session to discuss how these frameworks apply to your specific infrastructure?

Best regards,
[Your Name]
Indus Net Technologies`,
  },
  "product-launch": {
    subject: "Introducing CloudSync Pro: Next-Gen Migration Platform",
    body: `Hi [Contact Name],

Big news! We're launching CloudSync Pro - our revolutionary cloud migration platform that reduces migration time by 60%.

What makes it different:
• AI-powered dependency mapping
• Automated compliance validation
• Zero-downtime migration guarantee
• Real-time cost optimization

Early access offer for [Company Name]:
• Free migration assessment ($5K value)
• 20% discount on first project
• Dedicated migration architect

We're offering exclusive early access to select partners in the [Industry] sector. Interested in a demo?

Let's schedule 20 minutes next week to see if CloudSync Pro is the right fit for [Company Name].

Best regards,
[Your Name]
Indus Net Technologies`,
  },
  collaboration: {
    subject: "Strategic Partnership: INT + AWS Advanced Consulting Partnership",
    body: `Hi [Contact Name],

Exciting news! Indus Net Technologies has been selected as an AWS Advanced Consulting Partner - placing us in the top 5% of AWS partners globally.

What this means for [Company Name]:
• Direct access to AWS solution architects
• Priority support and resources
• Exclusive early access to AWS beta features
• Certified migration specialists on your team

We're inviting 10 strategic clients to join our AWS Accelerator Program:
• Complimentary cloud readiness assessment
• AWS credits worth $10K
• Fast-track migration timeline

As a leader in [Industry], [Company Name] would be an ideal partner for this program.

Can we schedule a brief call to discuss the details?

Best regards,
[Your Name]
Indus Net Technologies`,
  },
  "case-study": {
    subject: "How [Similar Company] Achieved 300% ROI with INT",
    body: `Hi [Contact Name],

I wanted to share a recent success story that reminded me of [Company Name]'s current situation.

We recently completed a cloud modernization project for a [Industry] company with similar challenges:

**Their Challenge:**
• Legacy infrastructure limiting growth
• High operational costs
• Compliance concerns

**Our Solution:**
• Phased AWS migration
• Automated DevOps pipeline
• 24/7 managed services

**The Results:**
• 300% ROI in first year
• 65% reduction in infrastructure costs
• Zero security incidents
• 99.99% uptime

I've prepared a detailed case study and would love to walk you through how we could achieve similar results for [Company Name].

Available for a 15-minute call this week?

Best regards,
[Your Name]
Indus Net Technologies`,
  },
  webinar: {
    subject: "You're Invited: Cloud Security Masterclass - Feb 15th",
    body: `Hi [Contact Name],

You're invited to our exclusive webinar: "Cloud Security Masterclass: Protecting Your Digital Assets in 2026"

📅 Date: February 15, 2026
⏰ Time: 2:00 PM EST
⏱️ Duration: 60 minutes

What you'll learn:
• Latest cloud security threats in [Industry]
• Best practices for compliance (SOC2, PCI-DSS)
• Live demo: Security automation tools
• Q&A with our security experts

Bonus: All attendees receive a complimentary security assessment ($3K value) for their infrastructure.

Seats are limited. Reserve your spot: [Registration Link]

Looking forward to seeing you there!

Best regards,
[Your Name]
Indus Net Technologies`,
  },
  partnership: {
    subject: "Partnership Opportunity: Grow Together in [Industry]",
    body: `Hi [Contact Name],

I've been following [Company Name]'s growth in the [Industry] space, and I believe there's a powerful partnership opportunity between our organizations.

**What we bring:**
• Cloud & DevOps expertise
• 200+ successful implementations
• 24/7 technical support
• Proven track record in [Industry]

**Partnership opportunity:**
• Co-develop solutions for [Industry] clients
• Revenue sharing model
• Joint marketing initiatives
• Preferential pricing for mutual clients

**Potential benefits:**
• Expand your service offerings
• Increase client retention
• Access to enterprise clients
• Technical capability enhancement

I'd love to explore this further. Are you available for a 30-minute discovery call next week?

Best regards,
[Your Name]
Indus Net Technologies`,
  },
};

export default function CreateEngagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<"select" | "configure" | "output">("select");
  const [selectedPurpose, setSelectedPurpose] = useState<EmailPurpose>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [configuration, setConfiguration] = useState({
    objective: "",
    audience: "",
    tone: "professional",
    cta: "",
    notes: "",
  });
  const [generatedEmail, setGeneratedEmail] = useState({
    subject: "",
    body: "",
  });

  const handlePurposeSelect = (purpose: EmailPurpose) => {
    setSelectedPurpose(purpose);
    setStep("configure");
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStep("output");

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Use mock template based on purpose
    const template = mockEmailTemplates[selectedPurpose] || mockEmailTemplates.news;
    setGeneratedEmail({
      subject: template.subject,
      body: template.body,
    });

    setIsGenerating(false);
    toast.success("Email generated successfully!");
  };

  const handleCopy = () => {
    const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    const textArea = document.createElement("textarea");
    textArea.value = fullEmail;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      textArea.remove();
      toast.success("Email copied to clipboard!");
    } catch (err) {
      textArea.remove();
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleSave = () => {
    toast.success("Email draft saved!");
    setTimeout(() => navigate("/engagement/history"), 1000);
  };

  const handleRegenerate = () => {
    setStep("configure");
    toast.info("Modify configuration and regenerate");
  };

  if (step === "select") {
    return (
      <MainLayout>
        <PageHeader
          title="Create Engagement"
          subtitle="Generate AI-powered email content for client engagement"
        />

        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Choose Email Purpose
              </h3>
              <p className="text-sm text-gray-600">
                Select the type of engagement email you want to create
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {purposeOptions.map((option) => {
                const Icon = option.icon;
                
                return (
                  <Card
                    key={option.id}
                    className="group relative overflow-hidden cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                    onClick={() => handlePurposeSelect(option.id)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${option.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    <div className="relative p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}></div>
                      </div>
                      
                      <div>
                        <h4 className="text-base font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-gray-900 group-hover:to-gray-600 transition-all">
                          {option.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {option.description}
                        </p>
                      </div>

                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${option.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (step === "configure") {
    const selectedOption = purposeOptions.find((p) => p.id === selectedPurpose);
    
    return (
      <MainLayout>
        <PageHeader
          title="Configure Email"
          subtitle={`Customize your ${selectedOption?.title} email`}
        />

        <div className="p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Selected Purpose Display */}
            {selectedOption && (
              <Card className={`p-6 border-0 shadow-lg bg-gradient-to-br ${selectedOption.bgGradient}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${selectedOption.gradient} flex items-center justify-center shadow-lg`}>
                    {(() => {
                      const Icon = selectedOption.icon;
                      return <Icon className="w-6 h-6 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedOption.title}</h3>
                    <p className="text-sm text-gray-600">{selectedOption.description}</p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="objective" className="text-sm font-semibold text-gray-700">
                    Email Objective
                  </Label>
                  <Textarea
                    id="objective"
                    value={configuration.objective}
                    onChange={(e) =>
                      setConfiguration((prev) => ({ ...prev, objective: e.target.value }))
                    }
                    placeholder="What do you want to achieve with this email? (e.g., Schedule a discovery call, Share case study, etc.)"
                    rows={2}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience" className="text-sm font-semibold text-gray-700">
                    Target Audience
                  </Label>
                  <Input
                    id="audience"
                    value={configuration.audience}
                    onChange={(e) =>
                      setConfiguration((prev) => ({ ...prev, audience: e.target.value }))
                    }
                    placeholder="e.g., CTO, VP Engineering, Technical Decision Makers"
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone" className="text-sm font-semibold text-gray-700">
                    Tone
                  </Label>
                  <Select
                    value={configuration.tone}
                    onValueChange={(value) =>
                      setConfiguration((prev) => ({ ...prev, tone: value }))
                    }
                  >
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cta" className="text-sm font-semibold text-gray-700">
                    Call to Action
                  </Label>
                  <Input
                    id="cta"
                    value={configuration.cta}
                    onChange={(e) =>
                      setConfiguration((prev) => ({ ...prev, cta: e.target.value }))
                    }
                    placeholder="e.g., Schedule 15-min call, Download whitepaper"
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                    Custom Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={configuration.notes}
                    onChange={(e) =>
                      setConfiguration((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Any specific points to include or messaging to emphasize..."
                    rows={3}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setStep("select")}
                className="h-10 px-6 border-2 hover:bg-gray-50 shadow-md"
              >
                Back
              </Button>
              <Button
                onClick={handleGenerate}
                className="h-10 px-6 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Generate Email
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isGenerating) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 max-w-md w-full text-center shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-400 blur-2xl opacity-30 animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin relative z-10" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Generating Email...
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">Analyzing context</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="font-medium text-purple-800">Crafting message</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 opacity-50">
                    <span className="text-gray-600">Optimizing content</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Email Output"
        subtitle="Review and customize your AI-generated email"
      />

      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Banner */}
          <Card className="p-4 border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Email generated successfully!
                </p>
                <p className="text-xs text-gray-600">
                  Review the content below and make any edits before sending
                </p>
              </div>
            </div>
          </Card>

          {/* Subject Line */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all">
            <Label htmlFor="subject" className="text-sm font-semibold text-gray-900 mb-2 block">
              Subject Line
            </Label>
            <Input
              id="subject"
              value={generatedEmail.subject}
              onChange={(e) =>
                setGeneratedEmail((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="font-medium border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </Card>

          {/* Email Body */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all">
            <Label htmlFor="body" className="text-sm font-semibold text-gray-900 mb-2 block">
              Email Body
            </Label>
            <Textarea
              id="body"
              value={generatedEmail.body}
              onChange={(e) =>
                setGeneratedEmail((prev) => ({ ...prev, body: e.target.value }))
              }
              rows={16}
              className="font-mono text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                className="h-10 px-6 gap-2 border-2 hover:bg-gray-50 shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleCopy}
                className="h-10 px-6 gap-2 border-2 hover:bg-gray-50 shadow-md"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button
                onClick={handleSave}
                className="h-10 px-6 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
