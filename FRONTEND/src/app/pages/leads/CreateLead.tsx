import { useNavigate } from "react-router";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import MainLayout from "@/app/components/MainLayout";
import PageHeader from "@/app/components/PageHeader";
import { Loader2, Sparkles, CheckCircle2, Plus, X, Upload, FileText, Paperclip } from "lucide-react";
import { toast } from "sonner";
import api from "@/app/utils/api.ts";

interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  linkedIn: string;
}

export default function CreateLead() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "", title: "", email: "", linkedIn: "" },
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    industry: "",
    companySize: "",
    budget: "",
    timeline: "",
    painPoints: "",
    leadSource: "",
    notes: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (id: string, field: keyof Contact, value: string) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    );
  };

  const addContact = () => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name: "",
      title: "",
      email: "",
      linkedIn: "",
    };
    setContacts((prev) => [...prev, newContact]);
  };

  const removeContact = (id: string) => {
    if (contacts.length > 1) {
      setContacts((prev) => prev.filter((contact) => contact.id !== id));
    } else {
      toast.error("At least one contact is required");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
    toast.success(`${files.length} file(s) uploaded`);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName || !formData.industry) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        company: {
          name: formData.companyName,
          website: formData.website,
          size: formData.companySize
        },
        business_context: {
          industry: formData.industry,
          estimated_budget: formData.budget,
          timeline: formData.timeline,
          pain_points_requirements_text: formData.painPoints
        },
        contacts: contacts.map((c, index) => ({
          name: c.name,
          job_title: c.title,
          email: c.email,
          linkedin: c.linkedIn,
          is_primary: index === 0
        })),
        sales_qualification: {
          lead_source: formData.leadSource,
          additional_note: formData.notes || "New Lead"
        }
      };

      const form = new FormData();
      form.append("lead_data", JSON.stringify(payload));

      for (const file of uploadedFiles) {
        form.append("files", file);
      }

      // 1. Create the lead
      const leadResponse = await api.post("/leads", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const leadId = leadResponse.data?.lead_id;

      if (!leadId) {
        throw new Error("Lead ID not returned from backend");
      }

      // --- THE FIX ---
      // Add a 1.5 second delay to allow the DB to finish saving/indexing
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 2. Call intelligence endpoint (Awaited for immediate feedback)
      const alignmentResponse = await api.get(
        `/intelligence/service-alignment/${leadId}`,
        { timeout: 60000 }
      );

      // 3. Trigger LinkedIn Validation (Background - don't await full result)
      // Fire and forget to start the background process
      api.get(`/intelligence/validate-profile/${leadId}`).catch(() => {
        // Silently catch - the ServiceAlignment page will handle the polling/status
      });

      toast.success("Lead created and analyzed!");

      // 4. Navigate using the 'initialData' key
      navigate(`/intelligence/alignment/${leadId}`, {
        state: {
          initialData: alignmentResponse.data,
        },
      });
    } catch (error: any) {
      console.error("Submission Error:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to analyze lead. Database may be slow.";
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };
  // Render Loading State
  if (isSubmitting) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 max-w-md w-full text-center shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-30 animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin relative z-10" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Analyzing Lead...
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">Understanding business context</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="font-medium text-blue-800">Mapping services</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
                    <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                    <span className="font-medium text-purple-800">Initializing LinkedIn validation</span>
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
        title="Create Lead"
        subtitle="Add a new sales opportunity to your pipeline"
      />

      <div className="p-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Company Details Section */}
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Company Details</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-semibold text-gray-700">
                      Company Name *
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("companyName", e.target.value)}
                      placeholder="Enter company name"
                      required
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-semibold text-gray-700">
                      Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("website", e.target.value)}
                      placeholder="https://example.com"
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companySize" className="text-sm font-semibold text-gray-700">
                      Company Size
                    </Label>
                    <Select
                      value={formData.companySize}
                      onValueChange={(value: string) => handleInputChange("companySize", value)}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup (1-50)</SelectItem>
                        <SelectItem value="sme">SME (51-200)</SelectItem>
                        <SelectItem value="midmarket">Mid-Market (201-1000)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Business Context Section */}
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Business Context</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-sm font-semibold text-gray-700">
                      Industry *
                    </Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value: string) => handleInputChange("industry", value)}
                      required
                    >
                      <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fintech">FinTech</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-sm font-semibold text-gray-700">
                      Estimated Budget
                    </Label>
                    <Select
                      value={formData.budget}
                      onValueChange={(value: string) => handleInputChange("budget", value)}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<50k">&lt;$50K</SelectItem>
                        <SelectItem value="50k-100k">$50K-$100K</SelectItem>
                        <SelectItem value="100k-250k">$100K-$250K</SelectItem>
                        <SelectItem value="250k-500k">$250K-$500K</SelectItem>
                        <SelectItem value="500k-1m">$500K-$1M</SelectItem>
                        <SelectItem value=">1m">&gt;$1M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeline" className="text-sm font-semibold text-gray-700">
                      Project Timeline
                    </Label>
                    <Select
                      value={formData.timeline}
                      onValueChange={(value: string) => handleInputChange("timeline", value)}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate (&lt;1 month)</SelectItem>
                        <SelectItem value="short">Short-term (1-3 months)</SelectItem>
                        <SelectItem value="medium">Medium-term (3-6 months)</SelectItem>
                        <SelectItem value="long">Long-term (6+ months)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="painPoints" className="text-sm font-semibold text-gray-700">
                    Pain Points & Requirements
                  </Label>
                  <Textarea
                    id="painPoints"
                    value={formData.painPoints}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("painPoints", e.target.value)}
                    placeholder="Describe the client's challenges, needs, and goals..."
                    rows={4}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>
            </Card>

            {/* Primary Contacts Section */}
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Primary Contacts</h3>
                </div>
                <Button
                  type="button"
                  onClick={addContact}
                  size="sm"
                  className="h-9 gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Contact
                </Button>
              </div>

              <div className="space-y-6">
                {contacts.map((contact, index) => (
                  <div key={contact.id} className="relative">
                    {contacts.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContact(contact.id)}
                        className="absolute -right-2 -top-2 h-8 w-8 p-0 rounded-full bg-red-50 hover:bg-red-100 text-red-600 z-10 shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    <div className={`p-4 rounded-lg border-2 ${index === 0 ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-white'}`}>
                      <p className="text-xs font-semibold text-gray-500 mb-3">
                        Contact #{index + 1} {index === 0 && "(Primary)"}
                      </p>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">
                              Contact Name
                            </Label>
                            <Input
                              value={contact.name}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactChange(contact.id, "name", e.target.value)}
                              placeholder="John Doe"
                              className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">
                              Job Title
                            </Label>
                            <Input
                              value={contact.title}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactChange(contact.id, "title", e.target.value)}
                              placeholder="CTO, VP Engineering, etc."
                              className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">
                              Email
                            </Label>
                            <Input
                              type="email"
                              value={contact.email}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactChange(contact.id, "email", e.target.value)}
                              placeholder="john@example.com"
                              className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">
                              LinkedIn Profile
                            </Label>
                            <Input
                              value={contact.linkedIn}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactChange(contact.id, "linkedIn", e.target.value)}
                              placeholder="https://linkedin.com/in/..."
                              className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Upload Project Documents Section */}
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Upload Project Documents</h3>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 bg-orange-50/50 hover:bg-orange-100/50 transition-all">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <Paperclip className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-900">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, DOC, DOCX, PPT, PPTX (Max 10MB each)
                        </p>
                      </div>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                    />
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">
                      Uploaded Files ({uploadedFiles.length})
                    </p>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                            <FileText className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-red-50 text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Sales Qualification Section */}
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Sales Qualification</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="leadSource" className="text-sm font-semibold text-gray-700">
                    Lead Source
                  </Label>
                  <Select
                    value={formData.leadSource}
                    onValueChange={(value: string) => handleInputChange("leadSource", value)}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
                      <SelectValue placeholder="Select lead source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="event">Event/Conference</SelectItem>
                      <SelectItem value="cold-outreach">Cold Outreach</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("notes", e.target.value)}
                    placeholder="Any additional context, meeting notes, or important information..."
                    rows={3}
                    className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="sticky bottom-0 mt-6 p-4 bg-gradient-to-r from-white to-blue-50 border-t-2 border-blue-200 rounded-lg shadow-2xl z-20">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="h-10 px-6 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-semibold shadow-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-6 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-5 h-5" />
                Create Lead & Analyze
              </Button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}