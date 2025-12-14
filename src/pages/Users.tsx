import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Baby, MapPin, Phone, Download, FileText, FileSpreadsheet, Loader2, UserX, UserCheck } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { apiService } from "@/services/api_service";
import { UserData } from "@/services/api_types";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const UserSkeleton = () => (
  <Card className="animate-pulse">
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-muted/80"></div>
        <div className="space-y-2">
          <div className="h-5 w-32 bg-muted/80 rounded"></div>
          <div className="h-4 w-48 bg-muted/80 rounded"></div>
        </div>
      </div>
      <div className="h-7 w-24 bg-muted/80 rounded"></div>
    </div>
  </Card>
);

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const hasFetched = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      if (!hasFetched.current) {
        hasFetched.current = true;
        if (isMounted) {
          await fetchUsers();
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasFetched.current) {
      fetchUsers();
    }
  }, [page, statusFilter, pageLimit]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (hasFetched.current) {
        setPage(1);
        fetchUsers();
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageLimit === -1 ? 1000 : pageLimit,
        search: searchQuery || undefined,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await apiService.getUsers(params);

      if (response.success) {
        setUsers(response.data.users);
        setTotalRecords(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (value: string) => {
    const newLimit = value === "all" ? -1 : parseInt(value);
    setPageLimit(newLimit);
    setPage(1);
  };

  const handleOpenStatusDialog = (user: UserData) => {
    setSelectedUser(user);
    setIsStatusDialogOpen(true);
  };

  const handleUpdateUserStatus = async (status: string) => {
    if (!selectedUser) return;

    setUpdating(true);
    try {
      const response = await apiService.updateUserStatus(selectedUser._id, status);
      if (response.success) {
        toast.success(response.message || `User ${status === "inactive" ? "deactivated" : "activated"} successfully`);
        await fetchUsers();
        setIsStatusDialogOpen(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status");
    } finally {
      setUpdating(false);
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

  const handleExportCSV = async () => {
    try {
      setExporting(true);

      const allUsers: UserData[] = [];
      let currentPage = 1;
      let totalPagesToFetch = 1;

      do {
        const params: any = {
          page: currentPage,
          limit: 10,
          search: searchQuery || undefined,
        };

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        const response = await apiService.getUsers(params);

        if (response.success) {
          allUsers.push(...response.data.users);
          totalPagesToFetch = response.data.pagination.totalPages;
          currentPage++;
        } else {
          break;
        }
      } while (currentPage <= totalPagesToFetch);

      const csvRows = [];
      csvRows.push(["Parent Name", "Parent Email", "Parent Phone", "Status", "Child Name", "Child Age", "Child Status", "Child Location"]);

      allUsers.forEach(user => {
        const userStatus = user.status || "active";
        if (user.childrens.length === 0) {
          csvRows.push([
            user.name,
            user.email,
            user.mobile || "N/A",
            userStatus,
            "No children added yet",
            "N/A",
            "N/A",
            "N/A"
          ]);
        } else {
          user.childrens.forEach(child => {
            const age = child.age || calculateAge(child.dob) || "N/A";
            const status = child.lastMessage?.statusCategory?.name || "No Status";
            csvRows.push([
              user.name,
              user.email,
              user.mobile || "N/A",
              userStatus,
              child.firstName,
              age.toString(),
              status,
              child.state || "N/A"
            ]);
          });
        }
      });

      const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setIsExportDialogOpen(false);
      toast.success(`CSV exported successfully with ${allUsers.length} users`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);

      const allUsers: UserData[] = [];
      let currentPage = 1;
      let totalPagesToFetch = 1;

      do {
        const params: any = {
          page: currentPage,
          limit: 10,
          search: searchQuery || undefined,
        };

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        const response = await apiService.getUsers(params);

        if (response.success) {
          allUsers.push(...response.data.users);
          totalPagesToFetch = response.data.pagination.totalPages;
          currentPage++;
        } else {
          break;
        }
      } while (currentPage <= totalPagesToFetch);

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Users Export Report', 14, 22);

      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Users: ${allUsers.length}`, 14, 36);

      const tableData: any[] = [];

      allUsers.forEach(user => {
        const userStatus = user.status || "active";
        if (user.childrens.length === 0) {
          tableData.push([
            user.name,
            user.email,
            user.mobile || "N/A",
            userStatus,
            "No children added yet",
            "N/A",
            "N/A",
            "N/A"
          ]);
        } else {
          user.childrens.forEach(child => {
            const age = child.age || calculateAge(child.dob) || "N/A";
            const status = child.lastMessage?.statusCategory?.name || "No Status";

            tableData.push([
              user.name,
              user.email,
              user.mobile || "N/A",
              userStatus,
              child.firstName,
              age.toString(),
              status,
              child.state || "N/A"
            ]);
          });
        }
      });

      autoTable(doc, {
        head: [['Parent Name', 'Parent Email', 'Parent Phone', 'Status', 'Child Name', 'Child Age', 'Child Status', 'Child Location']],
        body: tableData,
        startY: 45,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [76, 175, 80], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 45 },
      });

      doc.save(`users_export_${new Date().toISOString().split('T')[0]}.pdf`);

      setIsExportDialogOpen(false);
      toast.success(`PDF exported successfully with ${allUsers.length} users`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export PDF");
    } finally {
      setExporting(false);
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <Button onClick={() => setIsExportDialogOpen(true)} disabled={users.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Parent Users
            </CardTitle>
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                  <SelectItem value="inactive">Deactivated Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, index) => (
                <UserSkeleton key={index} />
              ))}
            </div>
          ) : users.length > 0 ? (
            <>
              <div className="space-y-2">
                {users.map((user) => {
                  const isDeactivated = user.status === "inactive";
                  return (
                    <Collapsible key={user._id}>
                      <Card className="hover-scale transition-all">
                        <CollapsibleTrigger className="w-full">
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Users className="h-6 w-6 text-primary" />
                                )}
                              </div>
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-lg">{user.name}</p>
                                  {isDeactivated && (
                                    <Badge variant="destructive" className="text-xs">
                                      Deactivated
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                  <span>{user.email}</span>
                                  {user.mobile && (
                                    <>
                                      <span>•</span>
                                      <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        <span>{user.mobile}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-base px-3 py-1">
                                {user.childrenCount} {user.childrenCount === 1 ? "Child" : "Children"}
                              </Badge>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenStatusDialog(user);
                                }}
                                className="h-9 w-9"
                              >
                                {isDeactivated ? (
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                ) : (
                                  <UserX className="h-4 w-4 text-orange-600" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-2 border-t">
                            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Baby className="h-4 w-4" />
                              Children Profiles
                            </p>
                            {user.childrens.length === 0 ? (
                              <Card className="bg-muted/50">
                                <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                                  <Baby className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                                  <p className="text-muted-foreground font-medium">No children added yet</p>
                                  <p className="text-sm text-muted-foreground mt-1">This parent hasn't registered any children</p>
                                </CardContent>
                              </Card>
                            ) : (
                              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {user.childrens.map((child) => {
                                  const age = child.age || calculateAge(child.dob);
                                  const status = child.lastMessage?.statusCategory?.name || "No Status";
                                  const statusColor = child.lastMessage?.statusCategory?.color || "#999";

                                  return (
                                    <Card key={child._id} className="bg-muted/50">
                                      <CardContent className="p-4 space-y-2">
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center gap-3">
                                            {child.avatar && (
                                              <div className="w-10 h-10 rounded-full overflow-hidden">
                                                <img src={child.avatar} alt={child.firstName} className="w-full h-full object-cover" />
                                              </div>
                                            )}
                                            <div>
                                              <p className="font-semibold text-base">{child.firstName}</p>
                                              <p className="text-sm text-muted-foreground">
                                                {age ? `Age: ${age} years` : "Age not available"}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="pt-2 space-y-2">
                                          <div className="flex items-center gap-2">
                                            <div
                                              className="w-2 h-2 rounded-full"
                                              style={{ backgroundColor: statusColor }}
                                            />
                                            <p className="text-xs font-medium">{status}</p>
                                          </div>
                                          {child.state && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                              <MapPin className="h-3 w-3" />
                                              <span>{child.state}</span>
                                            </div>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>

              {!loading && users.length > 0 && (
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
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search criteria" : "No users available"}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Users Data</DialogTitle>
            <DialogDescription>
              Choose the format you want to export the users data
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

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.status === "inactive" ? "Activate User" : "Deactivate User"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.status === "inactive"
                ? `Are you sure you want to activate "${selectedUser?.name}"? This will restore their account access.`
                : `Are you sure you want to deactivate "${selectedUser?.name}"? This will disable their account access.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)} disabled={updating}>
              Cancel
            </Button>
            <Button
              variant={selectedUser?.status === "inactive" ? "default" : "destructive"}
              onClick={() => handleUpdateUserStatus(selectedUser?.status === "inactive" ? "active" : "inactive")}
              disabled={updating}
            >
              {updating ? "Processing..." : selectedUser?.status === "inactive" ? "Activate" : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}