import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Upload, X, Music, Star, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/services/api_service";
import { AudioPlayback } from "@/services/api_types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const AudioBookSkeleton = () => (
    <Card className="shadow-card animate-pulse">
        <CardHeader>
            <div className="w-full h-40 rounded-lg bg-muted/80"></div>
            <div className="h-6 w-3/4 bg-muted/80 rounded mt-4"></div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="h-4 w-full bg-muted/80 rounded"></div>
            <div className="h-4 w-2/3 bg-muted/80 rounded"></div>
            <div className="h-4 w-1/2 bg-muted/80 rounded"></div>
            <div className="flex gap-2">
                <div className="h-10 flex-1 bg-muted/80 rounded"></div>
                <div className="h-10 flex-1 bg-muted/80 rounded"></div>
            </div>
            <div className="h-10 w-full bg-muted/80 rounded"></div>
        </CardContent>
    </Card>
);

export default function AudioBooks() {
    const [audioBooks, setAudioBooks] = useState<AudioPlayback[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingAudioBook, setDeletingAudioBook] = useState<AudioPlayback | null>(null);
    const [editingAudioBook, setEditingAudioBook] = useState<AudioPlayback | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioFileName, setAudioFileName] = useState("");
    const [duration, setDuration] = useState(0);
    const [status, setStatus] = useState("active");

    const hasFetched = useRef(false);

    useEffect(() => {
        let isMounted = true;

        const loadAudioBooks = async () => {
            if (!hasFetched.current) {
                hasFetched.current = true;
                if (isMounted) {
                    await fetchAudioBooks();
                }
            }
        };

        loadAudioBooks();

        return () => {
            isMounted = false;
        };
    }, []);

    const fetchAudioBooks = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getAudioPlaybacks();
            if (response.success) {
                setAudioBooks(response.data);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch audio books");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDeleteDialog = (audioBook: AudioPlayback) => {
        setDeletingAudioBook(audioBook);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingAudioBook) return;

        try {
            setIsDeleting(true);
            const response = await apiService.deleteAudioPlayback(deletingAudioBook._id);
            if (response.success) {
                setAudioBooks(audioBooks.filter((ab) => ab._id !== deletingAudioBook._id));
                toast.success("Audio book deleted successfully");
                setIsDeleteDialogOpen(false);
                setDeletingAudioBook(null);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete audio book");
        } finally {
            setIsDeleting(false);
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
            setAudioFileName(audioBook.videoFile);
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
            setDuration(0);
            setStatus("active");
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
            audio.onloadedmetadata = () => {
                setDuration(Math.floor(audio.duration));
                URL.revokeObjectURL(audio.src);
            };
            audio.src = URL.createObjectURL(file);

            setAudioFile(file);
            setAudioFileName(file.name);
        }
    };

    const handleRemoveThumbnail = () => {
        setThumbnail("");
        setThumbnailFile(null);
    };

    const handleRemoveAudio = () => {
        setAudioFile(null);
        setAudioFileName("");
        setDuration(0);
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

        try {
            setIsSaving(true);

            if (editingAudioBook) {
                const updateData: any = {
                    title,
                    description,
                    status,
                };

                if (duration > 0) updateData.duration = duration;
                if (thumbnailFile) updateData.thumbnail = thumbnailFile;
                if (audioFile) updateData.audioFile = audioFile;

                const response = await apiService.updateAudioPlayback(editingAudioBook._id, updateData);
                if (response.success) {
                    fetchAudioBooks();
                    toast.success("Audio book updated successfully");
                }
            } else {
                const response = await apiService.createAudioPlayback({
                    title,
                    description,
                    duration,
                    status,
                    default: audioBooks.length === 0,
                    audioFile: audioFile!,
                    thumbnail: thumbnailFile!,
                });
                if (response.success) {
                    fetchAudioBooks();
                    toast.success("Audio book added successfully");
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
        setDuration(0);
        setStatus("active");
        setEditingAudioBook(null);
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Audio Books Management</h1>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Audio Book
                </Button>
            </div>

            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, index) => (
                        <AudioBookSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {audioBooks.map((audioBook) => (
                        <Card key={audioBook._id} className="shadow-card hover-scale transition-all">
                            <CardHeader>
                                <div className="relative w-full h-40 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={audioBook.thumbnail}
                                        alt={audioBook.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {audioBook.default && (
                                        <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
                                            <Star className="h-3 w-3 mr-1 fill-white" />
                                            Default
                                        </Badge>
                                    )}
                                    <Badge className="absolute top-2 left-2" variant={audioBook.status === "active" ? "default" : "secondary"}>
                                        {audioBook.status}
                                    </Badge>
                                </div>
                                <CardTitle className="text-lg">{audioBook.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">{audioBook.description}</p>
                                <div className="flex items-center gap-2 text-sm text-primary">
                                    <Music className="h-4 w-4" />
                                    <span>Duration: {formatDuration(audioBook.duration)}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => handleOpenDialog(audioBook)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => handleOpenDeleteDialog(audioBook)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                                {!audioBook.default && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => handleSetDefault(audioBook)}
                                    >
                                        <Star className="mr-2 h-4 w-4" />
                                        Set as Default
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

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
                            <Label htmlFor="thumbnail">Thumbnail</Label>
                            <div className="flex flex-col gap-3">
                                {thumbnail ? (
                                    <div className="relative w-full h-40 rounded-lg border bg-primary/10 overflow-hidden">
                                        <img
                                            src={thumbnail}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8"
                                            onClick={handleRemoveThumbnail}
                                            disabled={isSaving}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="thumbnail-upload"
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
                                            id="thumbnail-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleThumbnailChange}
                                            disabled={isSaving}
                                        />
                                    </label>
                                )}
                            </div>
                            {editingAudioBook && !thumbnailFile && (
                                <p className="text-xs text-muted-foreground">
                                    Leave empty to keep the existing thumbnail
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="audio">Audio File</Label>
                            <div className="flex flex-col gap-3">
                                {audioFileName ? (
                                    <div className="relative w-full p-4 rounded-lg border bg-primary/5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Music className="h-5 w-5 text-primary" />
                                                <div>
                                                    <p className="text-sm font-medium">{audioFileName}</p>
                                                    {duration > 0 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Duration: {formatDuration(duration)}
                                                        </p>
                                                    )}
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
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="audio-upload"
                                        className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors"
                                    >
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <Music className="w-8 h-8 mb-2 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-semibold">Click to upload</span> audio file
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
                            </div>
                            {editingAudioBook && !audioFile && (
                                <p className="text-xs text-muted-foreground">
                                    Leave empty to keep the existing audio file
                                </p>
                            )}
                        </div>

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
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter audio book description"
                                rows={3}
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
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveAudioBook} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {editingAudioBook ? "Updating..." : "Saving..."}
                                </>
                            ) : (
                                editingAudioBook ? "Update Audio Book" : "Add Audio Book"
                            )}
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
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}