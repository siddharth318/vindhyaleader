import { prisma } from "@/lib/prisma";

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function getSettings(keys: string[]): Promise<Record<string, string | null>> {
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const map: Record<string, string | null> = {};
  for (const k of keys) map[k] = rows.find((r) => r.key === k)?.value ?? null;
  return map;
}

export async function setSetting(key: string, value: string) {
  return prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
