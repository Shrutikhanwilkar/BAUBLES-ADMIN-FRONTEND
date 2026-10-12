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
import { Plus, Edit, Trash2, Star, X, Upload, Play, Pause, HardDrive, ChevronLeft, ChevronRight } from "lucide-react";
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
      <div className="h-6 w-16 bg-muted/80 rounded"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-4 w-12 bg-muted/80 rounded"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-4 w-12 bg-muted/80 rounded"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-4 w-48 bg-muted/80 rounded"></div>
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

const StorageIndicator = ({ usedStorage, totalStorage }: { usedStorage: number; totalStorage: number }) => {
  const percentage = Math.min((usedStorage / totalStorage) * 100, 100);
  const usedGB = (usedStorage / (1024 * 1024 * 1024)).toFixed(2);
  const totalGB = (totalStorage / (1024 * 1024 * 1024)).toFixed(2);

  const getStorageColor = () => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <HardDrive className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Storage Usage</span>
              <span className="text-sm text-muted-foreground">{usedGB} GB / {totalGB} GB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${getStorageColor()} transition-all duration-300`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {percentage.toFixed(1)}% used
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [usedStorage, setUsedStorage] = useState(0);
  const [totalStorage] = useState(10 * 1024 * 1024 * 1024);

  const [bookTitle, setBookTitle] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [bookCategory, setBookCategory] = useState("");
  const [bookDuration, setBookDuration] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [audioFileSize, setAudioFileSize] = useState(0);
  const [isFree, setIsFree] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const isInitialMount = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchData();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
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
        const rawMusic = audioBooksResponse.data.music || [];
        setAudioBooks(rawMusic);
        const pagination = audioBooksResponse.data.pagination;
        const total = pagination?.total ?? (audioBooksResponse.data as any)?.total ?? rawMusic.length;
        const calculatedPages = pageLimit === -1 ? 1 : Math.max(1, Math.ceil(total / pageLimit));
        const pages = pagination?.totalPages ?? (audioBooksResponse.data as any)?.totalPages ?? calculatedPages;
        setTotalRecords(total);
        setTotalPages(pages);
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
        const rawMusic = response.data.music || [];
        const pagination = response.data.pagination;
        const total = pagination?.total ?? (response.data as any)?.total ?? rawMusic.length;
        const calculatedPages = pageLimit === -1 ? 1 : Math.max(1, Math.ceil(total / pageLimit));
        const pages = pagination?.totalPages ?? (response.data as any)?.totalPages ?? calculatedPages;
        setTotalRecords(total);
        setTotalPages(pages);

        if (pageLimit !== -1 && rawMusic.length > pageLimit) {
          const startIndex = (currentPage - 1) * pageLimit;
          const endIndex = startIndex + pageLimit;
          setAudioBooks(rawMusic.slice(startIndex, endIndex));
        } else {
          setAudioBooks(rawMusic);
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
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchAudioBooks();
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
        toast.success(response.message || "Message deleted successfully");
        await fetchAudioBooks();
        setIsDeleteDialogOpen(false);
        setDeletingBook(null);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = (id: string) => {
    toast.info("Set default functionality will be available soon");
  };

  const handlePlayPause = (book: AudioBook) => {
    if (playingAudioId === book._id) {
      audioRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio(book.musicFile);
      audioRef.current.play();
      setPlayingAudioId(book._id);

      audioRef.current.onended = () => {
        setPlayingAudioId(null);
      };
    }
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
      setAudioFileSize(0);
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
      setAudioFileSize(file.size);
    }
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
    setAudioFileName("");
    setAudioFileSize(0);
    setBookDuration(0);
  };

  const handleSaveBook = async () => {
    if (!bookTitle.trim()) {
      toast.error("Message title is required");
      return;
    }

    if (!bookDescription.trim()) {
      toast.error("Message description is required");
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
          updateData.fileSize = audioFileSize;
        } else {
          updateData.duration = editingBook.duration;
        }

        const response = await apiService.updateAudioBook(editingBook._id, updateData);
        if (response.success) {
          toast.success(response.message || "Message updated successfully");
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
          fileSize: audioFileSize,
          musicFile: audioFile,
          isFree: isFree,
        };

        const response = await apiService.createAudioBook(createData);
        if (response.success) {
          toast.success(response.message || "Message added successfully");
          await fetchAudioBooks();
        }
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to save message");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setBookTitle("");
    setBookDescription("");
    setBookCategory("");
    setBookDuration(0);
    setAudioFileSize(0);
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
    if (totalRecords === 0) {
      return `Showing 0 entries`;
    }
    const start = (currentPage - 1) * pageLimit + 1;
    const end = Math.min(currentPage * pageLimit, totalRecords);
    return `Showing ${start}-${end} of ${totalRecords} entries`;
  };

  const getCompactDisplayRange = () => {
    if (totalRecords === 0) return "0 of 0";
    if (pageLimit === -1) return `1–${totalRecords.toLocaleString()} of ${totalRecords.toLocaleString()}`;
    const start = (currentPage - 1) * pageLimit + 1;
    const end = Math.min(currentPage * pageLimit, totalRecords);
    return `${start.toLocaleString()}–${end.toLocaleString()} of ${totalRecords.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Santa's Message Library</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Message
        </Button>
      </div>

      {/* <StorageIndicator usedStorage={usedStorage} totalStorage={totalStorage} /> */}

      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <div className="flex gap-4 flex-1 min-w-[280px]">
              <Input
                placeholder="Search messages in the library..."
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

            {!isLoading && totalRecords > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap pl-2 border-l">
                <span>{getCompactDisplayRange()}</span>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium w-[200px]">Title</th>
                  <th className="px-4 py-3 text-left font-medium w-[80px]">Type</th>
                  <th className="px-4 py-3 text-left font-medium w-[120px]">Category</th>
                  <th className="px-4 py-3 text-left font-medium w-[100px]">Duration</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-right font-medium w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(8)].map((_, index) => (
                    <TableRowSkeleton key={index} />
                  ))
                ) : audioBooks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No messages found
                    </td>
                  </tr>
                ) : (
                  audioBooks.map((book) => (
                    <tr key={book._id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{book.title}</td>
                      <td className="px-4 py-3">
                        <Badge variant={book.isFree ? "secondary" : "default"}>
                          {book.isFree ? "Free" : "Paid"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          style={{
                            backgroundColor: `${book.statusCategory.color}20`,
                            color: book.statusCategory.color,
                            border: `1.5px solid ${book.statusCategory.color}60`
                          }}
                          className="font-bold rounded-full px-3 py-1.5"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                              style={{ backgroundColor: book.statusCategory.color }}
                            />
                            <span>{book.statusCategory.name}</span>
                          </div>
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{formatDuration(book.duration)}</td>
                      {/* <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatFileSize(book.fileSize || 0)}
                      </td> */}
                      <td className="px-4 py-3">
                        <div className="max-w-md line-clamp-2">{book.description}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePlayPause(book)}
                            title="Preview"
                          >
                            {playingAudioId === book._id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSetDefault(book._id)}
                            title="Set as default"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(book)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDeleteDialog(book)}
                            title="Delete"
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

          {!isLoading && (totalRecords > 0 || audioBooks.length > 0) && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t gap-4">
              <div className="text-sm text-muted-foreground">
                {getDisplayRange()}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show</span>
                  <Select
                    value={pageLimit === -1 ? "all" : pageLimit.toString()}
                    onValueChange={handleLimitChange}
                  >
                    <SelectTrigger className="w-[85px] h-9 rounded-lg">
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

                {pageLimit !== -1 && totalPages >= 1 && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {(() => {
                      const windowSize = 5;
                      let windowStart = Math.max(1, currentPage - Math.floor(windowSize / 2));
                      let windowEnd = windowStart + windowSize - 1;

                      if (windowEnd > totalPages) {
                        windowEnd = totalPages;
                        windowStart = Math.max(1, windowEnd - windowSize + 1);
                      }

                      const pages = [];
                      for (let i = windowStart; i <= windowEnd; i++) {
                        pages.push(i);
                      }

                      return pages.map((p) => (
                        <Button
                          key={p}
                          variant={p === currentPage ? "default" : "outline"}
                          size="icon"
                          className={`h-9 w-9 rounded-lg font-medium transition-colors ${
                            p === currentPage
                              ? "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent shadow-sm"
                              : "border border-border bg-background hover:bg-muted text-foreground"
                          }`}
                          onClick={() => setCurrentPage(p)}
                        >
                          {p}
                        </Button>
                      ));
                    })()}

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBook ? "Edit Message" : "Add Message"}</DialogTitle>
            <DialogDescription>
              {editingBook
                ? "Update the message details below."
                : "Create a new message by filling in the details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Message Title</Label>
              <Input
                id="title"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="Enter message title"
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
              <Label htmlFor="description">Description / Message Script</Label>
              <Textarea
                id="description"
                value={bookDescription}
                onChange={(e) => setBookDescription(e.target.value)}
                placeholder="Enter message description or script"
                rows={5}
                disabled={isSaving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Message Type</Label>
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
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Duration: {formatDuration(bookDuration)}</span>
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
                ? (editingBook ? "Updating Message..." : "Saving Message...")
                : (editingBook ? "Update Message" : "Add Message")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
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