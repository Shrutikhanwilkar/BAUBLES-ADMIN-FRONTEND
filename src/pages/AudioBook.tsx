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
import { Plus, Edit, Trash2, Star, X, Upload, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api_service";
import { AudioPlayback } from "@/services/api_types";

const TableRowSkeleton = () => (
    <tr className="animate-pulse border-b">
        <td className="px-4 py-3">
            <div className="h-16 w-16 bg-muted/80 rounded"></div>
        </td>
        <td className="px-4 py-3">
            <div className="h-5 w-32 bg-muted/80 rounded"></div>
        </td>
        <td className="px-4 py-3">
            <div className="h-6 w-20 bg-muted/80 rounded"></div>
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
                <div className="h-8 w-8 bg-muted/80 rounded"></div>
            </div>
        </td>
    </tr>
);

export default function AudioBooks() {
    const [audioBooks, setAudioBooks] = useState<AudioPlayback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingAudioBook, setDeletingAudioBook] = useState<AudioPlayback | null>(null);
    const [editingAudioBook, setEditingAudioBook] = useState<AudioPlayback | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioFileName, setAudioFileName] = useState("");
    const [audioFileSize, setAudioFileSize] = useState(0);
    const [duration, setDuration] = useState(0);
    const [status, setStatus] = useState("Active");

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageLimit, setPageLimit] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        fetchAudioBooks();

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (pageLimit === -1) {
            setTotalPages(1);
        } else {
            setTotalPages(Math.ceil(audioBooks.length / pageLimit));
        }
    }, [pageLimit, audioBooks]);

    const fetchAudioBooks = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getAudioPlaybacks();
            if (response.success) {
                setAudioBooks(response.data);
                setTotalRecords(response.data.length);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch audio books");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchAudioBooks();
    };

    const handleLimitChange = (value: string) => {
        const newLimit = value === "all" ? -1 : parseInt(value);
        setPageLimit(newLimit);
        setCurrentPage(1);
    };

    const handleOpenDeleteDialog = (audioBook: AudioPlayback) => {
        setDeletingAudioBook(audioBook);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingAudioBook) return;

        setIsDeleting(true);
        try {
            const response = await apiService.deleteAudioPlayback(deletingAudioBook._id);
            if (response.success) {
                toast.success(response.message || "Audio book deleted successfully");
                await fetchAudioBooks();
                setIsDeleteDialogOpen(false);
                setDeletingAudioBook(null);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete audio book");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSetDefault = async (audioBook: AudioPlayback) => {
        try {
            const response = await apiService.updateAudioPlayback(audioBook._id, { default: true });
            if (response.success) {
                fetchAudioBooks();
                toast.success(`"${audioBook.title}" set as default audio book`);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to set default audio book");
        }
    };

    const handlePlayPause = (audioBook: AudioPlayback) => {
        if (playingAudioId === audioBook._id) {
            audioRef.current?.pause();
            setPlayingAudioId(null);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }

            audioRef.current = new Audio(audioBook.videoFile);
            audioRef.current.play();
            setPlayingAudioId(audioBook._id);

            audioRef.current.onended = () => {
                setPlayingAudioId(null);
            };
        }
    };

    const handleOpenDialog = (audioBook: AudioPlayback | null = null) => {
        if (audioBook) {
            setEditingAudioBook(audioBook);
            setTitle(audioBook.title);
            setDescription(audioBook.description);
            setThumbnail(audioBook.thumbnail);
            setThumbnailFile(null);
            setAudioFile(null);
            setAudioFileName("");
            setDuration(audioBook.duration);
            setStatus(audioBook.status);
            setIsDialogOpen(true);
        } else {
            setEditingAudioBook(null);
            setTitle("");
            setDescription("");
            setThumbnail("");
            setThumbnailFile(null);
            setAudioFile(null);
            setAudioFileName("");
            setAudioFileSize(0);
            setDuration(0);
            setStatus("Active");
            setIsDialogOpen(true);
        }
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size should be less than 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnail(reader.result as string);
                setThumbnailFile(file);
            };
            reader.readAsDataURL(file);
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
                setDuration(Math.floor(audio.duration));
                URL.revokeObjectURL(objectUrl);
            });

            audio.src = objectUrl;
            setAudioFile(file);
            setAudioFileName(file.name);
            setAudioFileSize(file.size);
        }
    };

    const handleRemoveThumbnail = () => {
        setThumbnail("");
        setThumbnailFile(null);
    };

    const handleRemoveAudio = () => {
        setAudioFile(null);
        setAudioFileName("");
        setAudioFileSize(0);
        setDuration(0);
    };

    const handleSaveAudioBook = async () => {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        if (!description.trim()) {
            toast.error("Description is required");
            return;
        }

        if (!editingAudioBook && !thumbnailFile) {
            toast.error("Thumbnail is required");
            return;
        }

        if (!editingAudioBook && !audioFile) {
            toast.error("Audio file is required");
            return;
        }

        setIsSaving(true);

        try {
            if (editingAudioBook) {
                const updateData: any = {
                    title,
                    description,
                    status,
                };

                if (thumbnailFile) {
                    updateData.thumbnail = thumbnailFile;
                }

                if (audioFile) {
                    updateData.audioFile = audioFile;
                    updateData.duration = duration;
                    updateData.fileSize = audioFileSize;
                } else {
                    updateData.duration = editingAudioBook.duration;
                }

                const response = await apiService.updateAudioPlayback(editingAudioBook._id, updateData);
                if (response.success) {
                    toast.success(response.message || "Audio book updated successfully");
                    await fetchAudioBooks();
                }
            } else {
                if (!audioFile) {
                    toast.error("Audio file is required");
                    return;
                }

                const createData = {
                    title,
                    description,
                    duration,
                    status,
                    default: audioBooks.length === 0,
                    audioFile: audioFile!,
                    thumbnail: thumbnailFile!,
                };

                const response = await apiService.createAudioPlayback(createData);
                if (response.success) {
                    toast.success(response.message || "Audio book added successfully");
                    await fetchAudioBooks();
                }
            }

            setIsDialogOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error.message || "Failed to save audio book");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setThumbnail("");
        setThumbnailFile(null);
        setAudioFile(null);
        setAudioFileName("");
        setAudioFileSize(0);
        setDuration(0);
        setStatus("Active");
        setEditingAudioBook(null);
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

    const paginatedAudioBooks = pageLimit === -1
        ? audioBooks
        : audioBooks.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Santa's Audio Books</h1>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Audio Book
                </Button>
            </div>

            <Card className="shadow-card">
                <CardContent className="p-6">
                    <div className="flex gap-4 mb-4">
                        <Input
                            placeholder="Search audio books..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                        />
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
                                    <th className="px-4 py-3 text-left font-medium w-[80px]">Thumbnail</th>
                                    <th className="px-4 py-3 text-left font-medium w-[200px]">Title</th>
                                    <th className="px-4 py-3 text-left font-medium w-[80px]">Status</th>
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
                                ) : paginatedAudioBooks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            No audio books found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedAudioBooks.map((audioBook) => (
                                        <tr key={audioBook._id} className="border-b hover:bg-muted/50">
                                            <td className="px-4 py-3">
                                                <img
                                                    src={audioBook.thumbnail}
                                                    alt={audioBook.title}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium">{audioBook.title}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={audioBook.status === "Active" ? "default" : "secondary"}>
                                                    {audioBook.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">{formatDuration(audioBook.duration)}</td>
                                            <td className="px-4 py-3">
                                                <div className="max-w-md line-clamp-2">{audioBook.description}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handlePlayPause(audioBook)}
                                                        title="Preview"
                                                    >
                                                        {playingAudioId === audioBook._id ? (
                                                            <Pause className="h-4 w-4" />
                                                        ) : (
                                                            <Play className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleSetDefault(audioBook)}
                                                        title="Set as default"
                                                    >
                                                        <Star className={`h-4 w-4 ${audioBook.default ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenDialog(audioBook)}
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenDeleteDialog(audioBook)}
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

                    {!isLoading && audioBooks.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t">
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

                                {pageLimit !== -1 && totalPages > 1 && (
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        {(() => {
                                            const windowSize = 5;
                                            let windowStart = currentPage;
                                            let windowEnd = currentPage + windowSize - 1;

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
                                                    className="h-8 w-8"
                                                    onClick={() => setCurrentPage(p)}
                                                >
                                                    {p}
                                                </Button>
                                            ));
                                        })()}

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
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
                        <DialogTitle>{editingAudioBook ? "Edit Audio Book" : "Add Audio Book"}</DialogTitle>
                        <DialogDescription>
                            {editingAudioBook
                                ? "Update the audio book details below."
                                : "Create a new audio book by filling in the details below."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter audio book title"
                                disabled={isSaving}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={setStatus} disabled={isSaving}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter audio book description"
                                rows={5}
                                disabled={isSaving}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="thumbnail">Thumbnail Image</Label>
                            {thumbnail ? (
                                <div className="flex items-center gap-2 p-3 border rounded-lg bg-primary/5">
                                    <img
                                        src={thumbnail}
                                        alt="Thumbnail preview"
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Thumbnail uploaded</div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={handleRemoveThumbnail}
                                        disabled={isSaving}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <label
                                    htmlFor="thumbnail-upload"
                                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center">
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold">Click to upload thumbnail</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 5MB)</p>
                                    </div>
                                    <Input
                                        id="thumbnail-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                        disabled={isSaving}
                                    />
                                </label>
                            )}
                            {editingAudioBook && !thumbnailFile && (
                                <p className="text-xs text-muted-foreground">
                                    Leave empty to keep the existing thumbnail
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="audio">Audio File</Label>
                            {audioFileName ? (
                                <div className="flex items-center gap-2 p-3 border rounded-lg bg-primary/5">
                                    <div className="flex-1">
                                        <div className="truncate text-sm font-medium">{audioFileName}</div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>Duration: {formatDuration(duration)}</span>
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
                            {editingAudioBook && !audioFileName && (
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
                        <Button onClick={handleSaveAudioBook} disabled={isSaving}>
                            {isSaving
                                ? (editingAudioBook ? "Updating..." : "Saving...")
                                : (editingAudioBook ? "Update Audio Book" : "Add Audio Book")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Audio Book</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingAudioBook?.title}"? This action cannot be undone.
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