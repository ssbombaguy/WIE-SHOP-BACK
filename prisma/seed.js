// Fills the database with demo data. Run with:  npm run db:seed
// Safe to re-run: rows are upserted by their unique slug/email, so nothing is duplicated
// and existing orders keep working.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { createPrisma } from "../src/db.js";
import { categories, products, suppliers } from "./seed-data.js";

const prisma = createPrisma();

const slugify = (s) =>
  s.toLowerCase().replace(/["']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const cents = (dollars) => (dollars == null ? null : Math.round(dollars * 100));

async function seedUsers() {
  const users = [
    { email: "admin@cyber.dev", name: "Cyber Admin", role: "ADMIN", password: process.env.SEED_ADMIN_PASSWORD ?? "Admin12345!" },
    { email: "demo@cyber.dev", name: "Demo Customer", role: "CUSTOMER", password: "Demo12345!" },
  ];
  for (const { password, ...u } of users) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.upsert({ where: { email: u.email }, create: { ...u, passwordHash }, update: { ...u, passwordHash } });
  }
  return users.map((u) => `${u.email} / ${u.password}`);
}

async function main() {
  const categoryIds = {};
  for (const [i, c] of categories.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      create: { ...c, sortOrder: i },
      update: { ...c, sortOrder: i },
    });
    categoryIds[c.slug] = row.id;
  }

  const supplierIds = {};
  for (const { key, ...s } of suppliers) {
    const row = await prisma.supplier.upsert({ where: { name: s.name }, create: s, update: s });
    supplierIds[key] = row.id;
  }

  for (const [i, p] of products.entries()) {
    const slug = slugify(p.name);
    const data = {
      name: p.name,
      slug,
      brand: p.brand,
      description: p.description,
      priceCents: cents(p.price),
      compareAtCents: cents(p.compareAt),
      costCents: cents(p.cost),
      stock: p.stock,
      supplierSku: `${p.supplier.toUpperCase()}-${String(1000 + i)}`,
      rating: p.rating,
      reviewCount: p.reviews,
      colors: p.colors,
      specs: p.specs,
      isFeatured: Boolean(p.featured),
      isBestseller: Boolean(p.bestseller),
      // Spread creation dates so "Newest" sorting has something to sort.
      createdAt: new Date(Date.now() - i * 36 * 60 * 60 * 1000),
      category: { connect: { id: categoryIds[p.category] } },
      supplier: { connect: { id: supplierIds[p.supplier] } },
    };
    const images = p.images.map((img, position) => ({
      url: img.url,
      sourceUrl: img.sourceUrl ?? null,
      alt: `${p.name}${p.images.length > 1 ? ` - view ${position + 1}` : ""}`,
      position,
    }));

    const existing = await prisma.product.findUnique({ where: { slug }, include: { images: true } });
    if (!existing) {
      await prisma.product.create({ data: { ...data, images: { create: images } } });
      continue;
    }
    // Keep images that were already uploaded to Cloudinary; only reset the rest.
    const alreadyUploaded = existing.images.some((img) => img.publicId);
    await prisma.product.update({
      where: { slug },
      data: alreadyUploaded ? data : { ...data, images: { deleteMany: {}, create: images } },
    });
  }

  // Products removed from seed-data.js are deleted too, unless an order references them.
  const { count: removed } = await prisma.product.deleteMany({
    where: { slug: { notIn: products.map((p) => slugify(p.name)) }, orderItems: { none: {} } },
  });
  if (removed) console.log(`Removed ${removed} products no longer in seed-data.js`);

  const logins = await seedUsers();
  const counts = await Promise.all([prisma.category.count(), prisma.supplier.count(), prisma.product.count(), prisma.productImage.count()]);
  console.log(`Seeded: ${counts[0]} categories, ${counts[1]} suppliers, ${counts[2]} products, ${counts[3]} images`);
  console.log(`Demo logins:\n  ${logins.join("\n  ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
