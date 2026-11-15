/**
 * Developer-only user management for Maven, run with Bun:
 *
 *   bun run user <command> [user] [options]
 *
 * Works straight against the database through Prisma (no HTTP, no admin
 * session needed), writing the same records Better Auth would: credential
 * passwords are hashed with Better Auth's own scrypt hasher, usernames are
 * stored lowercased with the original kept as `displayUsername`, and role and
 * ban fields follow the admin plugin. Missing required values are prompted for
 * in an interactive terminal; with `--json` or without a TTY every value must
 * come from flags. Run `bun run user help` for the full command list.
 */
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { loadEnvConfig } from "@next/env";
import type { Prisma } from "@/generated/prisma/client";
import type { ZodType } from "zod";

/** Load .env / .env.local the same way Next.js and prisma.config.ts do. */
loadEnvConfig(process.cwd());

/** Env-dependent modules load only after the environment is in place. */
const { prisma } = await import("@/database/prisma");
const { generateRandomString, hashPassword } = await import("better-auth/crypto");
const {
  emailSchema,
  normalizePhoneNumber,
  passwordSchema,
  phoneNumberSchema,
  usernameSchema,
} = await import("@/lib/auth/schema");

/** Roles known to the admin plugin setup in src/lib/auth/index.ts. */
const ROLES = ["user", "admin"] as const;
type Role = (typeof ROLES)[number];

/** Data groups `purge` can remove without deleting the account. */
const PURGE_GROUPS = [
  "chats",
  "shares",
  "connections",
  "preferences",
  "usage",
  "ratings",
] as const;
type PurgeGroup = (typeof PURGE_GROUPS)[number];

const LIST_DEFAULT_LIMIT = 50;
const LIST_MAX_LIMIT = 500;
const GENERATED_PASSWORD_LENGTH = 20;

/** An expected failure: printed as a plain message, exits with code 1. */
class CliError extends Error {}

/** Parses argv; unknown or malformed flags end the run with a plain message. */
function readArgs() {
  try {
    return parseArgs({ allowPositionals: true, strict: true, options: OPTIONS });
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error("Run: bun run user help");
    process.exit(1);
  }
}

const OPTIONS = {
  help: { type: "boolean", short: "h" },
  json: { type: "boolean" },
  yes: { type: "boolean", short: "y" },
  search: { type: "string", short: "s" },
  role: { type: "string" },
  banned: { type: "boolean" },
  unverified: { type: "boolean" },
  limit: { type: "string" },
  offset: { type: "string" },
  email: { type: "string" },
  username: { type: "string" },
  name: { type: "string" },
  password: { type: "string" },
  "generate-password": { type: "boolean" },
  phone: { type: "string" },
  "phone-verified": { type: "boolean" },
  image: { type: "string" },
  "clear-phone": { type: "boolean" },
  "clear-image": { type: "boolean" },
  unset: { type: "boolean" },
  "keep-sessions": { type: "boolean" },
  reason: { type: "string" },
  expires: { type: "string" },
  days: { type: "string" },
  all: { type: "boolean" },
  chats: { type: "boolean" },
  shares: { type: "boolean" },
  connections: { type: "boolean" },
  preferences: { type: "boolean" },
  usage: { type: "boolean" },
  ratings: { type: "boolean" },
} as const;

const { values: flags, positionals } = readArgs();

/** Prompts only make sense when a person is at the terminal. */
const interactive = Boolean(
  process.stdin.isTTY && process.stdout.isTTY && !flags.json
);

