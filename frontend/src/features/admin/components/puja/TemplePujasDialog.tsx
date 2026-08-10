import { useState } from "react";
import { Flame, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useAdminTemple, useDeletePuja } from "../../hooks/usePujaAdmin";
import type { AdminPuja } from "../../types/puja";
import { formatPrice } from "../../utils/puja";
import { PujaFormDialog } from "./PujaFormDialog";

interface TemplePujasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templeId: string | null;
  templeName?: string;
}

export function TemplePujasDialog({
  open,
  onOpenChange,
  templeId,
  templeName,
}: TemplePujasDialogProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingPuja, setEditingPuja] = useState<AdminPuja | null>(null);
  const [pujaToDelete, setPujaToDelete] = useState<AdminPuja | null>(null);

  const { data: temple, isLoading, isError, error } = useAdminTemple(
    open ? templeId : null,
  );
  const deletePuja = useDeletePuja();

  const pujas = temple?.pujas ?? [];

  const openCreate = () => {
    setEditingPuja(null);
    setFormOpen(true);
  };

  const openEdit = (puja: AdminPuja) => {
    setEditingPuja(puja);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pujaToDelete || !templeId) return;
    try {
      await deletePuja.mutateAsync({ pujaId: pujaToDelete.id, templeId });
    } catch {
      // hook surfaces the error
    } finally {
      setPujaToDelete(null);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => !deletePuja.isPending && onOpenChange(next)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#0a1628] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg tracking-wide text-white">
              {templeName ?? temple?.name ?? "Temple"}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Manage the Pujas offered at this temple.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-white/50" />
            </div>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-red-400">
              {(error as Error)?.message ?? "Could not load Pujas"}
            </p>
          ) : pujas.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/10 py-10 text-center">
              <Flame className="h-8 w-8 text-white/30" />
              <p className="text-sm text-white/60">
                No Pujas added for this temple yet.
              </p>
              <Button
                type="button"
                onClick={openCreate}
                className="bg-[#BC6A4D] text-white hover:bg-[#BC6A4D]/90"
              >
                <Plus className="h-4 w-4" />
                Add Puja
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-white/10 rounded-lg border border-white/10">
              {pujas.map((puja) => (
                <li
                  key={puja.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-medium text-white">{puja.name}</span>
                      <span className="text-sm text-[#BC6A4D]">
                        {formatPrice(puja.price)}
                      </span>
                      <span className="text-sm text-white/50">
                        {puja.duration}
                      </span>
                    </div>
                    <ul className="flex flex-wrap gap-1.5">
                      {puja.benefits.map((benefit, index) => (
                        <li
                          key={index}
                          className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-white/60"
                        >
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(puja)}
                      className="text-white/60 hover:bg-white/5 hover:text-white"
                      aria-label={`Edit ${puja.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setPujaToDelete(puja)}
                      className="text-white/60 hover:bg-red-500/10 hover:text-red-400"
                      aria-label={`Delete ${puja.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {pujas.length > 0 && (
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={openCreate}
                className="bg-[#BC6A4D] text-white hover:bg-[#BC6A4D]/90"
              >
                <Plus className="h-4 w-4" />
                Add Puja
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {templeId && (
        <PujaFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          templeId={templeId}
          puja={editingPuja}
        />
      )}

      <AlertDialog
        open={Boolean(pujaToDelete)}
        onOpenChange={(next) => !next && setPujaToDelete(null)}
      >
        <AlertDialogContent className="border-white/10 bg-[#0a1628] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg tracking-wide text-white">
              Delete {pujaToDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This permanently removes the Puja and its benefits. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deletePuja.isPending}
              className="border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deletePuja.isPending}
              className="bg-red-600 text-white hover:bg-red-600/90"
            >
              {deletePuja.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default TemplePujasDialog;
