import { useEffect, useMemo, useState } from "react";
import {
  Flame,
  ImageIcon,
  Landmark,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import Loader from "@/components/Loader/Loader";
import { TempleFormDialog } from "../components/puja/TempleFormDialog";
import { TempleImagesDialog } from "../components/puja/TempleImagesDialog";
import { TemplePujasDialog } from "../components/puja/TemplePujasDialog";
import { useAdminTemples, useDeleteTemple } from "../hooks/usePujaAdmin";
import type { AdminTempleListItem } from "../types/puja";
import { formatDate, formatPrice } from "../utils/puja";

const PAGE_SIZE = 20;

export default function AdminPujaPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTemple, setEditingTemple] =
    useState<AdminTempleListItem | null>(null);
  const [imagesTemple, setImagesTemple] =
    useState<AdminTempleListItem | null>(null);
  const [pujasTemple, setPujasTemple] = useState<AdminTempleListItem | null>(
    null,
  );
  const [templeToDelete, setTempleToDelete] =
    useState<AdminTempleListItem | null>(null);

  // Debounced so typing a temple name doesn't fire a query per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const params = useMemo(
    () => ({ search, page, limit: PAGE_SIZE }),
    [search, page],
  );

  const { data, isLoading, isFetching, isError, error } =
    useAdminTemples(params);
  const deleteTemple = useDeleteTemple();

  const temples = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const isSearching = search.trim().length > 0;

  const openCreate = () => {
    setEditingTemple(null);
    setFormOpen(true);
  };

  const openEdit = (temple: AdminTempleListItem) => {
    setEditingTemple(temple);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!templeToDelete) return;
    try {
      await deleteTemple.mutateAsync(templeToDelete.id);
      setTempleToDelete(null);
    } catch {
      // hook surfaces the error; keep the dialog open so it can be retried
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
            Puja Management
          </h2>
          <p className="max-w-2xl text-sm text-white/60 sm:text-base">
            Manage temples, their image galleries and the Pujas they offer.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreate}
          className="shrink-0 bg-[#BC6A4D] text-white hover:bg-[#BC6A4D]/90"
        >
          <Plus className="h-4 w-4" />
          Add Temple
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, location, state or deity…"
          className="border-white/10 bg-white/[0.03] pl-9 text-white placeholder:text-white/35"
        />
        {isFetching && !isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/40" />
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-red-400">
            {(error as Error)?.message ?? "Could not load temples"}
          </p>
        </div>
      ) : temples.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/10 py-16 text-center">
          <Landmark className="h-10 w-10 text-white/25" />
          {isSearching ? (
            <p className="text-sm text-white/60">
              No temples match “{search}”.
            </p>
          ) : (
            <>
              <p className="text-white/80">No temples added yet.</p>
              <p className="text-sm text-white/50">
                Add your first temple to start managing Puja services.
              </p>
              <Button
                type="button"
                onClick={openCreate}
                className="mt-1 bg-[#BC6A4D] text-white hover:bg-[#BC6A4D]/90"
              >
                <Plus className="h-4 w-4" />
                Add Temple
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/60">Temple</TableHead>
                <TableHead className="text-white/60">Location</TableHead>
                <TableHead className="hidden md:table-cell text-white/60">Deity</TableHead>
                <TableHead className="text-white/60">From</TableHead>
                <TableHead className="hidden sm:table-cell text-white/60">Pujas</TableHead>
                <TableHead className="hidden sm:table-cell text-white/60">Images</TableHead>
                <TableHead className="hidden lg:table-cell text-white/60">Created</TableHead>
                <TableHead className="text-right text-white/60">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {temples.map((temple) => (
                <TableRow
                  key={temple.id}
                  className="border-white/10 hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5"
                        style={
                          !temple.coverImage && temple.gradient
                            ? { background: temple.gradient }
                            : undefined
                        }
                      >
                        {temple.coverImage ? (
                          <img
                            src={temple.coverImage.url}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {temple.name}
                        </p>
                        <p className="truncate text-xs text-white/40">
                          /{temple.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/70">
                    <p className="text-sm">{temple.location}</p>
                    <p className="text-xs text-white/40">{temple.state}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-white/70">
                    {temple.deity}
                  </TableCell>
                  <TableCell className="text-sm text-[#BC6A4D]">
                    {formatPrice(temple.priceFrom)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-white/70">
                    {temple.pujaCount}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-white/70">
                    {temple.imageCount}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell whitespace-nowrap text-sm text-white/50">
                    {formatDate(temple.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(temple)}
                        className="text-white/60 hover:bg-white/5 hover:text-white"
                        aria-label={`Edit ${temple.name}`}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setPujasTemple(temple)}
                        className="text-white/60 hover:bg-white/5 hover:text-white"
                        aria-label={`Manage Pujas for ${temple.name}`}
                        title="Manage Pujas"
                      >
                        <Flame className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setImagesTemple(temple)}
                        className="text-white/60 hover:bg-white/5 hover:text-white"
                        aria-label={`Manage images for ${temple.name}`}
                        title="Manage Images"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setTempleToDelete(temple)}
                        className="text-white/60 hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Delete ${temple.name}`}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/50">
            Page {data?.page} of {totalPages} · {data?.total} temple(s)
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <TempleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        temple={editingTemple}
      />

      <TempleImagesDialog
        open={Boolean(imagesTemple)}
        onOpenChange={(next) => !next && setImagesTemple(null)}
        templeId={imagesTemple?.id ?? null}
        templeName={imagesTemple?.name}
      />

      <TemplePujasDialog
        open={Boolean(pujasTemple)}
        onOpenChange={(next) => !next && setPujasTemple(null)}
        templeId={pujasTemple?.id ?? null}
        templeName={pujasTemple?.name}
      />

      <AlertDialog
        open={Boolean(templeToDelete)}
        onOpenChange={(next) => !next && setTempleToDelete(null)}
      >
        <AlertDialogContent className="border-white/10 bg-[#0a1628] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg tracking-wide text-white">
              Delete {templeToDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-white/60">
                <p>This will permanently delete:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Temple details</li>
                  <li>
                    All associated Pujas ({templeToDelete?.pujaCount ?? 0})
                  </li>
                  <li>
                    All associated images ({templeToDelete?.imageCount ?? 0}),
                    including the files stored on Cloudinary
                  </li>
                </ul>
                <p>This cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteTemple.isPending}
              className="border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleteTemple.isPending}
              className="bg-red-600 text-white hover:bg-red-600/90"
            >
              {deleteTemple.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Delete Temple
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