const HELP = `Maven user provisioning (developer only)

Usage: bun run user <command> [user] [options]

<user> is a user id, email, username or phone number.
Global: --json (machine output, no prompts), --yes/-y (skip confirmations), --help/-h

Accounts
  list                     List users
                             --search/-s <text> --role <user|admin> --banned --unverified
                             --limit <n> (default ${LIST_DEFAULT_LIMIT}, max ${LIST_MAX_LIMIT}) --offset <n>
  show <user>              Profile, linked providers and record counts
  stats                    Totals across all users
  create                   Create a credential user (email verified unless --unverified)
                             --email --username --name --password | --generate-password
                             --phone --phone-verified --role <user|admin> --unverified
  update <user>            Change profile fields (prompts for each when none given)
                             --name --email --username --phone --image --clear-phone --clear-image
                             A new email or phone resets its verified flag.
  delete <user>            Delete the user and everything they own

Credentials and verification
  set-password <user>      --password | --generate-password, --keep-sessions
                             Signs the user out everywhere unless --keep-sessions.
  verify-email <user>      Mark email verified (--unset to clear)
  verify-phone <user>      Mark phone verified (--unset to clear)
  accounts <user>          Linked sign-in providers
  unlink <user> <provider> Remove a provider (credential, google, github); never the last one

Access control
  set-role <user> <role>   Set role: ${ROLES.join(" | ")}
  ban <user>               Block sign-in and end all sessions
                             --reason <text> --expires <30m | 12h | 7d | 2w | ISO date>
  unban <user>             Lift a ban

Sessions
  sessions <user>          List sessions (tokens are never shown)
  revoke-session <id>      End one session by id
  revoke-sessions <user>   End every session of the user

Data and usage
  usage <user>             AI token usage by provider and model; --days <n> (default 30, 0 = all time)
  purge <user>             Remove data but keep the account
                             --chats --shares --connections --preferences --usage --ratings | --all

Note: sessions use a 5 minute cookie cache, so a revoked or banned session can
stay valid in the browser for up to 5 minutes.`;

/** Asks one question on a short-lived readline interface. */
async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

/** Reads a line with echo turned off (passwords). */
function askSecret(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    let value = "";
    const cleanup = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      process.stdout.write("\n");
    };
    const onData = (chunk: Buffer | string) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\r" || char === "\n" || char === "\u0004") {
          cleanup();
          resolve(value);
          return;
        }
        if (char === "\u0003") {
          cleanup();
          reject(new CliError("Aborted"));
          return;
        }
        if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
        } else if (char >= " ") {
          value += char;
        }
      }
    };
    process.stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("data", onData);
  });
}

/**
 * Returns the flag value, otherwise prompts for it in a terminal. Without a
 * terminal a missing required value is an error and a missing optional one is
 * `undefined`.
 */
async function resolveValue(
  value: string | undefined,
  label: string,
  flag: string,
  options: { optional?: boolean; fallback?: string } = {}
): Promise<string | undefined> {
  if (value !== undefined) return value;
  if (!interactive) {
    if (options.optional) return options.fallback;
    throw new CliError(`Missing --${flag}`);
  }
  const hint = options.fallback
    ? ` [${options.fallback}]`
    : options.optional
      ? " (optional)"
      : "";
  for (;;) {
    const answer = await ask(`${label}${hint}: `);
    if (answer) return answer;
    if (options.fallback !== undefined || options.optional) return options.fallback;
  }
}

/** Parses with a zod schema, turning the first issue into a CliError. */
function validate<T>(schema: ZodType<T>, value: string, label: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new CliError(`${label}: ${result.error.issues[0]?.message ?? "invalid"}`);
  }
  return result.data;
}

/**
 * Picks the new password: `--generate-password`, `--password`, or a hidden
 * prompt typed twice. `generated` is set when the caller must show it.
 */
async function resolvePassword(): Promise<{ password: string; generated: boolean }> {
  if (flags["generate-password"]) {
    if (flags.password) throw new CliError("Use either --password or --generate-password");
    return {
      password: generateRandomString(GENERATED_PASSWORD_LENGTH, "a-z", "A-Z", "0-9"),
      generated: true,
    };
  }
  if (flags.password !== undefined) {
    return { password: validate(passwordSchema, flags.password, "Password"), generated: false };
  }
  if (!interactive) throw new CliError("Missing --password or --generate-password");
  for (;;) {
    const first = await askSecret("Password (empty to generate): ");
    if (!first) {
      return {
        password: generateRandomString(GENERATED_PASSWORD_LENGTH, "a-z", "A-Z", "0-9"),
        generated: true,
      };
    }
    const checked = passwordSchema.safeParse(first);
    if (!checked.success) {
      console.error(checked.error.issues[0]?.message ?? "Invalid password");
      continue;
    }
    if ((await askSecret("Repeat password: ")) === first) {
      return { password: first, generated: false };
    }
    console.error("Passwords do not match");
  }
}

