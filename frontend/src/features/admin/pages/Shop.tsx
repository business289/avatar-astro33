import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminShopPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
          Divine Shop Management
        </h2>
        <p className="max-w-2xl text-sm text-white/60 sm:text-base">
          Create and manage spiritual products such as gemstones and other
          devotional products.
        </p>
      </div>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-lg text-white">No products yet</CardTitle>
          <CardDescription className="text-white/55">
            Product management for the Divine Shop will live here. Public shop
            pages continue to use their current data until admin CRUD is
            connected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            className="bg-[#BC6A4D] text-white hover:bg-[#BC6A4D]/90"
            disabled
            title="Coming soon"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
