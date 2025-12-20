import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Baby, MapPin, Calendar, ArrowLeft, User, Mail, Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "@/services/api_service";
import { Category } from "@/services/api_types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STATES = [
  "All States",
  "Queensland",
  "New South Wales",
  "Tasmania",
  "South Australia",
  "Victoria",
  "Western Australia",
  "Northern Territory"
];

interface Child {
  _id: string;
  firstName: string;
  avatar?: string;
  age?: number;
  dob?: string;
  state?: string;
  createdAt: string;
  parentName: string;
  parentEmail: string;
  statusCategory?: {
    name: string;
    color: string;
  };
}

const ChildSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-muted/80"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 bg-muted/80 rounded"></div>
          <div className="h-4 w-48 bg-muted/80 rounded"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function ReportCategoryDetail() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("All States");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const hasFetched = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!hasFetched.current && categoryId) {
        hasFetched.current = true;
        if (isMounted) {
          await Promise.all([fetchCategory(), fetchChildren()]);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  useEffect(() => {
    if (hasFetched.current) {
      fetchChildren();
    }
  }, [page]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (hasFetched.current) {
        setPage(1);
        fetchChildren();
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedState, fromDate, toDate]);

  const fetchCategory = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success) {
        const foundCategory = response.data.find((cat: Category) => cat._id === categoryId);
        if (foundCategory) {
          setCategory(foundCategory);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch category");
    }
  };

  const fetchChildren = async () => {
    if (!categoryId) return;

    try {
      setLoading(true);

      const params: any = {
        page,
        limit: 10,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedState !== "All States") {
        params.state = selectedState;
      }

      if (fromDate) {
        params.fromDate = fromDate.toISOString();
      }

      if (toDate) {
        params.toDate = toDate.toISOString();
      }

      const response = await apiService.getReportCategoryDetail(categoryId, params);

      if (response.success) {
        const formattedChildren: Child[] = response.data.data.map((item) => ({
          _id: item.children._id,
          firstName: item.children.firstName,
          avatar: item.children.avatar,
          dob: item.children.dob,
          state: item.children.state,
          createdAt: item.children.createdAt,
          parentName: item.parent.name,
          parentEmail: item.parent.email,
          statusCategory: {
            name: item.statusCategory.name,
            color: item.statusCategory.color,
          },
        }));

        setChildren(formattedChildren);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.total);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch children");
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedState("All States");
    setFromDate(undefined);
    setToDate(undefined);
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);

      const csvRows = [];
      csvRows.push(["Child Name", "Parent Name", "Parent Email", "Age", "Location", "Status", "Registered Date"]);

      children.forEach(child => {
        const age = calculateAge(child.dob) || "N/A";
        const status = child.statusCategory?.name || "No Status";
        csvRows.push([
          child.firstName,
          child.parentName,
          child.parentEmail,
          age.toString(),
          child.state || "N/A",
          status,
          format(new Date(child.createdAt), "MMM dd, yyyy")
        ]);
      });

      const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${category?.name || 'category'}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setIsExportDialogOpen(false);
      toast.success(`CSV exported successfully with ${children.length} children`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text(`${category?.name || 'Category'} Report`, 14, 22);

      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Children: ${children.length}`, 14, 36);

      const tableData: any[] = [];

      children.forEach(child => {
        const age = calculateAge(child.dob) || "N/A";
        const status = child.statusCategory?.name || "No Status";

        tableData.push([
          child.firstName,
          child.parentName,
          child.parentEmail,
          age.toString(),
          child.state || "N/A",
          status,
          format(new Date(child.createdAt), "MMM dd, yyyy")
        ]);
      });

      autoTable(doc, {
        head: [['Child Name', 'Parent Name', 'Parent Email', 'Age', 'Location', 'Status', 'Registered']],
        body: tableData,
        startY: 45,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [76, 175, 80], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 45 },
      });

      doc.save(`${category?.name || 'category'}_report_${new Date().toISOString().split('T')[0]}.pdf`);

      setIsExportDialogOpen(false);
      toast.success(`PDF exported successfully with ${children.length} children`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/reports")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{category?.name || "Category"} Report</h1>
            <p className="text-muted-foreground">{category?.description}</p>
          </div>
        </div>
        <Button onClick={() => setIsExportDialogOpen(true)} disabled={children.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>

            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !fromDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {fromDate ? format(fromDate, "PPP") : "From Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !toDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {toDate ? format(toDate, "PPP") : "To Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {(searchQuery || selectedState !== "All States" || fromDate || toDate) && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Children List ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, index) => (
                <ChildSkeleton key={index} />
              ))}
            </div>
          ) : children.length > 0 ? (
            <>
              <div className="space-y-2">
                {children.map((child) => {
                  const age = calculateAge(child.dob);
                  const status = child.statusCategory?.name || "No Status";
                  const statusColor = child.statusCategory?.color || "#999";
                  return (
                    <Card key={child._id} className="hover-scale transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {child.avatar ? (
                              <img src={child.avatar} alt={child.firstName} className="w-full h-full object-cover" />
                            ) : (
                              <Baby className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{child.firstName}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{child.parentName}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{child.parentEmail}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm mt-2">
                              {age && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Baby className="h-3 w-3" />
                                  <span className="font-medium text-foreground">{age} years</span>
                                </div>
                              )}
                              {child.state && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span className="font-medium text-foreground">{child.state}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span className="font-medium text-foreground">{format(new Date(child.createdAt), "MMM dd, yyyy")}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Baby className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Children Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedState !== "All States" || fromDate || toDate
                    ? "Try adjusting your filters"
                    : "No children in this category"}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Report Data</DialogTitle>
            <DialogDescription>
              Choose the format you want to export the report data
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={handleExportCSV}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
              )}
              <span className="font-semibold">
                {exporting ? "Exporting..." : "Export as CSV"}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={handleExportPDF}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
              ) : (
                <FileText className="h-8 w-8 text-red-600" />
              )}
              <span className="font-semibold">
                {exporting ? "Exporting..." : "Export as PDF"}
              </span>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)} disabled={exporting}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}