/** Asks for a yes/no confirmation unless `--yes` was passed. */
async function confirm(message: string): Promise<void> {
  if (flags.yes) return;
  if (!interactive) throw new CliError(`${message} Pass --yes to confirm.`);
  const answer = await ask(`${message} [y/N]: `);
  if (!/^y(es)?$/i.test(answer)) throw new CliError("Aborted");
}

/** Parses a non-negative integer flag. */
function parseCount(value: string | undefined, flag: string, fallback: number): number {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value)) throw new CliError(`--${flag} must be a whole number`);
  return Number(value);
}

function parseRole(value: string): Role {
  const role = value.trim().toLowerCase();
  if (!(ROLES as readonly string[]).includes(role)) {
    throw new CliError(`Role must be one of: ${ROLES.join(", ")}`);
  }
  return role as Role;
}

/** Accepts a relative duration (30m, 12h, 7d, 2w) or an absolute date. */
function parseExpiry(value: string): Date {
  const relative = /^(\d+)\s*([mhdw])$/i.exec(value.trim());
  const unitMs = { m: 60_000, h: 3_600_000, d: 86_400_000, w: 604_800_000 };
  const date = relative
    ? new Date(
        Date.now() +
          Number(relative[1]) * unitMs[relative[2].toLowerCase() as keyof typeof unitMs]
      )
    : new Date(value);
  if (Number.isNaN(date.getTime())) throw new CliError(`Cannot read --expires "${value}"`);
  if (date.getTime() <= Date.now()) throw new CliError("--expires must be in the future");
  return date;
}

/** Better Auth's id format: 32 alphanumeric characters. */
function newId(): string {
  return generateRandomString(32, "a-z", "A-Z", "0-9");
}

function formatDate(date: Date | null | undefined): string {
  return date ? `${date.toISOString().slice(0, 16).replace("T", " ")} UTC` : "";
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return formatDate(value);
  if (typeof value === "boolean") return value ? "yes" : "no";
  return String(value);
}

/** Prints rows as aligned columns, or JSON with `--json`. */
function printTable(rows: Record<string, unknown>[], jsonValue: unknown = rows): void {
  if (flags.json) {
    console.log(JSON.stringify(jsonValue, null, 2));
    return;
  }
  if (rows.length === 0) {
    console.log("(none)");
    return;
  }
  const columns = Object.keys(rows[0]);
  const cells = rows.map((row) => columns.map((column) => formatCell(row[column])));
  const widths = columns.map((column, index) =>
    Math.max(column.length, ...cells.map((row) => row[index].length))
  );
  const line = (values: string[]) =>
    values.map((value, index) => value.padEnd(widths[index])).join("  ").trimEnd();
  console.log(line(columns.map((column) => column.toUpperCase())));
  for (const row of cells) console.log(line(row));
}

/** Prints key/value pairs, or JSON with `--json`. */
function printFields(fields: Record<string, unknown>, jsonValue: unknown = fields): void {
  if (flags.json) {
    console.log(JSON.stringify(jsonValue, null, 2));
    return;
  }
  const width = Math.max(...Object.keys(fields).map((key) => key.length));
  for (const [key, value] of Object.entries(fields)) {
    console.log(`${key.padEnd(width)}  ${formatCell(value)}`);
  }
}

/** Status line for humans; JSON mode prints the payload instead. */
function done(message: string, payload: unknown): void {
  console.log(flags.json ? JSON.stringify(payload, null, 2) : message);
}

/**
 * Finds exactly one user by id, email, username or phone. Errors when none
 * match or when the reference is ambiguous across fields.
 */
async function findUser(reference: string | undefined) {
  const ref = (await resolveValue(reference, "User (id, email, username or phone)", "user"))!.trim();
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { id: ref },
        { email: ref.toLowerCase() },
        { username: ref.toLowerCase() },
        { phoneNumber: normalizePhoneNumber(ref) },
      ],
    },
    take: 2,
  });
  if (users.length === 0) throw new CliError(`No user matches "${ref}"`);
  if (users.length > 1) throw new CliError(`"${ref}" matches more than one user; use the id`);
  return users[0];
}

