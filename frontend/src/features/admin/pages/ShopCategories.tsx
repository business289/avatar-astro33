import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Search, Tags, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { CategoryFormDialog } from "../components/shop/CategoryFormDialog";
import { useAdminShopCategories, useDeleteShopCategory } from "../hooks/useShopAdmin";
import type { AdminShopCategory } from "../types/shop";
import { formatDate } from "../utils/shop";

const PAGE_SIZE = 20;

export default function AdminShopCategoriesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<AdminShopCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] =
    useState<AdminShopCategory | null>(null);

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
    useAdminShopCategories(params);
  const deleteCategory = useDeleteShopCategory();

  const categories = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const isSearching = search.trim().length > 0;

  const openCreate = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const openEdit = (category: AdminShopCategory) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory.mutateAsync(categoryToDelete.id);
      setCategoryToDelete(null);
    } catch {
      // hook surfaces the error; keep the dialog open so it can be retried
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
            Shop Categories
          </h2>
          <p className="max-w-2xl text-sm text-white/60 sm:text-base">
            Manage the categories that shop products belong to.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreate}
          className="shrink-0 bg-[#BC6A4D] text-white hover:bg-[#BC6A4D]/90"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search categories by name…"
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
            {(error as Error)?.message ?? "Could not load categories"}
          </p>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/10 py-16 text-center">
          <Tags className="h-10 w-10 text-white/25" />
          {isSearching ? (
            <p className="text-sm text-white/60">
              No categories match “{search}”.
            </p>
          ) : (
            <>
              <p className="text-white/80">No categories added yet.</p>
              <p className="text-sm text-white/50">
                Add your first category to start organizing shop products.
              </p>
              <Button
                type="button"
                onClick={openCreate}
                className="mt-1 bg-[#BC6A4D] text-white hover:bg-[#BC6A4D]/90"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/60">Category</TableHead>
                <TableHead className="text-white/60">Slug</TableHead>
                <TableHead className="text-white/60">Products</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="hidden lg:table-cell text-white/60">Created</TableHead>
                <TableHead className="text-right text-white/60">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow
                  key={category.id}
                  className="border-white/10 hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <p className="truncate font-medium text-white">
                        {category.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-white/50">
                    /{category.slug}
                  </TableCell>
                  <TableCell className="text-sm text-white/70">
                    {category.productCount}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        category.isActive
                          ? "border-emerald-500/30 text-emerald-400"
                          : "border-white/15 text-white/50"
                      }
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell whitespace-nowrap text-sm text-white/50">
                    {formatDate(category.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(category)}
                        className="text-white/60 hover:bg-white/5 hover:text-white"
                        aria-label={`Edit ${category.name}`}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setCategoryToDelete(category)}
                        className="text-white/60 hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Delete ${category.name}`}
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
            Page {data?.page} of {totalPages} · {data?.total} categor
            {data?.total === 1 ? "y" : "ies"}
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

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
      />

      <AlertDialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(next) => !next && setCategoryToDelete(null)}
      >
        <AlertDialogContent className="border-white/10 bg-[#0a1628] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg tracking-wide text-white">
              Delete {categoryToDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              {categoryToDelete && categoryToDelete.productCount > 0
                ? `This category has ${categoryToDelete.productCount} product(s). Move or delete those products first.`
                : "This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteCategory.isPending}
              className="border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={
                deleteCategory.isPending ||
                Boolean(categoryToDelete && categoryToDelete.productCount > 0)
              }
              className="bg-red-600 text-white hover:bg-red-600/90"
            >
              {deleteCategory.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
