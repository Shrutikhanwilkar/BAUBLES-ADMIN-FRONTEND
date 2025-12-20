import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle, Clock, Loader2, Filter, X, Upload, FileImage } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiService } from "@/services/api_service";
import { Contact, ContactType } from "@/services/api_types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ContactSkeleton = () => (
  <Card className="shadow-card animate-pulse">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-muted/80"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 bg-muted/80 rounded"></div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-32 bg-muted/80 rounded"></div>
              <div className="h-4 w-24 bg-muted/80 rounded"></div>
            </div>
          </div>
        </div>
        <div className="h-6 w-20 bg-muted/80 rounded"></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-16 bg-muted/80 rounded"></div>
          <div className="h-4 w-full bg-muted/80 rounded"></div>
          <div className="h-4 w-3/4 bg-muted/80 rounded"></div>
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-4 w-20 bg-muted/80 rounded"></div>
          <div className="h-24 w-full bg-muted/80 rounded"></div>
          <div className="h-9 w-32 bg-muted/80 rounded"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Support() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [unresolvedCount, setUnresolvedCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"unresolved" | "resolved">("unresolved");
  const [solutions, setSolutions] = useState<Record<string, string>>({});
  const [solutionImages, setSolutionImages] = useState<Record<string, File[]>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ContactType | "all">("all");
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const contactTypes: (ContactType | "all")[] = ["all", "App Question", "Bauble Question", "Support", "Other"];

  useEffect(() => {
    fetchContacts();
  }, [activeTab, selectedType, page, pageLimit]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageLimit === -1 ? 1000 : pageLimit,
        isResolved: activeTab === "resolved",
      };

      if (selectedType !== "all") {
        params.type = selectedType;
      }

      const response = await apiService.getContacts(params);

      if (response.success) {
        setContacts(response.data.contacts);
        setResolvedCount(response.data.resolvedCount);
        setUnresolvedCount(response.data.unresolvedCount);
        setTotalRecords(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (value: string) => {
    const newLimit = value === "all" ? -1 : parseInt(value);
    setPageLimit(newLimit);
    setPage(1);
  };

  const handleSolutionChange = (id: string, value: string) => {
    setSolutions({ ...solutions, [id]: value });
  };

  const handleImageSelect = (id: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        validFiles.push(file);
        newPreviewUrls.push(URL.createObjectURL(file));
      } else {
        toast.error(`${file.name} is not a valid image or video file`);
      }
    });

    if (validFiles.length > 0) {
      const existingFiles = solutionImages[id] || [];
      const existingPreviews = previewUrls[id] || [];

      setSolutionImages({
        ...solutionImages,
        [id]: [...existingFiles, ...validFiles]
      });

      setPreviewUrls({
        ...previewUrls,
        [id]: [...existingPreviews, ...newPreviewUrls]
      });
    }
  };

  const handleRemoveImage = (id: string, index: number) => {
    const images = solutionImages[id] || [];
    const previews = previewUrls[id] || [];

    URL.revokeObjectURL(previews[index]);

    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setSolutionImages({ ...solutionImages, [id]: newImages });
    setPreviewUrls({ ...previewUrls, [id]: newPreviews });
  };

  const handleSubmit = async (id: string) => {
    const solution = solutions[id];

    if (!solution || !solution.trim()) {
      toast.error("Please enter a solution before submitting");
      return;
    }

    try {
      setSubmitting(id);

      const formData = new FormData();
      formData.append('solution', solution);

      const images = solutionImages[id] || [];
      images.forEach((file) => {
        formData.append('solutionImages', file);
      });

      const response = await apiService.resolveContact(id, formData);

      if (response.success) {
        toast.success("Query resolved successfully");
        setSolutions({ ...solutions, [id]: "" });
        setSolutionImages({ ...solutionImages, [id]: [] });

        const previews = previewUrls[id] || [];
        previews.forEach(url => URL.revokeObjectURL(url));
        setPreviewUrls({ ...previewUrls, [id]: [] });

        fetchContacts();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to resolve query");
    } finally {
      setSubmitting(null);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getDisplayRange = () => {
    if (pageLimit === -1) {
      return `Showing all ${totalRecords} entries`;
    }
    const start = (page - 1) * pageLimit + 1;
    const end = Math.min(page * pageLimit, totalRecords);
    return `Showing ${start}-${end} of ${totalRecords} entries`;
  };

  const isVideoFile = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {unresolvedCount} Pending
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 border-b flex-1">
          <button
            onClick={() => {
              setActiveTab("unresolved");
              setPage(1);
            }}
            className={`px-6 py-3 font-medium transition-colors relative ${activeTab === "unresolved"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Unresolved
              {unresolvedCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {unresolvedCount}
                </Badge>
              )}
            </div>
            {activeTab === "unresolved" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("resolved");
              setPage(1);
            }}
            className={`px-6 py-3 font-medium transition-colors relative ${activeTab === "resolved"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Resolved
              {resolvedCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {resolvedCount}
                </Badge>
              )}
            </div>
            {activeTab === "resolved" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedType}
            onValueChange={(value) => {
              setSelectedType(value as ContactType | "all");
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {contactTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "all" ? "All Types" : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, index) => (
            <ContactSkeleton key={index} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {contacts.map((contact) => (
              <Card key={contact._id} className="shadow-card hover-scale transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{contact.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                          {contact.mobile && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-sm text-muted-foreground">{contact.mobile}</p>
                            </>
                          )}
                          <span className="text-muted-foreground">•</span>
                          <p className="text-sm text-muted-foreground">{getTimeAgo(contact.createdAt)}</p>
                          {contact.type && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <Badge variant="outline" className="text-xs">
                                {contact.type}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={contact.isResolved ? "secondary" : "destructive"}
                    >
                      {contact.isResolved ? "resolved" : "unresolved"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Query:</p>
                      <p className="text-muted-foreground">{contact.message}</p>
                    </div>

                    {!contact.isResolved ? (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor={`solution-${contact._id}`}>Solution</Label>
                          <Textarea
                            id={`solution-${contact._id}`}
                            placeholder="Enter your solution here..."
                            value={solutions[contact._id] || ""}
                            onChange={(e) => handleSolutionChange(contact._id, e.target.value)}
                            rows={4}
                            disabled={submitting === contact._id}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Attach Images/Videos (Optional)</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRefs.current[contact._id]?.click()}
                              disabled={submitting === contact._id}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Files
                            </Button>
                            <input
                              ref={(el) => fileInputRefs.current[contact._id] = el}
                              type="file"
                              accept="image/*,video/*"
                              multiple
                              className="hidden"
                              onChange={(e) => handleImageSelect(contact._id, e.target.files)}
                              disabled={submitting === contact._id}
                            />
                            <span className="text-xs text-muted-foreground">
                              {(solutionImages[contact._id]?.length || 0)} file(s) selected
                            </span>
                          </div>

                          {previewUrls[contact._id]?.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-2">
                              {previewUrls[contact._id].map((url, index) => (
                                <div key={index} className="relative group">
                                  {isVideoFile(solutionImages[contact._id][index].name) ? (
                                    <video
                                      src={url}
                                      className="w-full h-24 object-cover rounded-lg border"
                                    />
                                  ) : (
                                    <img
                                      src={url}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-24 object-cover rounded-lg border"
                                    />
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(contact._id, index)}
                                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    disabled={submitting === contact._id}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSubmit(contact._id)}
                          disabled={submitting === contact._id}
                        >
                          {submitting === contact._id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Solution"
                          )}
                        </Button>
                      </div>
                    ) : (
                      contact.solution && (
                        <div className="pt-2 border-t space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-2 text-green-600 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Solution:
                            </p>
                            <p className="text-muted-foreground bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                              {contact.solution}
                            </p>
                          </div>

                          {contact.solutionImages && contact.solutionImages.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <FileImage className="h-4 w-4" />
                                Attachments:
                              </p>
                              <div className="grid grid-cols-4 gap-2">
                                {contact.solutionImages.map((imageUrl, index) => (
                                  <div key={index} className="relative group cursor-pointer">
                                    {isVideoFile(imageUrl) ? (
                                      <video
                                        src={imageUrl}
                                        className="w-full h-24 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                                        onClick={() => setLightboxImage(imageUrl)}
                                        controls
                                      />
                                    ) : (
                                      <img
                                        src={imageUrl}
                                        alt={`Solution attachment ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                                        onClick={() => setLightboxImage(imageUrl)}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {contacts.length === 0 && (
            <Card className="shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-16">
                {activeTab === "unresolved" ? (
                  <>
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                    <p className="text-muted-foreground">
                      No unresolved support queries at the moment
                    </p>
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Resolved Queries</h3>
                    <p className="text-muted-foreground">
                      Resolved queries will appear here
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {!loading && contacts.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {getDisplayRange()}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select
                  value={pageLimit === -1 ? "all" : pageLimit.toString()}
                  onValueChange={handleLimitChange}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">entries</span>
              </div>
            </div>
          )}
        </>
      )}

      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="h-8 w-8" />
          </button>
          {isVideoFile(lightboxImage) ? (
            <video
              src={lightboxImage}
              className="max-w-full max-h-full"
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={lightboxImage}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}