function label(user: { username: string | null; email: string; id: string }): string {
  return `${user.username ?? user.email} (${user.id})`;
}

/** Throws a readable error when email, username or phone is taken by another user. */
async function assertAvailable(
  values: { email?: string; username?: string; phoneNumber?: string },
  exceptUserId?: string
): Promise<void> {
  const OR: Prisma.UserWhereInput[] = [];
  if (values.email) OR.push({ email: values.email });
  if (values.username) OR.push({ username: values.username });
  if (values.phoneNumber) OR.push({ phoneNumber: values.phoneNumber });
  if (OR.length === 0) return;
  const taken = await prisma.user.findFirst({
    where: { OR, ...(exceptUserId ? { id: { not: exceptUserId } } : {}) },
    select: { email: true, username: true, phoneNumber: true },
  });
  if (!taken) return;
  if (values.email && taken.email === values.email) throw new CliError("Email is already in use");
  if (values.username && taken.username === values.username) {
    throw new CliError("Username is already in use");
  }
  throw new CliError("Phone number is already in use");
}

/** User fields safe to print (no secrets live on the user row). */
function publicUser(user: Awaited<ReturnType<typeof findUser>>) {
  return {
    id: user.id,
    name: user.name,
    username: user.displayUsername ?? user.username,
    email: user.email,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
    phoneNumberVerified: user.phoneNumberVerified ?? false,
    image: user.image,
    role: user.role ?? "user",
    banned: user.banned ?? false,
    banReason: user.banReason,
    banExpires: user.banExpires,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function cmdList(): Promise<void> {
  const limit = Math.min(parseCount(flags.limit, "limit", LIST_DEFAULT_LIMIT), LIST_MAX_LIMIT);
  const offset = parseCount(flags.offset, "offset", 0);
  const search = flags.search?.trim();
  const where: Prisma.UserWhereInput = {
    ...(search
      ? {
          OR: [
            { id: search },
            { email: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { phoneNumber: { contains: normalizePhoneNumber(search) } },
          ],
        }
      : {}),
    ...(flags.role ? { role: parseRole(flags.role) } : {}),
    ...(flags.banned ? { banned: true } : {}),
    ...(flags.unverified ? { emailVerified: false } : {}),
  };
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
  ]);
  const rows = users.map((user) => ({
    id: user.id,
    username: user.displayUsername ?? user.username,
    email: user.email,
    name: user.name,
    role: user.role ?? "user",
    verified: user.emailVerified,
    phone: user.phoneNumber,
    banned: user.banned ?? false,
    created: user.createdAt,
  }));
  printTable(rows, { total, offset, limit, users: users.map(publicUser) });
  if (!flags.json) {
    console.log(`\n${users.length} of ${total} user(s), offset ${offset}`);
  }
}

async function cmdShow(): Promise<void> {
  const user = await findUser(positionals[1]);
  const [counts, accounts, preferences, activeSessions] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        _count: {
          select: {
            sessions: true,
            chats: true,
            shares: true,
            aiConnections: true,
            aiUsage: true,
            ratings: true,
          },
        },
      },
    }),
    prisma.account.findMany({
      where: { userId: user.id },
      select: { providerId: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.aiPreferences.findUnique({ where: { userId: user.id }, select: { userId: true } }),
    prisma.session.count({ where: { userId: user.id, expiresAt: { gt: new Date() } } }),
  ]);
  const profile = publicUser(user);
  const providers = accounts.map((account) => account.providerId);
  printFields(
    {
      ...profile,
      providers: providers.join(", "),
      activeSessions,
      sessions: counts._count.sessions,
      chats: counts._count.chats,
      shares: counts._count.shares,
      aiConnections: counts._count.aiConnections,
      aiUsageRecords: counts._count.aiUsage,
      ratings: counts._count.ratings,
      aiPreferences: Boolean(preferences),
    },
    {
      ...profile,
      providers,
      activeSessions,
      counts: counts._count,
      aiPreferences: Boolean(preferences),
    }
  );
}

