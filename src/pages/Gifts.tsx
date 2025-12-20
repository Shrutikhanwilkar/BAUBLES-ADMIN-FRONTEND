import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ExternalLink, Upload, X, ChevronDown, Package } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { apiService } from "@/services/api_service";
import { Gift, GiftPackage, ApiError } from "@/services/api_types";

const GiftSkeleton = () => (
  <Card className="shadow-card animate-pulse">
    <CardHeader>
      <div className="w-full h-40 rounded-lg bg-muted/80"></div>
      <div className="h-6 w-3/4 bg-muted/80 rounded mt-4"></div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="h-4 w-full bg-muted/80 rounded"></div>
        <div className="h-4 w-2/3 bg-muted/80 rounded"></div>
      </div>
      <div className="h-4 w-1/2 bg-muted/80 rounded"></div>
      <div className="flex gap-2">
        <div className="h-10 flex-1 bg-muted/80 rounded"></div>
        <div className="h-10 flex-1 bg-muted/80 rounded"></div>
      </div>
    </CardContent>
  </Card>
);

const PackageSkeleton = () => (
  <div className="border rounded-lg animate-pulse">
    <div className="flex items-center justify-between p-4">
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-6 w-48 bg-muted/80 rounded"></div>
        <div className="h-4 w-32 bg-muted/80 rounded"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-9 w-16 bg-muted/80 rounded"></div>
        <div className="h-9 w-16 bg-muted/80 rounded"></div>
      </div>
    </div>
  </div>
);

