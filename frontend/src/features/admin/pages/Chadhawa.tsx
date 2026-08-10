import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminChadhawaPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
          Chadhawa Management
        </h2>
        <p className="max-w-2xl text-sm text-white/60 sm:text-base">
          Create and manage devotional offerings.
        </p>
      </div>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-lg text-white">No Chadhawa offerings yet</CardTitle>
          <CardDescription className="text-white/55">
            Content management for Chadhawa will live here. Public pages continue
            to use their current data until admin CRUD is connected.
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
            Add Chadhawa
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
