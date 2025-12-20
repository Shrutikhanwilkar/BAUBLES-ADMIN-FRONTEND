import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Smartphone, Apple } from "lucide-react";
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

export default function VersionControl() {
    const [versionData, setVersionData] = useState<AppVersion | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [androidVersion, setAndroidVersion] = useState("");
    const [iosVersion, setIosVersion] = useState("");
    const [remarks, setRemarks] = useState("");

    const hasFetched = useRef(false);

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

    const fetchVersionData = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getAppVersion();
            if (response.success) {
                setVersionData(response.data);
            }
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || "Failed to fetch version data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = () => {
        if (versionData) {
            setAndroidVersion(versionData.androidVersion);
            setIosVersion(versionData.iosVersion);
            setRemarks(versionData.remarks || versionData.notes || "");
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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
                versionData && (
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
                                                    {versionData.androidVersion}
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
                                                    {versionData.iosVersion}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {(versionData.remarks || versionData.notes) && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">Remarks</p>
                                            <p className="font-medium text-gray-700">
                                                {versionData.remarks || versionData.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Force Update</p>
                                            <p className="font-medium">
                                                {versionData.isForceUpdate ? "Enabled" : "Disabled"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Release Date</p>
                                            <p className="font-medium">{formatDate(versionData.releaseDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Last Updated</p>
                                            <p className="font-medium">{formatDate(versionData.updatedAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Created At</p>
                                            <p className="font-medium">{formatDate(versionData.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            )}

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