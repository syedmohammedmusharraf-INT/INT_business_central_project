import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Slider } from "@/app/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Save, Sparkles, Building2, Briefcase, Users, Flame, Zap, Droplet } from "lucide-react";
import { Lead } from "@/data/mockData";

interface LeadProfileTabProps {
  lead: Lead;
}

export default function LeadProfileTab({ lead }: LeadProfileTabProps) {
  const getTemperatureIcon = (temperature: string) => {
    switch (temperature) {
      case "hot":
        return <Flame className="w-4 h-4" />;
      case "warm":
        return <Zap className="w-4 h-4" />;
      case "cold":
        return <Droplet className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Lead Score Summary */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Lead Score</h3>
            <p className="text-sm text-gray-600">AI-powered assessment of this opportunity</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              {getTemperatureIcon(lead.temperature)}
              <span className="text-3xl font-bold text-blue-600">{lead.score}%</span>
            </div>
            <Badge className="bg-green-100 text-green-800">High Confidence</Badge>
          </div>
        </div>
        <div className="mt-4 p-4 bg-white rounded-lg">
          <p className="text-sm text-gray-700">
            <Sparkles className="w-4 h-4 inline mr-1 text-yellow-500" />
            <strong>AI Insight:</strong> High-value opportunity with strong alignment to INT's
            expertise. Budget confirmed, immediate timeline. Recommend priority engagement.
          </p>
        </div>
      </Card>

      {/* Form Sections */}
      <Accordion type="multiple" defaultValue={["company", "business", "contact", "engagement"]} className="space-y-4">
        {/* Company Information */}
        <AccordionItem value="company" className="border-none">
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Company Information</span>
                <Badge variant="outline" className="ml-2">Required</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input id="companyName" defaultValue={lead.companyName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL *</Label>
                    <div className="flex gap-2">
                      <Input id="website" defaultValue={lead.website} placeholder="https://" />
                      <Button variant="outline" size="sm" className="gap-1">
                        <Sparkles className="w-4 h-4" />
                        Analyze
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select defaultValue={lead.industry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FinTech">FinTech</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Company Size *</Label>
                    <Select defaultValue={lead.size}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Startup (1-50)">Startup (1-50)</SelectItem>
                        <SelectItem value="SME (51-200)">SME (51-200)</SelectItem>
                        <SelectItem value="Mid-Market (201-1000)">Mid-Market (201-1000)</SelectItem>
                        <SelectItem value="Enterprise (1000+)">Enterprise (1000+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Primary Domains *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Web Development', 'Mobile Apps', 'Cloud Migration', 'AI/ML', 'DevOps', 'Data Engineering'].map((domain) => (
                      <div key={domain} className="flex items-center space-x-2">
                        <Checkbox id={domain} />
                        <label htmlFor={domain} className="text-sm cursor-pointer">
                          {domain}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Business Context */}
        <AccordionItem value="business" className="border-none">
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">Business Context & Challenges</span>
                <Badge variant="outline" className="ml-2">Required</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="painPoints">Pain Points & Challenges *</Label>
                  <Textarea
                    id="painPoints"
                    placeholder="Describe the client's business challenges..."
                    rows={4}
                    defaultValue="Legacy system modernization needed. Current infrastructure limiting scalability. Security compliance requirements for FinTech operations."
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Minimum 500 characters</span>
                    <Button variant="ghost" size="sm" className="gap-1 h-auto py-1">
                      <Sparkles className="w-3 h-3" />
                      AI Suggestions
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Digital Maturity Level *</Label>
                  <div className="pt-2 pb-4">
                    <Slider defaultValue={[70]} max={100} step={1} />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Low (Legacy)</span>
                      <span>Medium (Modernizing)</span>
                      <span>High (Cloud-Native)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Project Type *</Label>
                  <RadioGroup defaultValue="migration">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="new" />
                      <Label htmlFor="new" className="font-normal cursor-pointer">New Development</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="migration" id="migration" />
                      <Label htmlFor="migration" className="font-normal cursor-pointer">Migration / Modernization</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="enhancement" id="enhancement" />
                      <Label htmlFor="enhancement" className="font-normal cursor-pointer">Enhancement / Feature Addition</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Contact Information */}
        <AccordionItem value="contact" className="border-none">
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Contact Information</span>
                <Badge variant="outline" className="ml-2">Required</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 pb-6 space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-sm text-gray-900 mb-3">Primary Contact (SPOC)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Full Name *</Label>
                      <Input id="contactName" placeholder="John Smith" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation *</Label>
                      <Input id="designation" placeholder="CTO" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="john@company.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="linkedin">LinkedIn Profile URL *</Label>
                      <div className="flex gap-2">
                        <Input id="linkedin" placeholder="https://linkedin.com/in/johnsmith" />
                        <Button variant="outline" size="sm" className="gap-1">
                          <Sparkles className="w-4 h-4" />
                          Enrich
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  + Add Another Contact
                </Button>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Engagement Context */}
        <AccordionItem value="engagement" className="border-none">
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <span className="font-semibold">Engagement Context</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeline">Expected Timeline *</Label>
                    <Select defaultValue={lead.timeline}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Immediate (<1 month)">Immediate (&lt;1 month)</SelectItem>
                        <SelectItem value="Short-term (1-3 months)">Short-term (1-3 months)</SelectItem>
                        <SelectItem value="Medium-term (3-6 months)">Medium-term (3-6 months)</SelectItem>
                        <SelectItem value="Long-term (6+ months)">Long-term (6+ months)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range *</Label>
                    <Select defaultValue={lead.budget}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<$50K">&lt;$50K</SelectItem>
                        <SelectItem value="$50K-$100K">$50K-$100K</SelectItem>
                        <SelectItem value="$100K-$250K">$100K-$250K</SelectItem>
                        <SelectItem value="$250K-$500K">$250K-$500K</SelectItem>
                        <SelectItem value="$500K-$1M">$500K-$1M</SelectItem>
                        <SelectItem value=">$1M">&gt;$1M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Lead Temperature *</Label>
                  <RadioGroup defaultValue={lead.temperature}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hot" id="hot" />
                      <Label htmlFor="hot" className="font-normal cursor-pointer flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        Hot (Immediate need, budget approved)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="warm" id="warm" />
                      <Label htmlFor="warm" className="font-normal cursor-pointer flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Warm (Active exploration, near-term)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cold" id="cold" />
                      <Label htmlFor="cold" className="font-normal cursor-pointer flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-blue-500" />
                        Cold (Early stage, long-term)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

      {/* Bottom Actions */}
      <Card className="p-4 sticky bottom-0 bg-white border-t-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Last saved: <span className="font-medium">2 minutes ago</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              Cancel
            </Button>
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save & Continue to Alignment
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