async function cmdStats(): Promise<void> {
  const now = new Date();
  const [total, verified, admins, banned, phoneVerified, activeSessions, last7Days] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { emailVerified: true } }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.count({ where: { banned: true } }),
      prisma.user.count({ where: { phoneNumberVerified: true } }),
      prisma.session.count({ where: { expiresAt: { gt: now } } }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(now.getTime() - 7 * 86_400_000) } },
      }),
    ]);
  printFields({
    users: total,
    emailVerified: verified,
    unverified: total - verified,
    phoneVerified,
    admins,
    banned,
    newLast7Days: last7Days,
    activeSessions,
  });
}

async function cmdCreate(): Promise<void> {
  const email = validate(
    emailSchema,
    (await resolveValue(flags.email, "Email", "email"))!,
    "Email"
  );
  const displayUsername = validate(
    usernameSchema,
    (await resolveValue(flags.username, "Username", "username"))!,
    "Username"
  );
  const username = displayUsername.toLowerCase();
  const name =
    (await resolveValue(flags.name, "Display name", "name", {
      fallback: displayUsername,
    }))!.trim() || displayUsername;
  const rawPhone = await resolveValue(flags.phone, "Phone (E.164)", "phone", { optional: true });
  const phoneNumber = rawPhone ? validate(phoneNumberSchema, rawPhone, "Phone") : undefined;
  if (flags["phone-verified"] && !phoneNumber) {
    throw new CliError("--phone-verified needs --phone");
  }
  const role = parseRole(flags.role ?? "user");

  await assertAvailable({ email, username, phoneNumber });
  const { password, generated } = await resolvePassword();
  const passwordHash = await hashPassword(password);

  const userId = newId();
  const user = await prisma.user.create({
    data: {
      id: userId,
      name,
      email,
      emailVerified: !flags.unverified,
      username,
      displayUsername,
      phoneNumber: phoneNumber ?? null,
      phoneNumberVerified: Boolean(phoneNumber && flags["phone-verified"]),
      role,
      accounts: {
        create: {
          id: newId(),
          accountId: userId,
          providerId: "credential",
          password: passwordHash,
        },
      },
    },
  });

  const payload = { user: publicUser(user), ...(generated ? { password } : {}) };
  if (flags.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  console.log(`Created ${label(user)}`);
  if (generated) console.log(`Generated password (shown once): ${password}`);
  if (flags.unverified) {
    console.log("Email is unverified: the user must verify it before signing in.");
  }
}

async function cmdUpdate(): Promise<void> {
  const user = await findUser(positionals[1]);
  const given =
    flags.name !== undefined ||
    flags.email !== undefined ||
    flags.username !== undefined ||
    flags.phone !== undefined ||
    flags.image !== undefined ||
    flags["clear-phone"] ||
    flags["clear-image"];
  if (flags.phone !== undefined && flags["clear-phone"]) {
    throw new CliError("Use either --phone or --clear-phone");
  }
  if (flags.image !== undefined && flags["clear-image"]) {
    throw new CliError("Use either --image or --clear-image");
  }

  let input = {
    name: flags.name,
    email: flags.email,
    username: flags.username,
    phone: flags.phone,
    image: flags.image,
  };
  if (!given) {
    if (!interactive) throw new CliError("Nothing to update; pass at least one field flag");
    console.log("Press enter to keep the current value.");
    input = {
      name: await ask(`Name [${user.name}]: `),
      email: await ask(`Email [${user.email}]: `),
      username: await ask(`Username [${user.displayUsername ?? user.username ?? ""}]: `),
      phone: await ask(`Phone [${user.phoneNumber ?? ""}]: `),
      image: await ask(`Image URL [${user.image ?? ""}]: `),
    };
    for (const key of Object.keys(input) as (keyof typeof input)[]) {
      if (!input[key]) input[key] = undefined;
    }
  }

  const data: Prisma.UserUpdateInput = {};
  const notes: string[] = [];
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new CliError("Name cannot be empty");
    data.name = name;
  }
  if (input.email !== undefined) {
    const email = validate(emailSchema, input.email, "Email");
    if (email !== user.email) {
      data.email = email;
      data.emailVerified = false;
      notes.push("Email changed and marked unverified; run verify-email if it is trusted.");
    }
  }
  if (input.username !== undefined) {
    const displayUsername = validate(usernameSchema, input.username, "Username");
    data.username = displayUsername.toLowerCase();
    data.displayUsername = displayUsername;
  }
  if (flags["clear-phone"]) {
    data.phoneNumber = null;
    data.phoneNumberVerified = false;
  } else if (input.phone !== undefined) {
    const phoneNumber = validate(phoneNumberSchema, input.phone, "Phone");
    if (phoneNumber !== user.phoneNumber) {
      data.phoneNumber = phoneNumber;
      data.phoneNumberVerified = false;
      notes.push("Phone changed and marked unverified; run verify-phone if it is trusted.");
    }
  }
  if (flags["clear-image"]) {
    data.image = null;
  } else if (input.image !== undefined) {
    try {
      data.image = new URL(input.image.trim()).toString();
    } catch {
      throw new CliError("Image must be an absolute URL");
    }
  }
  if (Object.keys(data).length === 0) {
    done("Nothing changed", { user: publicUser(user), changed: false });
    return;
  }

  await assertAvailable(
    {
      email: typeof data.email === "string" ? data.email : undefined,
      username: typeof data.username === "string" ? data.username : undefined,
      phoneNumber: typeof data.phoneNumber === "string" ? data.phoneNumber : undefined,
    },
    user.id
  );
  const updated = await prisma.user.update({ where: { id: user.id }, data });
  if (flags.json) {
    console.log(JSON.stringify({ user: publicUser(updated), changed: true }, null, 2));
    return;
  }
  console.log(`Updated ${label(updated)}`);
  for (const note of notes) console.log(note);
}

