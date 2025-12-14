import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Star, TrendingUp, AlertTriangle, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiService } from "@/services/api_service";
import { Category, ApiError } from "@/services/api_types";

const CategorySkeleton = () => (
  <Card className="shadow-card animate-pulse">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-muted/80"></div>
          <div className="space-y-2">
            <div className="h-5 w-32 bg-muted/80 rounded"></div>
            <div className="h-4 w-20 bg-muted/80 rounded"></div>
          </div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-muted/80 rounded"></div>
        <div className="h-4 w-3/4 bg-muted/80 rounded"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 flex-1 bg-muted/80 rounded"></div>
        <div className="h-9 flex-1 bg-muted/80 rounded"></div>
      </div>
    </CardContent>
  </Card>
);

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // const [isDeleting, setIsDeleting] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryColor, setCategoryColor] = useState("#66BB6A");
  const [categoryRank, setCategoryRank] = useState(1);
  const [categoryIcon, setCategoryIcon] = useState("Star");

  const hasFetched = useRef(false);

  const iconOptions = [
    { value: "Star", label: "Star", component: Star },
    { value: "TrendingUp", label: "Trending Up", component: TrendingUp },
    { value: "AlertTriangle", label: "Alert Triangle", component: AlertTriangle },
    { value: "XCircle", label: "X Circle", component: XCircle },
  ];

  const iconMapping: { [key: number]: string } = {
    1: "Star",
    2: "TrendingUp",
    3: "AlertTriangle",
    4: "XCircle",
  };

  const getIconComponent = (rank: number) => {
    let iconName: string;

    if (rank >= 4) {
      iconName = "XCircle";
    } else {
      iconName = iconMapping[rank] || "Star";
    }

    const icon = iconOptions.find(opt => opt.value === iconName);
    return icon ? icon.component : Star;
  };

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      if (!hasFetched.current) {
        hasFetched.current = true;
        const role = localStorage.getItem("userRole");
        setUserRole(role || "");
        if (isMounted) {
          await fetchCategories();
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleOpenDeleteDialog = (category: Category) => {
  //   if (userRole !== "SUPERADMIN") {
  //     toast.error("Only Super Admin can delete categories");
  //     return;
  //   }
  //   setDeletingCategory(category);
  //   setIsDeleteDialogOpen(true);
  // };

  // const handleDelete = async () => {
  //   if (!deletingCategory) return;

  //   setIsDeleting(true);
  //   try {
  //     const response = await apiService.deleteCategory(deletingCategory._id);
  //     if (response.success) {
  //       toast.success(response.message || "Category deleted successfully");
  //       await fetchCategories();
  //       setIsDeleteDialogOpen(false);
  //       setDeletingCategory(null);
  //     }
  //   } catch (error) {
  //     const apiError = error as ApiError;
  //     toast.error(apiError.message || "Failed to delete category");
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  const handleOpenDialog = (category: Category | null = null) => {
    if (userRole !== "SUPERADMIN") {
      toast.error("Only Super Admin can manage categories");
      return;
    }

    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryDescription(category.description);
      setCategoryColor(category.color);
      setCategoryRank(category.visibilityRank);
      setCategoryIcon(iconMapping[category.visibilityRank] || "Star");
      setIsDialogOpen(true);
    } else {
      // if (categories.length >= 4) {
      //   toast.error("Maximum 4 categories allowed");
      //   return;
      // }
      setEditingCategory(null);
      setCategoryName("");
      setCategoryDescription("");
      setCategoryColor("#66BB6A");
      setCategoryRank(categories.length + 1);
      setCategoryIcon("Star");
      setIsDialogOpen(true);
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!categoryDescription.trim()) {
      toast.error("Category description is required");
      return;
    }

    setIsSaving(true);

    try {
      const categoryData = {
        name: categoryName,
        description: categoryDescription,
        color: categoryColor,
        visibilityRank: categoryRank,
      };

      if (editingCategory) {
        const response = await apiService.updateCategory(editingCategory._id, categoryData);
        if (response.success) {
          toast.success(response.message || "Category updated successfully");
          await fetchCategories();
        }
      } 
      // else {
      //   const response = await apiService.createCategory(categoryData);
      //   if (response.success) {
      //     toast.success(response.message || "Category added successfully");
      //     await fetchCategories();
      //   }
      // }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setCategoryName("");
    setCategoryDescription("");
    setCategoryColor("#66BB6A");
    setCategoryRank(1);
    setCategoryIcon("Star");
    setEditingCategory(null);
  };

  const isSuperAdmin = userRole === "SUPERADMIN";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Behaviour Categories</h1>
        {/* {isSuperAdmin && (
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        )} */}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <CategorySkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const IconComponent = getIconComponent(category.visibilityRank);
            return (
              <Card key={category._id} className="shadow-card hover-scale transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color + '30' }}
                      >
                        <IconComponent className="h-6 w-6" style={{ color: category.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">Rank: {category.visibilityRank}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                  {isSuperAdmin && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenDeleteDialog(category)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button> */}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category details below."
                : "Create a new category by filling in the details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
                disabled={isSaving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Enter category description"
                disabled={isSaving}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rank">Visibility Rank</Label>
              <Input
                id="rank"
                type="number"
                min="1"
                max="10"
                value={categoryRank}
                onChange={(e) => setCategoryRank(parseInt(e.target.value) || 1)}
                disabled={isSaving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icon">Category Icon</Label>
              <select
                id="icon"
                value={categoryIcon}
                onChange={(e) => setCategoryIcon(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={isSaving}
              >
                {iconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Icon is for display purposes only and not saved to database</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">Category Color (Hex Code)</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  placeholder="#66BB6A"
                  disabled={isSaving}
                />
                <div
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: categoryColor }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={isSaving}>
              {isSaving
                ? (editingCategory ? "Updating Category..." : "Saving Category...")
                : (editingCategory ? "Update Category" : "Add Category")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}