/**
 * Promotes an existing user to admin so they can sign in and access /admin.
 *
 * There's no UI for this on purpose — granting admin access is a one-time,
 * trusted-operator action, not something to expose behind a web form.
 *
 * 1. Have the person create a normal account at /register first.
 * 2. Run this with either their email or their Supabase user id (the UUID
 *    is visible in the Supabase dashboard under Authentication > Users):
 *
 *   npx tsx scripts/promote-admin.ts admin@buynest.com
 *   npx tsx scripts/promote-admin.ts 8f14e45f-ceea-4c9c-8e7e-...
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function main() {
  const identifier = process.argv[2];

  if (!identifier) {
    console.error("Usage: npx tsx scripts/promote-admin.ts <user-email-or-id>");
    process.exit(1);
  }

  let userId = identifier;

  if (!UUID_RE.test(identifier)) {
    const supabase = createAdminClient();
    // listUsers() is paginated (50/page by default) — plenty for finding a
    // specific person on a project this size; loop with `page` if you ever
    // need to search a larger user base.
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Failed to look up users:", error.message);
      process.exit(1);
    }

    const match = data.users.find((user) => user.email === identifier);

    if (!match) {
      console.error(`No user found with email "${identifier}". Sign up at /register first.`);
      process.exit(1);
    }

    userId = match.id;
  }

  try {
    await prisma.profile.update({ where: { id: userId }, data: { role: "admin" } });
  } catch {
    console.error(
      `Couldn't find a profile for id "${userId}". Make sure the user has signed up already.`,
    );
    process.exit(1);
  }

  console.log(`Promoted ${userId} to admin. They can now sign in at /login and visit /admin.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
