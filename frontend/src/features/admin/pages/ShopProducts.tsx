import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Search, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { ProductFormDialog } from "../components/shop/ProductFormDialog";
import {
  useActiveShopCategories,
  useAdminShopProducts,
  useDeleteShopProduct,
} from "../hooks/useShopAdmin";
import type { AdminShopProduct } from "../types/shop";
import { formatDate, formatPrice } from "../utils/shop";

const PAGE_SIZE = 20;
const ALL_CATEGORIES = "all";
const ALL_STATUSES = "all";

export default function AdminShopProductsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<AdminShopProduct | null>(null);
  const [productToDelete, setProductToDelete] =
    useState<AdminShopProduct | null>(null);

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
      page,
      limit: PAGE_SIZE,
      categoryId: categoryFilter === ALL_CATEGORIES ? undefined : categoryFilter,
      isActive:
        statusFilter === ALL_STATUSES ? undefined : statusFilter === "active",
    }),
    [search, page, categoryFilter, statusFilter],
  );

  const { data, isLoading, isFetching, isError, error } =
    useAdminShopProducts(params);
  const { data: categories = [] } = useActiveShopCategories();
  const deleteProduct = useDeleteShopProduct();

  const products = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const isFiltering =
    search.trim().length > 0 ||
    categoryFilter !== ALL_CATEGORIES ||
    statusFilter !== ALL_STATUSES;

  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product: AdminShopProduct) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct.mutateAsync(productToDelete.id);
      setProductToDelete(null);
    } catch {
      // hook surfaces the error; keep the dialog open so it can be retried
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
            Shop Products
          </h2>
          <p className="max-w-2xl text-sm text-white/60 sm:text-base">
            Manage gemstones, bracelets and other devotional products.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreate}
          className="shrink-0 bg-[#BC6A4D] text-white hover:bg-[#BC6A4D]/90"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by product name or slug…"
            className="border-white/10 bg-white/[0.03] pl-9 text-white placeholder:text-white/35"
          />
          {isFetching && !isLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/40" />
          )}
        </div>

        <Select
          value={categoryFilter}
          onValueChange={(value) => {
            setCategoryFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="border-white/10 bg-white/[0.03] text-white sm:w-52">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
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
          <SelectTrigger className="border-white/10 bg-white/[0.03] text-white sm:w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
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
            {(error as Error)?.message ?? "Could not load products"}
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/10 py-16 text-center">
          <ShoppingBag className="h-10 w-10 text-white/25" />
          {isFiltering ? (
            <p className="text-sm text-white/60">
              No products match your filters.
            </p>
          ) : (
            <>
              <p className="text-white/80">No products added yet.</p>
              <p className="text-sm text-white/50">
                Add your first product to start building the shop catalog.
              </p>
              <Button
                type="button"
                onClick={openCreate}
                className="mt-1 bg-[#BC6A4D] text-white hover:bg-[#BC6A4D]/90"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/60">Product</TableHead>
                <TableHead className="text-white/60">Category</TableHead>
                <TableHead className="text-white/60">Price</TableHead>
                <TableHead className="hidden sm:table-cell text-white/60">Status</TableHead>
                <TableHead className="hidden lg:table-cell text-white/60">Created</TableHead>
                <TableHead className="text-right text-white/60">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  className="border-white/10 hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5"
                        style={
                          !product.image && product.gradient
                            ? { background: product.gradient }
                            : undefined
                        }
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {product.name}
                        </p>
                        <p className="truncate text-xs text-white/40">
                          /{product.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-white/70">
                    {product.categoryName}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-[#BC6A4D]">
                      {formatPrice(product.price)}
                    </p>
                    {product.originalPrice && (
                      <p className="text-xs text-white/40 line-through">
                        {formatPrice(product.originalPrice)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant="outline"
                      className={
                        product.isActive
                          ? "border-emerald-500/30 text-emerald-400"
                          : "border-white/15 text-white/50"
                      }
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell whitespace-nowrap text-sm text-white/50">
                    {formatDate(product.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(product)}
                        className="text-white/60 hover:bg-white/5 hover:text-white"
                        aria-label={`Edit ${product.name}`}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setProductToDelete(product)}
                        className="text-white/60 hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Delete ${product.name}`}
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
            Page {data?.page} of {totalPages} · {data?.total} product(s)
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

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
      />

      <AlertDialog
        open={Boolean(productToDelete)}
        onOpenChange={(next) => !next && setProductToDelete(null)}
      >
        <AlertDialogContent className="border-white/10 bg-[#0a1628] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg tracking-wide text-white">
              Delete {productToDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will permanently delete the product. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteProduct.isPending}
              className="border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleteProduct.isPending}
              className="bg-red-600 text-white hover:bg-red-600/90"
            >
              {deleteProduct.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