async function cmdDelete(): Promise<void> {
  const user = await findUser(positionals[1]);
  await confirm(
    `Delete ${label(user)} with all chats, shares, sessions, AI connections and usage? This cannot be undone.`
  );
  await prisma.user.delete({ where: { id: user.id } });
  done(`Deleted ${label(user)}`, { deleted: user.id });
}

async function cmdSetPassword(): Promise<void> {
  const user = await findUser(positionals[1]);
  const { password, generated } = await resolvePassword();
  const passwordHash = await hashPassword(password);
  const credential = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
    select: { id: true },
  });

  const writeCredential = credential
    ? prisma.account.update({
        where: { id: credential.id },
        data: { password: passwordHash },
      })
    : prisma.account.create({
        data: {
          id: newId(),
          accountId: user.id,
          providerId: "credential",
          password: passwordHash,
          userId: user.id,
        },
      });
  /** Mirrors `revokeSessionsOnPasswordReset`: sign out everywhere by default. */
  let revoked = { count: 0 };
  if (flags["keep-sessions"]) {
    await writeCredential;
  } else {
    [, revoked] = await prisma.$transaction([
      writeCredential,
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ]);
  }

  const payload = {
    user: user.id,
    credentialCreated: !credential,
    sessionsRevoked: revoked.count,
    ...(generated ? { password } : {}),
  };
  if (flags.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  console.log(
    `Password ${credential ? "updated" : "set (credential sign-in added)"} for ${label(user)}; ${revoked.count} session(s) revoked`
  );
  if (generated) console.log(`Generated password (shown once): ${password}`);
}

async function cmdVerify(field: "email" | "phone"): Promise<void> {
  const user = await findUser(positionals[1]);
  const verified = !flags.unset;
  if (field === "phone" && verified && !user.phoneNumber) {
    throw new CliError("User has no phone number; set one with update --phone first");
  }
  await prisma.user.update({
    where: { id: user.id },
    data: field === "email" ? { emailVerified: verified } : { phoneNumberVerified: verified },
  });
  done(`${field === "email" ? "Email" : "Phone"} marked ${verified ? "verified" : "unverified"} for ${label(user)}`, {
    user: user.id,
    field,
    verified,
  });
}

async function cmdAccounts(): Promise<void> {
  const user = await findUser(positionals[1]);
  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      providerId: true,
      accountId: true,
      scope: true,
      password: true,
      createdAt: true,
    },
  });
  const rows = accounts.map(({ password, ...account }) => ({
    ...account,
    hasPassword: Boolean(password),
  }));
  printTable(rows);
}