export default function Gifts() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [packages, setPackages] = useState<GiftPackage[]>([]);
  const [isLoadingGifts, setIsLoadingGifts] = useState(true);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPackageDeleteDialogOpen, setIsPackageDeleteDialogOpen] = useState(false);
  const [deletingGift, setDeletingGift] = useState<Gift | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<GiftPackage | null>(null);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [editingPackage, setEditingPackage] = useState<GiftPackage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const [giftName, setGiftName] = useState("");
  const [giftDescription, setGiftDescription] = useState("");
  const [giftProductLink, setGiftProductLink] = useState("");
  const [giftImage, setGiftImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedPackage, setSelectedPackage] = useState("");

  const [packageName, setPackageName] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [packageType, setPackageType] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [packageCategory, setPackageCategory] = useState<string>("");
  const [priority, setPriority] = useState("");
  const [isActive, setIsActive] = useState(true);

  const hasFetched = useRef(false);
  const userRole = localStorage.getItem('userRole');
  const isSuperAdmin = userRole === 'SUPERADMIN';

  useEffect(() => {
  fetchGifts();
  fetchPackages();
}, []);

  const fetchGifts = async () => {
    try {
      setIsLoadingGifts(true);
      const response = await apiService.getGifts({ page: 1, limit: 100 });
      if (response.success) {
        setGifts(response.data.data);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to fetch gifts");
    } finally {
      setIsLoadingGifts(false);
    }
  };

  const fetchPackages = async () => {
    try {
      setIsLoadingPackages(true);
      const response = await apiService.getGiftPackages({ page: 1, limit: 100 });
      if (response.success) {
        setPackages(response.data.data);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to fetch packages");
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const getPackageGifts = (packageId: string) => {
    return gifts.filter(gift => gift.category?._id === packageId);
  };

  const toggleDescription = (giftId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [giftId]: !prev[giftId]
    }));
  };

  const isDescriptionLong = (description: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.visibility = "hidden";
    tempDiv.style.width = "300px";
    tempDiv.style.fontSize = "14px";
    tempDiv.style.lineHeight = "1.5";
    tempDiv.innerText = description;
    document.body.appendChild(tempDiv);
    const height = tempDiv.offsetHeight;
    document.body.removeChild(tempDiv);
    return height > 63;
  };

  const handleOpenDeleteDialog = (gift: Gift) => {
    setDeletingGift(gift);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenPackageDeleteDialog = (pkg: GiftPackage) => {
    setDeletingPackage(pkg);
    setIsPackageDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingGift) return;

    setIsDeleting(true);
    try {
      const response = await apiService.deleteGift(deletingGift._id);
      if (response.success) {
        toast.success(response.message || "Gift deleted successfully");
        await fetchGifts();
        setIsDeleteDialogOpen(false);
        setDeletingGift(null);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to delete gift");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeletePackage = async () => {
    if (!deletingPackage) return;

    setIsDeleting(true);
    try {
      const response = await apiService.deleteGiftPackage(deletingPackage._id);
      if (response.success) {
        toast.success(response.message || "Package deleted successfully");
        await fetchPackages();
        setIsPackageDeleteDialogOpen(false);
        setDeletingPackage(null);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to delete package");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDialog = (gift: Gift | null = null) => {
    if (gift) {
      setEditingGift(gift);
      setGiftName(gift.name);
      setGiftDescription(gift.description);
      setGiftProductLink(gift.productLink);
      setGiftImage(gift.image);
      setImageFile(null);
      setSelectedPackage(gift.category?._id || "");
      setIsDialogOpen(true);
    } else {
      setEditingGift(null);
      setGiftName("");
      setGiftDescription("");
      setGiftProductLink("");
      setGiftImage("");
      setImageFile(null);
      setSelectedPackage("");
      setIsDialogOpen(true);
    }
    setIsPopoverOpen(false);
  };

  const handleOpenPackageDialog = (pkg: GiftPackage | null = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPackageName(pkg.name);
      setPackageDescription(pkg.description);
      setPackageType(pkg.packageType);
      setStartDate(new Date(pkg.startDate));
      setEndDate(new Date(pkg.endDate));
      setMinAge(pkg.minAge?.toString() || "");
      setMaxAge(pkg.maxAge?.toString() || "");
      setPriority(pkg.priority.toString());
      setIsActive(pkg.isActive);
      
      if (pkg.isTargetedAgeOnly) {
        setPackageCategory("isTargetedAgeOnly");
      } else if (pkg.isExclusiveFirstAppOpen) {
        setPackageCategory("isExclusiveFirstAppOpen");
      } else if (pkg.isWeekendOnly) {
        setPackageCategory("isWeekendOnly");
      } else if (pkg.isHoliday) {
        setPackageCategory("isHoliday");
      } else if (pkg.isBasic) {
        setPackageCategory("isBasic");
      }
      
      setIsPackageDialogOpen(true);
    } else {
      setEditingPackage(null);
      setPackageName("");
      setPackageDescription("");
      setPackageType("");
      setStartDate(undefined);
      setEndDate(undefined);
      setMinAge("");
      setMaxAge("");
      setPackageCategory("");
      setPriority("");
      setIsActive(true);
      setIsPackageDialogOpen(true);
    }
    setIsPopoverOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setGiftImage(reader.result as string);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setGiftImage("");
    setImageFile(null);
  };

  const handleCategoryChange = (category: string) => {
    setPackageCategory(category);
    if (category !== "isTargetedAgeOnly") {
      setMinAge("");
      setMaxAge("");
    }
  };

  const handleSaveGift = async () => {
    if (!giftName.trim()) {
      toast.error("Gift title is required");
      return;
    }

    if (!giftDescription.trim()) {
      toast.error("Gift description is required");
      return;
    }

    if (!giftProductLink.trim()) {
      toast.error("Product link is required");
      return;
    }

    if (!selectedPackage) {
      toast.error("Please select a package");
      return;
    }

    if (!editingGift && !imageFile) {
      toast.error("Gift image is required");
      return;
    }

    setIsSaving(true);

    try {
      if (editingGift) {
        const updateData: any = {
          name: giftName,
          description: giftDescription,
          productLink: giftProductLink,
          category: selectedPackage,
        };

        if (imageFile) {
          updateData.image = imageFile;
        }

        const response = await apiService.updateGift(editingGift._id, updateData);
        if (response.success) {
          toast.success(response.message || "Gift updated successfully");
          await fetchGifts();
        }
      } else {
        if (!imageFile) {
          toast.error("Gift image is required");
          return;
        }

        const createData = {
          name: giftName,
          description: giftDescription,
          productLink: giftProductLink,
          image: imageFile,
          category: selectedPackage,
        };

        const response = await apiService.createGift(createData);
        if (response.success) {
          toast.success(response.message || "Gift added successfully");
          await fetchGifts();
        }
      }

      setIsDialogOpen(false);
      resetGiftForm();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to save gift");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePackage = async () => {
    if (!packageName.trim()) {
      toast.error("Package name is required");
      return;
    }

    if (!packageDescription.trim()) {
      toast.error("Package description is required");
      return;
    }

    if (!packageType.trim()) {
      toast.error("Package type is required");
      return;
    }

    if (!startDate) {
      toast.error("Start date is required");
      return;
    }

    if (!endDate) {
      toast.error("End date is required");
      return;
    }

    if (!packageCategory) {
      toast.error("Please select a package category");
      return;
    }

    if (packageCategory === "isTargetedAgeOnly") {
      if (!minAge.trim() || isNaN(Number(minAge))) {
        toast.error("Valid minimum age is required for Targeted Age Only");
        return;
      }

      if (!maxAge.trim() || isNaN(Number(maxAge))) {
        toast.error("Valid maximum age is required for Targeted Age Only");
        return;
      }
    }

    if (!priority.trim() || isNaN(Number(priority))) {
      toast.error("Valid priority is required");
      return;
    }

    setIsSaving(true);

    try {
      const packageData: any = {
        name: packageName,
        description: packageDescription,
        packageType: packageType,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        isTargetedAgeOnly: packageCategory === "isTargetedAgeOnly",
        isExclusiveFirstAppOpen: packageCategory === "isExclusiveFirstAppOpen",
        isWeekendOnly: packageCategory === "isWeekendOnly",
        isHoliday: packageCategory === "isHoliday",
        isBasic: packageCategory === "isBasic",
        priority: Number(priority),
        isActive: isActive,
      };

      if (packageCategory === "isTargetedAgeOnly") {
        packageData.minAge = Number(minAge);
        packageData.maxAge = Number(maxAge);
      }

      if (editingPackage) {
        const response = await apiService.updateGiftPackage(editingPackage._id, packageData);
        if (response.success) {
          toast.success(response.message || "Package updated successfully");
          await fetchPackages();
        }
      } else {
        const response = await apiService.createGiftPackage(packageData);
        if (response.success) {
          toast.success(response.message || "Package created successfully");
          await fetchPackages();
        }
      }

      setIsPackageDialogOpen(false);
      resetPackageForm();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to save package");
    } finally {
      setIsSaving(false);
    }
  };

  const resetGiftForm = () => {
    setGiftName("");
    setGiftDescription("");
    setGiftProductLink("");
    setGiftImage("");
    setImageFile(null);
    setSelectedPackage("");
    setEditingGift(null);
  };

  const resetPackageForm = () => {
    setPackageName("");
    setPackageDescription("");
    setPackageType("");
    setStartDate(undefined);
    setEndDate(undefined);
    setMinAge("");
    setMaxAge("");
    setPackageCategory("");
    setPriority("");
    setIsActive(true);
    setEditingPackage(null);
  };

  const getPackageTypeLabel = (pkg: GiftPackage) => {
    if (pkg.isTargetedAgeOnly) return "Targeted Age Only";
    if (pkg.isExclusiveFirstAppOpen) return "Exclusive First App Open";
    if (pkg.isWeekendOnly) return "Weekend Only";
    if (pkg.isHoliday) return "Holiday";
    if (pkg.isBasic) return "Basic";
    return "Unknown";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gifts Management</h1>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Gift
              </Button>
              {isSuperAdmin && (
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleOpenPackageDialog()}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Create Package
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isLoadingPackages ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Gift Packages</h2>
          <div className="space-y-2">
            <PackageSkeleton />
            <PackageSkeleton />
            <PackageSkeleton />
          </div>
        </div>
      ) : packages.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Gift Packages</h2>
          <Accordion type="single" collapsible className="w-full">
            {packages.map((pkg) => {
              const packageGifts = getPackageGifts(pkg._id);

              return (
                <AccordionItem key={pkg._id} value={pkg._id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-semibold">{pkg.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {pkg.packageType} • {getPackageTypeLabel(pkg)} • {packageGifts.length} {packageGifts.length === 1 ? 'Gift' : 'Gifts'}
                        </span>
                      </div>
                      {isSuperAdmin && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPackageDialog(pkg);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPackageDeleteDialog(pkg);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Description:</span>
                          <p className="text-muted-foreground mt-1">{pkg.description}</p>
                        </div>
                        <div>
                          <span className="font-medium">Date Range:</span>
                          <p className="text-muted-foreground mt-1">
                            {format(new Date(pkg.startDate), "PPP")} - {format(new Date(pkg.endDate), "PPP")}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Category Type:</span>
                          <p className="text-muted-foreground mt-1">{getPackageTypeLabel(pkg)}</p>
                        </div>
                        {pkg.isTargetedAgeOnly && pkg.minAge !== undefined && pkg.maxAge !== undefined && (
                          <div>
                            <span className="font-medium">Age Range:</span>
                            <p className="text-muted-foreground mt-1">{pkg.minAge} - {pkg.maxAge} years</p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Priority:</span>
                          <p className="text-muted-foreground mt-1">{pkg.priority}</p>
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <p className="text-muted-foreground mt-1">{pkg.isActive ? "Active" : "Inactive"}</p>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Associated Gifts</h4>
                        {isLoadingGifts ? (
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <GiftSkeleton />
                            <GiftSkeleton />
                            <GiftSkeleton />
                          </div>
                        ) : packageGifts.length > 0 ? (
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {packageGifts.map((gift) => {
                              const isExpanded = expandedDescriptions[gift._id];
                              const needsReadMore = isDescriptionLong(gift.description);

                              return (
                                <Card key={gift._id} className="shadow-card hover-scale transition-all">
                                  <CardHeader>
                                    <div className="w-full h-32 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden p-2">
                                      <img
                                        src={gift.image}
                                        alt={gift.name}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    <CardTitle className="text-base">{gift.name}</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div>
                                      <p className={`text-sm text-muted-foreground ${!isExpanded ? 'line-clamp-2' : ''}`}>
                                        {gift.description}
                                      </p>
                                      {needsReadMore && (
                                        <button
                                          onClick={() => toggleDescription(gift._id)}
                                          className="text-xs text-primary hover:underline mt-1 font-medium"
                                        >
                                          {isExpanded ? "Read less" : "Read more"}
                                        </button>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-primary">
                                      <ExternalLink className="h-4 w-4" />
                                      <span className="truncate">{gift.productLink}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => handleOpenDialog(gift)}
                                      >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => handleOpenDeleteDialog(gift)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No gifts associated with this package yet
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      ) : null}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingGift ? "Edit Gift" : "Add Gift"}</DialogTitle>
            <DialogDescription>
              {editingGift
                ? "Update the gift details below."
                : "Create a new gift by filling in the details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="giftPackage">Gift Package *</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-between"
                    disabled={isSaving}
                  >
                    {selectedPackage
                      ? packages.find(pkg => pkg._id === selectedPackage)?.name
                      : "Select a package"}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[360px]" align="start">
                  {packages.map((pkg) => (
                    <DropdownMenuItem
                      key={pkg._id}
                      onClick={() => setSelectedPackage(pkg._id)}
                    >
                      {pkg.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Gift Image</Label>
              <div className="flex flex-col gap-3">
                {giftImage ? (
                  <div className="relative w-full h-40 rounded-lg border bg-primary/10 overflow-hidden">
                    <img
                      src={giftImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={handleRemoveImage}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG or GIF (MAX. 5MB)</p>
                    </div>
                    <Input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSaving}
                    />
                  </label>
                )}
              </div>
              {editingGift && !imageFile && (
                <p className="text-xs text-muted-foreground">
                  Leave empty to keep the existing image
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Gift Title</Label>
              <Input
                id="name"
                value={giftName}
                onChange={(e) => setGiftName(e.target.value)}
                placeholder="Enter gift title"
                disabled={isSaving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={giftDescription}
                onChange={(e) => setGiftDescription(e.target.value)}
                placeholder="Enter gift description"
                rows={3}
                disabled={isSaving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productLink">Product Link</Label>
              <Input
                id="productLink"
                value={giftProductLink}
                onChange={(e) => setGiftProductLink(e.target.value)}
                placeholder="https://example.com/product"
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveGift} disabled={isSaving}>
              {isSaving
                ? (editingGift ? "Updating Gift..." : "Saving Gift...")
                : (editingGift ? "Update Gift" : "Add Gift")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPackage ? "Edit Package" : "Create Package"}</DialogTitle>
            <DialogDescription>
              {editingPackage
                ? "Update the package details below."
                : "Create a new gift package by filling in the details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="packageName">Package Name</Label>
              <Input
                id="packageName"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="Enter package name"
                disabled={isSaving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="packageDescription">Description</Label>
              <Textarea
                id="packageDescription"
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                placeholder="Enter package description"
                rows={3}
                disabled={isSaving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="packageType">Package Type</Label>
              <Input
                id="packageType"
                value={packageType}
                onChange={(e) => setPackageType(e.target.value)}
                placeholder="e.g., Exclusive First-Open"
                disabled={isSaving}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                      disabled={isSaving}
                    >
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                      disabled={isSaving}
                    >
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid gap-3">
              <Label>Package Category *</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isTargetedAgeOnly"
                    checked={packageCategory === "isTargetedAgeOnly"}
                    onCheckedChange={() => handleCategoryChange("isTargetedAgeOnly")}
                    disabled={isSaving}
                  />
                  <label
                    htmlFor="isTargetedAgeOnly"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Targeted Age Only
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isExclusiveFirstAppOpen"
                    checked={packageCategory === "isExclusiveFirstAppOpen"}
                    onCheckedChange={() => handleCategoryChange("isExclusiveFirstAppOpen")}
                    disabled={isSaving}
                  />
                  <label
                    htmlFor="isExclusiveFirstAppOpen"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Exclusive First App Open
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isWeekendOnly"
                    checked={packageCategory === "isWeekendOnly"}
                    onCheckedChange={() => handleCategoryChange("isWeekendOnly")}
                    disabled={isSaving}
                  />
                  <label
                    htmlFor="isWeekendOnly"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Weekend Only
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isHoliday"
                    checked={packageCategory === "isHoliday"}
                    onCheckedChange={() => handleCategoryChange("isHoliday")}
                    disabled={isSaving}
                  />
                  <label
                    htmlFor="isHoliday"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Holiday
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isBasic"
                    checked={packageCategory === "isBasic"}
                    onCheckedChange={() => handleCategoryChange("isBasic")}
                    disabled={isSaving}
                  />
                  <label
                    htmlFor="isBasic"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Basic
                  </label>
                </div>
              </div>
            </div>

            {packageCategory === "isTargetedAgeOnly" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="minAge">Minimum Age *</Label>
                  <Input
                    id="minAge"
                    type="number"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    placeholder="6"
                    disabled={isSaving}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxAge">Maximum Age *</Label>
                  <Input
                    id="maxAge"
                    type="number"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    placeholder="16"
                    disabled={isSaving}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="1"
                disabled={isSaving}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPackageDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSavePackage} disabled={isSaving}>
              {isSaving
                ? (editingPackage ? "Updating Package..." : "Creating Package...")
                : (editingPackage ? "Update Package" : "Create Package")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Gift</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingGift?.name}"? This action cannot be undone.
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
      </Dialog>

      <Dialog open={isPackageDeleteDialogOpen} onOpenChange={setIsPackageDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingPackage?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPackageDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePackage} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}