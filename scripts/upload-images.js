// Copies every product image that isn't on Cloudinary yet into your Cloudinary account,
// then points the database at the Cloudinary URL. Run with:  npm run images:upload
//
// Needs CLOUDINARY_URL in .env (Cloudinary dashboard -> "API environment variable"):
//   CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
// Safe to re-run: images that already have a publicId are skipped.
import "dotenv/config";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { createPrisma } from "../src/db.js";

if (!process.env.CLOUDINARY_URL) {
  console.error("CLOUDINARY_URL is missing in server/.env");
  process.exit(1);
}

const prisma = createPrisma();
const FOLDER = "cyber-shop/products";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// "/static/..." images live in server/public; everything else is a remote URL that
// Cloudinary downloads itself.
const sourceOf = (url) => (url.startsWith("/static/") ? path.join("public", url.slice("/static/".length)) : url);

// Retry with backoff, because some image hosts rate limit bursts of requests.
async function uploadWithRetry(url, publicId, attempts = 4) {
  for (let i = 1; ; i++) {
    try {
      return await cloudinary.uploader.upload(url, { folder: FOLDER, public_id: publicId, overwrite: true });
    } catch (err) {
      if (i >= attempts) throw err;
      await sleep(2000 * 2 ** i);
    }
  }
}

const images = await prisma.productImage.findMany({
  where: { publicId: null },
  include: { product: { select: { slug: true } } },
  orderBy: [{ productId: "asc" }, { position: "asc" }],
});
console.log(`${images.length} images to upload to Cloudinary (${FOLDER})`);

let done = 0;
let failed = 0;
for (const img of images) {
  const publicId = `${img.product.slug}-${img.position + 1}`;
  try {
    const result = await uploadWithRetry(sourceOf(img.url), publicId);
    // f_auto = best format for the browser (AVIF/WebP), q_auto = smart compression, w_1000 = cap size.
    const url = cloudinary.url(result.public_id, {
      secure: true,
      transformation: [{ width: 1000, crop: "limit" }, { fetch_format: "auto", quality: "auto" }],
    });
    await prisma.productImage.update({ where: { id: img.id }, data: { url, publicId: result.public_id } });
    console.log(`  ok    ${publicId}`);
    done++;
  } catch (err) {
    console.error(`  FAIL  ${publicId}: ${err.message ?? err.error?.message}`);
    failed++;
  }
  await sleep(500);
}

console.log(`\nUploaded ${done}, failed ${failed}.${failed ? " Re-run the script to retry the failed ones." : ""}`);
await prisma.$disconnect();