async function cmdUnlink(): Promise<void> {
  const user = await findUser(positionals[1]);
  const provider = (await resolveValue(positionals[2], "Provider", "provider"))!.trim().toLowerCase();
  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    select: { id: true, providerId: true },
  });
  const targets = accounts.filter((account) => account.providerId === provider);
  if (targets.length === 0) throw new CliError(`${label(user)} has no "${provider}" account`);
  if (targets.length === accounts.length) {
    throw new CliError("Refusing to remove the only sign-in method; set a password or link another provider first");
  }
  await confirm(`Unlink ${provider} from ${label(user)}?`);
  await prisma.account.deleteMany({ where: { id: { in: targets.map((account) => account.id) } } });
  done(`Unlinked ${provider} from ${label(user)}`, { user: user.id, unlinked: provider });
}

async function cmdSetRole(): Promise<void> {
  const user = await findUser(positionals[1]);
  const role = parseRole((await resolveValue(positionals[2], `Role (${ROLES.join("/")})`, "role"))!);
  await prisma.user.update({ where: { id: user.id }, data: { role } });
  done(`Role of ${label(user)} set to ${role}`, { user: user.id, role });
}

async function cmdBan(): Promise<void> {
  const user = await findUser(positionals[1]);
  const banExpires = flags.expires ? parseExpiry(flags.expires) : null;
  const banReason = flags.reason?.trim() || null;
  const [, revoked] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { banned: true, banReason, banExpires },
    }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);
  done(
    `Banned ${label(user)}${banExpires ? ` until ${formatDate(banExpires)}` : " indefinitely"}; ${revoked.count} session(s) revoked`,
    { user: user.id, banned: true, banReason, banExpires, sessionsRevoked: revoked.count }
  );
}

async function cmdUnban(): Promise<void> {
  const user = await findUser(positionals[1]);
  await prisma.user.update({
    where: { id: user.id },
    data: { banned: false, banReason: null, banExpires: null },
  });
  done(`Unbanned ${label(user)}`, { user: user.id, banned: false });
}

async function cmdSessions(): Promise<void> {
  const user = await findUser(positionals[1]);
  const now = new Date();
  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      expiresAt: true,
      ipAddress: true,
      userAgent: true,
      impersonatedBy: true,
    },
  });
  const rows = sessions.map((session) => ({
    id: session.id,
    active: session.expiresAt > now,
    created: session.createdAt,
    expires: session.expiresAt,
    ip: session.ipAddress,
    agent: session.userAgent ? session.userAgent.slice(0, 48) : null,
    impersonatedBy: session.impersonatedBy,
  }));
  printTable(rows, sessions);
}

async function cmdRevokeSession(): Promise<void> {
  const id = (await resolveValue(positionals[1], "Session id", "session"))!.trim();
  const { count } = await prisma.session.deleteMany({ where: { id } });
  if (count === 0) throw new CliError(`No session with id "${id}"`);
  done(`Revoked session ${id}`, { revoked: id });
}

async function cmdRevokeSessions(): Promise<void> {
  const user = await findUser(positionals[1]);
  const { count } = await prisma.session.deleteMany({ where: { userId: user.id } });
  done(`Revoked ${count} session(s) of ${label(user)}`, { user: user.id, revoked: count });
}

