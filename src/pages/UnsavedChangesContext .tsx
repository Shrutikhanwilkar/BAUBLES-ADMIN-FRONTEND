import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type UnsavedChangesContextType = {
    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: (value: boolean) => void;
    confirmNavigation: (callback: () => void) => void;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextType | null>(null);

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

    const confirmNavigation = useCallback((callback: () => void) => {
        if (hasUnsavedChanges) {
            setPendingCallback(() => callback);
            setIsDialogOpen(true);
        } else {
            callback();
        }
    }, [hasUnsavedChanges]);

    const handleConfirm = () => {
        setHasUnsavedChanges(false);
        setIsDialogOpen(false);
        if (pendingCallback) {
            pendingCallback();
            setPendingCallback(null);
        }
    };

    const handleCancel = () => {
        setIsDialogOpen(false);
        setPendingCallback(null);
    };

    return (
        <UnsavedChangesContext.Provider value={{ hasUnsavedChanges, setHasUnsavedChanges, confirmNavigation }}>
            {children}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Discard changes?</DialogTitle>
                        <DialogDescription>
                            You have unsaved changes. If you leave this page, your changes will be discarded.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancel}>
                            Stay on Page
                        </Button>
                        <Button variant="destructive" onClick={handleConfirm}>
                            Discard Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </UnsavedChangesContext.Provider>
    );
}

export function useUnsavedChanges() {
    const context = useContext(UnsavedChangesContext);
    if (!context) {
        throw new Error("useUnsavedChanges must be used within UnsavedChangesProvider");
    }
    return context;
}