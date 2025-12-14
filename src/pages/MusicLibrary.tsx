import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Star, X, Upload, DollarSign, Gift } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api_service";
import { AudioBook, Category, ApiError } from "@/services/api_types";

const TableRowSkeleton = () => (
  <tr className="animate-pulse border-b">
    <td className="px-4 py-3">
      <div className="h-5 w-32 bg-muted/80 rounded"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-6 w-20 bg-muted/80 rounded"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-4 w-48 bg-muted/80 rounded"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-4 w-12 bg-muted/80 rounded"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-6 w-16 bg-muted/80 rounded"></div>
    </td>
    <td className="px-4 py-3 text-right">
      <div className="flex gap-2 justify-end">
        <div className="h-8 w-8 bg-muted/80 rounded"></div>
        <div className="h-8 w-8 bg-muted/80 rounded"></div>
        <div className="h-8 w-8 bg-muted/80 rounded"></div>
      </div>
    </td>
  </tr>
);

export default function MusicLibrary() {
  const [audioBooks, setAudioBooks] = useState<AudioBook[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingBook, setDeletingBook] = useState<AudioBook | null>(null);
  const [editingBook, setEditingBook] = useState<AudioBook | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [bookTitle, setBookTitle] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [bookCategory, setBookCategory] = useState("");
  const [bookDuration, setBookDuration] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [isFree, setIsFree] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const hasFetched = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!hasFetched.current) {
        hasFetched.current = true;
        if (isMounted) {
          await fetchData();
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [categoriesResponse, audioBooksResponse] = await Promise.all([
        apiService.getCategories(),
        apiService.getAudioBooks({ page: currentPage, limit: pageLimit }),
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      if (audioBooksResponse.success) {
        setAudioBooks(audioBooksResponse.data.music);
        if (audioBooksResponse.data.pagination) {
          setTotalRecords(audioBooksResponse.data.pagination.total);
          setTotalPages(audioBooksResponse.data.pagination.totalPages);
        }
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAudioBooks = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: pageLimit === -1 ? 1000 : pageLimit,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (filterCategory && filterCategory !== "all") {
        params.statusCategoryId = filterCategory;
      }

      const response = await apiService.getAudioBooks(params);
      if (response.success) {
        setAudioBooks(response.data.music);
        if (response.data.pagination) {
          setTotalRecords(response.data.pagination.total);
          setTotalPages(response.data.pagination.totalPages);
        }
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to fetch music library");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) {
      fetchAudioBooks();
    }
  }, [currentPage, pageLimit]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAudioBooks();
  };

  const handleLimitChange = (value: string) => {
    const newLimit = value === "all" ? -1 : parseInt(value);
    setPageLimit(newLimit);
    setCurrentPage(1);
  };

  const handleOpenDeleteDialog = (book: AudioBook) => {
    setDeletingBook(book);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingBook) return;

    setIsDeleting(true);
    try {
      const response = await apiService.deleteAudioBook(deletingBook._id);
      if (response.success) {
        toast.success(response.message || "Music deleted successfully");
        await fetchAudioBooks();
        setIsDeleteDialogOpen(false);
        setDeletingBook(null);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to delete music library");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = (id: string) => {
    toast.info("Set default functionality will be available soon");
  };

  const handleOpenDialog = (book: AudioBook | null = null) => {
    if (book) {
      setEditingBook(book);
      setBookTitle(book.title);
      setBookDescription(book.description);
      setBookCategory(book.statusCategory._id || "");
      setBookDuration(book.duration);
      setIsFree(book.isFree);
      setAudioFile(null);
      setAudioFileName("");
      setIsDialogOpen(true);
    } else {
      setEditingBook(null);
      setBookTitle("");
      setBookDescription("");
      setBookCategory("");
      setBookDuration(0);
      setIsFree(true);
      setAudioFile(null);
      setAudioFileName("");
      setIsDialogOpen(true);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Audio file size should be less than 50MB");
        return;
      }

      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);

      audio.addEventListener("loadedmetadata", () => {
        setBookDuration(Math.floor(audio.duration));
        URL.revokeObjectURL(objectUrl);
      });

      audio.src = objectUrl;
      setAudioFile(file);
      setAudioFileName(file.name);
    }
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
    setAudioFileName("");
    setBookDuration(0);
  };

  const handleSaveBook = async () => {
    if (!bookTitle.trim()) {
      toast.error("Music title is required");
      return;
    }

    if (!bookDescription.trim()) {
      toast.error("Music description is required");
      return;
    }

    if (!bookCategory) {
      toast.error("Please select a category");
      return;
    }

    if (!editingBook && !audioFile) {
      toast.error("Audio file is required");
      return;
    }

    setIsSaving(true);

    try {
      if (editingBook) {
        const updateData: any = {
          title: bookTitle,
          description: bookDescription,
          statusCategory: bookCategory,
          isFree: isFree,
        };

        if (audioFile) {
          updateData.musicFile = audioFile;
          updateData.duration = bookDuration;
        } else {
          updateData.duration = editingBook.duration;
        }

        const response = await apiService.updateAudioBook(editingBook._id, updateData);
        if (response.success) {
          toast.success(response.message || "Music updated successfully");
          await fetchAudioBooks();
        }
      } else {
        if (!audioFile) {
          toast.error("Audio file is required");
          return;
        }

        const createData = {
          title: bookTitle,
          description: bookDescription,
          statusCategory: bookCategory,
          duration: bookDuration,
          musicFile: audioFile,
          isFree: isFree,
        };

        const response = await apiService.createAudioBook(createData);
        if (response.success) {
          toast.success(response.message || "Music added successfully");
          await fetchAudioBooks();
        }
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to save music library");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setBookTitle("");
    setBookDescription("");
    setBookCategory("");
    setBookDuration(0);
    setIsFree(true);
    setAudioFile(null);
    setAudioFileName("");
    setEditingBook(null);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDisplayRange = () => {
    if (pageLimit === -1) {
      return `Showing all ${totalRecords} entries`;
    }
    const start = (currentPage - 1) * pageLimit + 1;
    const end = Math.min(currentPage * pageLimit, totalRecords);
    return `Showing ${start}-${end} of ${totalRecords} entries`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Music Library</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Music
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search music in the library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-left font-medium">Duration</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(8)].map((_, index) => (
                    <TableRowSkeleton key={index} />
                  ))
                ) : audioBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No music found
                    </td>
                  </tr>
                ) : (
                  audioBooks.map((book) => (
                    <tr key={book._id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{book.title}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {book.isFree ? (
                            <>
                              <Gift className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-600 font-medium">Free</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">Paid</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge style={{ backgroundColor: book.statusCategory.color }}>
                          {book.statusCategory.name}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate">{book.description}</td>
                      <td className="px-4 py-3">{formatDuration(book.duration)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSetDefault(book._id)}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(book)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDeleteDialog(book)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && audioBooks.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBook ? "Edit Music" : "Add Music"}</DialogTitle>
            <DialogDescription>
              {editingBook
                ? "Update the music details below."
                : "Create a new music by filling in the details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Music Title</Label>
              <Input
                id="title"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="Enter music title"
                disabled={isSaving}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={bookCategory} onValueChange={setBookCategory} disabled={isSaving}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={bookDescription}
                onChange={(e) => setBookDescription(e.target.value)}
                placeholder="Enter book description"
                rows={3}
                disabled={isSaving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Music Type</Label>
              <div className="flex gap-4">
                <div
                  className={`flex-1 flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${isFree
                    ? "border-blue-500 bg-blue-50"
                    : "border-border hover:border-blue-300"
                    }`}
                  onClick={() => setIsFree(true)}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isFree ? "border-blue-500" : "border-border"
                      }`}
                  >
                    {isFree && (
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                  <Gift className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Free</span>
                </div>
                <div
                  className={`flex-1 flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${!isFree
                    ? "border-green-500 bg-green-50"
                    : "border-border hover:border-green-300"
                    }`}
                  onClick={() => setIsFree(false)}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!isFree ? "border-green-500" : "border-border"
                      }`}
                  >
                    {!isFree && (
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    )}
                  </div>
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Paid</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="audio">Audio File</Label>
              {audioFileName ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-primary/5">
                  <div className="flex-1">
                    <div className="truncate text-sm font-medium">{audioFileName}</div>
                    <div className="text-xs text-muted-foreground">
                      Duration: {formatDuration(bookDuration)}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleRemoveAudio}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="audio-upload"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload audio</span>
                    </p>
                    <p className="text-xs text-muted-foreground">MP3, WAV (MAX. 50MB)</p>
                  </div>
                  <Input
                    id="audio-upload"
                    type="file"
                    className="hidden"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    disabled={isSaving}
                  />
                </label>
              )}
              {editingBook && !audioFileName && (
                <p className="text-xs text-muted-foreground">
                  Leave empty to keep the existing audio file
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveBook} disabled={isSaving}>
              {isSaving
                ? (editingBook ? "Updating Music..." : "Saving Music...")
                : (editingBook ? "Update Music" : "Add Music")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Music</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingBook?.title}"? This action cannot be undone.
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
    </div>
  );
}