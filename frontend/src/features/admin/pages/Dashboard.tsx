import { Link, Navigate } from "react-router-dom";
import { Flame, Flower2, Store } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { AuthApiError } from "@/lib/authClient";
import Loader from "@/components/Loader/Loader";

const sections = [
  {
    to: "/admin/puja",
    title: "Puja",
    description: "Manage Puja offerings",
    icon: Flame,
  },
  {
    to: "/admin/chadhawa",
    title: "Chadhawa",
    description: "Manage devotional offerings",
    icon: Flower2,
  },
  {
    to: "/admin/shop/products",
    title: "Shop",
    description: "Manage Divine Shop products",
    icon: Store,
  },
] as const;

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard();

  if (error instanceof AuthApiError && error.status === 403) {
    return <Navigate to="/" replace />;
  }

  if (error instanceof AuthApiError && error.status === 401) {
    return <Navigate to="/login" replace />;
  }

  const welcomeName =
    [data?.user.firstName, data?.user.lastName].filter(Boolean).join(" ") ||
    data?.user.email ||
    "Admin";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-2xl tracking-wide text-white sm:text-3xl">
          {isLoading ? "Welcome" : `Welcome, ${welcomeName}`}
        </h2>
        <p className="max-w-2xl text-sm text-white/60 sm:text-base">
          Manage your spiritual offerings and store content from one place.
        </p>
        {data?.role && (
          <p className="text-xs uppercase tracking-wider text-[#BC6A4D]/80">
            Role · {data.role}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <Loader />
          <p className="text-sm text-white/50">Verifying admin access…</p>
        </div>
      )}

      {error &&
        !(
          error instanceof AuthApiError &&
          (error.status === 401 || error.status === 403)
        ) && (
          <p className="text-sm text-red-400">
            Could not load dashboard details. You can still navigate the admin
            sections.
          </p>
        )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ to, title, description, icon: Icon }) => (
          <Link key={to} to={to} className="group block">
            <Card className="h-full border-white/10 bg-white/[0.03] transition-colors group-hover:border-[#BC6A4D]/40 group-hover:bg-white/[0.05]">
              <CardHeader className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#BC6A4D]/15 text-[#BC6A4D]">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg text-white">{title}</CardTitle>
                <CardDescription className="text-white/55">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-[#BC6A4D] group-hover:underline">
                  Open
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
