import { useEffect, useMemo, useState } from "react";
import { Flower2, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ChadhawaFormDialog } from "../components/chadhawa/ChadhawaFormDialog";
import {
  useAdminChadhawas,
  useAdminTempleOptions,
  useDeleteChadhawa,
  useUpdateChadhawa,
} from "../hooks/useChadhawaAdmin";
import type { AdminChadhawa } from "../types/chadhawa";
import { formatDate, formatPrice } from "../utils/puja";

const PAGE_SIZE = 20;
const ALL = "all";

export default function AdminChadhawaPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [templeFilter, setTempleFilter] = useState<string>(ALL);
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminChadhawa | null>(null);
  const [toDelete, setToDelete] = useState<AdminChadhawa | null>(null);

  // Debounced so typing an offering name doesn't fire a query per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const params = useMemo(
    () => ({
      search,
      templeId: templeFilter === ALL ? undefined : templeFilter,
      isActive: statusFilter === ALL ? undefined : statusFilter === "active",
      page,
      limit: PAGE_SIZE,
    }),
    [search, templeFilter, statusFilter, page],
  );

  const { data, isLoading, isFetching, isError, error } =
    useAdminChadhawas(params);
  const { data: temples = [] } = useAdminTempleOptions();
  const deleteChadhawa = useDeleteChadhawa();
  const updateChadhawa = useUpdateChadhawa();

  const offerings = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const isFiltering =
    search.trim().length > 0 || templeFilter !== ALL || statusFilter !== ALL;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (offering: AdminChadhawa) => {
    setEditing(offering);
    setFormOpen(true);
  };

  const toggleActive = (offering: AdminChadhawa) =>
    updateChadhawa.mutate({
      chadhawaId: offering.id,
      values: { isActive: !offering.isActive },
    });

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteChadhawa.mutateAsync(toDelete.id);
      setToDelete(null);
    } catch {
      // hook surfaces the error; keep the dialog open so it can be retried
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
            Chadhawa Management
          </h2>
          <p className="max-w-2xl text-sm text-white/60 sm:text-base">
            Manage the devotional offerings available at each temple.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreate}
          className="shrink-0 bg-[#BC6A4D] text-white hover:bg-[#BC6A4D]/90"
        >
          <Plus className="h-4 w-4" />
          Add Offering
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by offering, description or temple…"
            className="border-white/10 bg-white/[0.03] pl-9 text-white placeholder:text-white/35"
          />
          {isFetching && !isLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/40" />
          )}
        </div>

        <Select
          value={templeFilter}
          onValueChange={(value) => {
            setTempleFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full border-white/10 bg-white/[0.03] text-white sm:w-56">
            <SelectValue placeholder="All temples" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#0a1628] text-white">
            <SelectItem value={ALL}>All temples</SelectItem>
            {temples.map((temple) => (
              <SelectItem key={temple.id} value={temple.id}>
                {temple.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full border-white/10 bg-white/[0.03] text-white sm:w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#0a1628] text-white">
            <SelectItem value={ALL}>All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-red-400">
            {(error as Error)?.message ?? "Could not load Chadhawa offerings"}
          </p>
        </div>
      ) : offerings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/10 py-16 text-center">
          <Flower2 className="h-10 w-10 text-white/25" />
          {isFiltering ? (
            <p className="text-sm text-white/60">
              No offerings match the current filters.
            </p>
          ) : (
            <>
              <p className="text-white/80">No Chadhawa offerings yet.</p>
              <p className="text-sm text-white/50">
                Add your first offering to start managing Chadhawa.
              </p>
              <Button
                type="button"
                onClick={openCreate}
                className="mt-1 bg-[#BC6A4D] text-white hover:bg-[#BC6A4D]/90"
              >
                <Plus className="h-4 w-4" />
                Add Offering
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/60">Order</TableHead>
                <TableHead className="text-white/60">Offering</TableHead>
                <TableHead className="text-white/60">Temple</TableHead>
                <TableHead className="hidden lg:table-cell text-white/60">
                  Description
                </TableHead>
                <TableHead className="text-white/60">Price</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="hidden lg:table-cell text-white/60">
                  Created
                </TableHead>
                <TableHead className="text-right text-white/60">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offerings.map((offering) => (
                <TableRow
                  key={offering.id}
                  className="border-white/10 hover:bg-white/[0.02]"
                >
                  <TableCell className="text-sm text-white/50">
                    {offering.displayOrder}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-lg"
                      >
                        {offering.emoji ?? ""}
                      </span>
                      <p className="font-medium text-white">{offering.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-white/70">
                    {offering.templeName}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-xs">
                    <p className="truncate text-sm text-white/55">
                      {offering.description}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-[#BC6A4D]">
                    {formatPrice(offering.price)}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => toggleActive(offering)}
                      disabled={updateChadhawa.isPending}
                      title={
                        offering.isActive
                          ? "Deactivate this offering"
                          : "Activate this offering"
                      }
                      className={
                        offering.isActive
                          ? "rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                          : "rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/50 transition-colors hover:bg-white/10 disabled:opacity-50"
                      }
                    >
                      {offering.isActive ? "Active" : "Inactive"}
                    </button>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell whitespace-nowrap text-sm text-white/50">
                    {formatDate(offering.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(offering)}
                        className="text-white/60 hover:bg-white/5 hover:text-white"
                        aria-label={`Edit ${offering.name}`}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setToDelete(offering)}
                        className="text-white/60 hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Delete ${offering.name}`}
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
            Page {data?.page} of {totalPages} · {data?.total} offering(s)
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

      <ChadhawaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        chadhawa={editing}
        defaultTempleId={templeFilter === ALL ? undefined : templeFilter}
      />

      <AlertDialog
        open={Boolean(toDelete)}
        onOpenChange={(next) => !next && setToDelete(null)}
      >
        <AlertDialogContent className="border-white/10 bg-[#0a1628] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg tracking-wide text-white">
              Delete {toDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This permanently removes the offering from{" "}
              {toDelete?.templeName}. To hide it without losing the record,
              set it to Inactive instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteChadhawa.isPending}
              className="border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleteChadhawa.isPending}
              className="bg-red-600 text-white hover:bg-red-600/90"
            >
              {deleteChadhawa.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Delete Offering
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
