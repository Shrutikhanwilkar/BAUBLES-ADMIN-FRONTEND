import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Smartphone, Apple, History, Clock, ChevronLeft, ChevronRight } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/services/api_service";
import { ApiError, AppVersion } from "@/services/api_types";

const VersionSkeleton = () => (
    <Card className="shadow-card animate-pulse">
        <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted/80"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-5 w-32 bg-muted/80 rounded"></div>
                            <div className="h-8 w-24 bg-muted/80 rounded"></div>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted/80"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-5 w-32 bg-muted/80 rounded"></div>
                            <div className="h-8 w-24 bg-muted/80 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 w-24 bg-muted/80 rounded"></div>
                            <div className="h-5 w-32 bg-muted/80 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
    </Card>
);

const HistorySkeleton = () => (
    <Card className="animate-pulse">
        <CardContent className="p-4">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted/80"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 bg-muted/80 rounded"></div>
                    <div className="h-4 w-full bg-muted/80 rounded"></div>
                    <div className="h-4 w-3/4 bg-muted/80 rounded"></div>
                    <div className="flex gap-2">
                        <div className="h-6 w-20 bg-muted/80 rounded"></div>
                        <div className="h-6 w-20 bg-muted/80 rounded"></div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function VersionControl() {
    const [currentVersion, setCurrentVersion] = useState<AppVersion | null>(null);
    const [versionHistory, setVersionHistory] = useState<AppVersion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageLimit, setPageLimit] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [androidVersion, setAndroidVersion] = useState("");
    const [iosVersion, setIosVersion] = useState("");
    const [remarks, setRemarks] = useState("");

    const hasFetched = useRef(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        let isMounted = true;

        const loadVersionData = async () => {
            if (!hasFetched.current) {
                hasFetched.current = true;
                if (isMounted) {
                    await fetchVersionData();
                }
            }
        };

        loadVersionData();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        fetchVersionData();
    }, [currentPage, pageLimit]);

    const fetchVersionData = async () => {
        try {
            setIsLoading(true);
            setIsHistoryLoading(true);

            const limit = pageLimit === -1 ? 1000 : pageLimit + 1;
            const response = await apiService.getAppVersion(currentPage, limit);

            if (response.success && response.data.data.length > 0) {
                setCurrentVersion(response.data.data[0]);
                setVersionHistory(response.data.data.slice(1));
                setTotalRecords(response.data.total - 1);
                setTotalPages(Math.ceil((response.data.total - 1) / pageLimit));
            }
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || "Failed to fetch version data");
        } finally {
            setIsLoading(false);
            setIsHistoryLoading(false);
        }
    };

    const handleOpenDialog = () => {
        if (currentVersion) {
            setAndroidVersion(currentVersion.androidVersion);
            setIosVersion(currentVersion.iosVersion);
            setRemarks(currentVersion.remarks || currentVersion.notes || "");
        }
        setIsDialogOpen(true);
    };

    const handleSaveVersion = async () => {
        if (!androidVersion.trim()) {
            toast.error("Android version is required");
            return;
        }

        if (!iosVersion.trim()) {
            toast.error("iOS version is required");
            return;
        }

        if (!remarks.trim()) {
            toast.error("Remarks is required");
            return;
        }

        setIsSaving(true);

        try {
            const response = await apiService.updateAppVersion({
                androidVersion: androidVersion,
                iosVersion: iosVersion,
                notes: remarks,
            });

            if (response.success) {
                toast.success(response.message || "Version updated successfully");
                await fetchVersionData();
                setIsDialogOpen(false);
            }
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || "Failed to update version");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLimitChange = (value: string) => {
        const newLimit = value === "all" ? -1 : parseInt(value);
        setPageLimit(newLimit);
        setCurrentPage(1);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDateShort = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
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
                <h1 className="text-3xl font-bold">Version Control</h1>
                <Button onClick={handleOpenDialog} disabled={isLoading}>
                    <Edit className="mr-2 h-4 w-4" />
                    Update Version
                </Button>
            </div>

            {isLoading ? (
                <VersionSkeleton />
            ) : (
                currentVersion && (
                    <div className="grid gap-6">
                        <Card className="shadow-card">
                            <CardContent className="p-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                                <Smartphone className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">Android Version</h3>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {currentVersion.androidVersion}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <Apple className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">iOS Version</h3>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {currentVersion.iosVersion}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {(currentVersion.remarks || currentVersion.notes) && (
                                    <div className="mt-6 pt-6 border-t">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">Remarks</p>
                                            <p className="font-medium text-gray-700">
                                                {currentVersion.remarks || currentVersion.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Force Update</p>
                                            <p className="font-medium">
                                                {currentVersion.isForceUpdate ? "Enabled" : "Disabled"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Release Date</p>
                                            <p className="font-medium">{formatDate(currentVersion.releaseDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Last Updated</p>
                                            <p className="font-medium">{formatDate(currentVersion.updatedAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Created At</p>
                                            <p className="font-medium">{formatDate(currentVersion.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            )}

            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Version History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isHistoryLoading ? (
                        <div className="space-y-4">
                            <HistorySkeleton />
                            <HistorySkeleton />
                            <HistorySkeleton />
                        </div>
                    ) : versionHistory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No version history available
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {versionHistory.map((version, index) => (
                                    <Card key={version._id || index} className="shadow-card hover:shadow-lg transition-shadow">
                                        <CardContent className="p-5">
                                            <div className="grid gap-4 md:grid-cols-2 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                                        <Smartphone className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-muted-foreground">Android</h4>
                                                        <p className="text-xl font-bold text-green-600">
                                                            {version.androidVersion}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                        <Apple className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-muted-foreground">iOS</h4>
                                                        <p className="text-xl font-bold text-blue-600">
                                                            {version.iosVersion}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {(version.remarks || version.notes) && (
                                                <div className="pt-4 border-t">
                                                    <p className="text-xs text-muted-foreground mb-1">Remarks</p>
                                                    <p className="text-sm text-gray-700">
                                                        {version.remarks || version.notes}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="pt-4 border-t mt-4">
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Release Date</p>
                                                        <p className="text-sm font-medium">{formatDate(version.releaseDate)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Created At</p>
                                                        <p className="text-sm font-medium">{formatDate(version.createdAt)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {totalRecords > 0 && (
                                <div className="flex items-center justify-between mt-6 pt-6 border-t">
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
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Update App Version</DialogTitle>
                        <DialogDescription>
                            Update the Android and iOS app versions below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="androidVersion">Android Version</Label>
                            <Input
                                id="androidVersion"
                                value={androidVersion}
                                onChange={(e) => setAndroidVersion(e.target.value)}
                                placeholder="e.g., 1.0.0"
                                disabled={isSaving}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="iosVersion">iOS Version</Label>
                            <Input
                                id="iosVersion"
                                value={iosVersion}
                                onChange={(e) => setIosVersion(e.target.value)}
                                placeholder="e.g., 1.0.0"
                                disabled={isSaving}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="What changes were made in this version?"
                                disabled={isSaving}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveVersion} disabled={isSaving}>
                            {isSaving ? "Updating..." : "Update Version"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}