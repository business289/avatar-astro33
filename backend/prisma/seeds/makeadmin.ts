import prisma from "../../prisma";

const USER_EMAIL = "nikhil.233644108@vcet.edu.in";

async function main() {
  // Find existing user
  const user = await prisma.user.findUnique({
    where: {
      email: USER_EMAIL,
    },
  });

  if (!user) {
    throw new Error(`User not found: ${USER_EMAIL}`);
  }

  // Find ADMIN role
  const adminRole = await prisma.role.findUnique({
    where: {
      name: "ADMIN",
    },
  });

  if (!adminRole) {
    throw new Error("ADMIN role does not exist. Run your role seed first.");
  }

  // Assign ADMIN role
  await prisma.userRoleMapping.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: adminRole.id,
      assignedBy: user.id,
    },
  });

  console.log(`✓ ${USER_EMAIL} is now an ADMIN`);
}

main()
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
