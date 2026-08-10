import prisma from "@root/prisma.js";
import { ApiError } from "@/utils/ApiError.js";
import STATUS_CODES from "@/utils/statusCodes.js";
import type { AdminDashboardData } from "./admin.types.js";

const ADMIN_ROLES = new Set(["ADMIN", "SUPERADMIN", "SUPER_ADMIN"]);

class AdminService {
  async getDashboard(userId: string): Promise<AdminDashboardData> {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        isDeleted: false,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userRoleMappings: {
          include: {
            role: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new ApiError("User not found", STATUS_CODES.UNAUTHORIZED);
    }

    const roleNames = user.userRoleMappings.map((mapping) => mapping.role.name);
    const isAdmin = roleNames.some((name) => ADMIN_ROLES.has(name));

    if (!isAdmin) {
      throw new ApiError(
        "You do not have permission to access this resource",
        STATUS_CODES.FORBIDDEN,
      );
    }

    const role: AdminDashboardData["role"] = roleNames.includes("SUPERADMIN") ||
      roleNames.includes("SUPER_ADMIN")
      ? "SUPERADMIN"
      : "ADMIN";

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      role,
    };
  }
}

export default AdminService;