async function cmdUsage(): Promise<void> {
  const user = await findUser(positionals[1]);
  const days = parseCount(flags.days, "days", 30);
  const where: Prisma.AiUsageWhereInput = {
    userId: user.id,
    ...(days > 0 ? { createdAt: { gte: new Date(Date.now() - days * 86_400_000) } } : {}),
  };
  const sum = {
    inputTokens: true,
    outputTokens: true,
    reasoningTokens: true,
    cachedTokens: true,
  } as const;
  const [totals, groups] = await Promise.all([
    prisma.aiUsage.aggregate({ where, _sum: sum, _count: { _all: true } }),
    prisma.aiUsage.groupBy({
      by: ["provider", "model"],
      where,
      _sum: sum,
      _count: { _all: true },
      orderBy: { _sum: { inputTokens: "desc" } },
    }),
  ]);
  const rows = groups.map((group) => ({
    provider: group.provider,
    model: group.model,
    calls: group._count._all,
    input: group._sum.inputTokens ?? 0,
    output: group._sum.outputTokens ?? 0,
    reasoning: group._sum.reasoningTokens ?? 0,
    cached: group._sum.cachedTokens ?? 0,
  }));
  const summary = {
    calls: totals._count._all,
    input: totals._sum.inputTokens ?? 0,
    output: totals._sum.outputTokens ?? 0,
    reasoning: totals._sum.reasoningTokens ?? 0,
    cached: totals._sum.cachedTokens ?? 0,
  };
  const period = days > 0 ? `last ${days} day(s)` : "all time";
  if (flags.json) {
    console.log(JSON.stringify({ user: user.id, period, totals: summary, byModel: rows }, null, 2));
    return;
  }
  console.log(`AI usage of ${label(user)}, ${period}\n`);
  printTable(rows);
  console.log(
    `\nTotal: ${summary.calls} call(s), ${summary.input} input, ${summary.output} output, ${summary.reasoning} reasoning, ${summary.cached} cached tokens`
  );
}

async function cmdPurge(): Promise<void> {
  const user = await findUser(positionals[1]);
  const groups: PurgeGroup[] = flags.all
    ? [...PURGE_GROUPS]
    : PURGE_GROUPS.filter((group) => flags[group]);
  if (groups.length === 0) {
    throw new CliError(`Choose what to purge: ${PURGE_GROUPS.map((g) => `--${g}`).join(" ")} or --all`);
  }
  const userId = user.id;
  const deleters: Record<PurgeGroup, () => Prisma.PrismaPromise<Prisma.BatchPayload>> = {
    chats: () => prisma.chat.deleteMany({ where: { userId } }),
    shares: () => prisma.share.deleteMany({ where: { userId } }),
    connections: () => prisma.aiConnection.deleteMany({ where: { userId } }),
    preferences: () => prisma.aiPreferences.deleteMany({ where: { userId } }),
    usage: () => prisma.aiUsage.deleteMany({ where: { userId } }),
    ratings: () => prisma.rating.deleteMany({ where: { userId } }),
  };
  await confirm(`Permanently delete ${groups.join(", ")} of ${label(user)}? The account stays.`);
  const results = await prisma.$transaction(groups.map((group) => deleters[group]()));
  const removed = Object.fromEntries(groups.map((group, index) => [group, results[index].count]));
  if (flags.json) {
    console.log(JSON.stringify({ user: userId, removed }, null, 2));
    return;
  }
  console.log(`Purged data of ${label(user)}:`);
  printFields(removed);
}

const COMMANDS: Record<string, () => Promise<void>> = {
  list: cmdList,
  show: cmdShow,
  stats: cmdStats,
  create: cmdCreate,
  update: cmdUpdate,
  delete: cmdDelete,
  "set-password": cmdSetPassword,
  "verify-email": () => cmdVerify("email"),
  "verify-phone": () => cmdVerify("phone"),
  accounts: cmdAccounts,
  unlink: cmdUnlink,
  "set-role": cmdSetRole,
  ban: cmdBan,
  unban: cmdUnban,
  sessions: cmdSessions,
  "revoke-session": cmdRevokeSession,
  "revoke-sessions": cmdRevokeSessions,
  usage: cmdUsage,
  purge: cmdPurge,
};

/** Prisma unique-constraint violations surface as P2002. */
function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: unknown } | null)?.code === "P2002";
}

async function main(): Promise<void> {
  const command = positionals[0];
  if (!command || command === "help" || flags.help) {
    console.log(HELP);
    return;
  }
  const handler = COMMANDS[command];
  if (!handler) throw new CliError(`Unknown command "${command}". Run: bun run user help`);
  await handler();
}

try {
  await main();
} catch (error) {
  if (error instanceof CliError) {
    console.error(`Error: ${error.message}`);
  } else if (isUniqueViolation(error)) {
    console.error("Error: email, username or phone number is already in use");
  } else {
    console.error(error);
  }
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
