import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, UserCog, Plus, Edit, Trash2, Mail, Phone, Loader2, X, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { apiService } from "@/services/api_service";
import { Admin } from "@/services/api_types";

const AdminCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted/80"></div>
          <div className="space-y-2">
            <div className="h-5 w-32 bg-muted/80 rounded"></div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-40 bg-muted/80 rounded"></div>
              <div className="h-4 w-24 bg-muted/80 rounded"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-7 w-20 bg-muted/80 rounded"></div>
          <div className="h-9 w-9 bg-muted/80 rounded"></div>
          <div className="h-9 w-9 bg-muted/80 rounded"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "ADMIN",
    avatar: null as File | null,
  });

  const [originalFormData, setOriginalFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "ADMIN",
  });

  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAdmins();
    }, searchQuery ? 500 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [page, searchQuery]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdmins({
        page,
        limit: 10,
        search: searchQuery || undefined,
      });

      if (response.success) {
        setAdmins(response.data.admins);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      role: "ADMIN",
      avatar: null,
    });
    setOriginalFormData({
      name: "",
      email: "",
      mobile: "",
      role: "ADMIN",
    });
    setAvatarPreview("");
  };

  const handleCreateAdmin = async () => {
    if (!formData.name || !formData.email || !formData.mobile) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiService.createAdmin(formData);

      if (response.success) {
        toast.success(response.message || "Admin created successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        fetchAdmins();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    const initialData = {
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile,
      role: admin.role,
    };
    setFormData({
      ...initialData,
      avatar: null,
    });
    setOriginalFormData(initialData);
    setAvatarPreview(admin.avatar || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateAdmin = async () => {
    if (!selectedAdmin || !formData.name || !formData.email || !formData.mobile) {
      toast.error("Please fill in all required fields");
      return;
    }

    const updatedFields: any = {};

    if (formData.name !== originalFormData.name) {
      updatedFields.name = formData.name;
    }
    if (formData.email !== originalFormData.email) {
      updatedFields.email = formData.email;
    }
    if (formData.mobile !== originalFormData.mobile) {
      updatedFields.mobile = formData.mobile;
    }
    if (formData.role !== originalFormData.role) {
      updatedFields.role = formData.role;
    }
    if (formData.avatar) {
      updatedFields.avatar = formData.avatar;
    }

    if (Object.keys(updatedFields).length === 0) {
      toast.info("No changes detected");
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiService.updateAdmin(selectedAdmin._id, updatedFields);

      if (response.success) {
        toast.success(response.message || "Admin updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
        setSelectedAdmin(null);
        fetchAdmins();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      setSubmitting(true);
      const response = await apiService.deleteAdmin(selectedAdmin._id);

      if (response.success) {
        toast.success(response.message || "Admin deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedAdmin(null);
        fetchAdmins();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Admin Users
            </CardTitle>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <AdminCardSkeleton key={index} />
              ))}
            </div>
          ) : admins.length > 0 ? (
            <>
              <div className="space-y-3">
                {admins.map((admin) => (
                  <Card key={admin._id} className="hover-scale transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {admin.avatar ? (
                              <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover" />
                            ) : (
                              <UserCog className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{admin.name}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{admin.email}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{admin.mobile}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-base px-3 py-1">
                            {admin.role}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(admin)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(admin)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                <UserCog className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Admins Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search criteria" : "No admins available"}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>
              Create a new admin user for the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="avatar">Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <UserCog className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter admin name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile *</Label>
              <Input
                id="mobile"
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateAdmin} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Admin"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>
              Update admin user information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-avatar">Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <UserCog className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    id="edit-avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                placeholder="Enter admin name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mobile">Mobile *</Label>
              <Input
                id="edit-mobile"
                placeholder="Enter mobile number"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); setSelectedAdmin(null); }} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAdmin} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Admin"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the admin account for {selectedAdmin?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAdmin} disabled={submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}