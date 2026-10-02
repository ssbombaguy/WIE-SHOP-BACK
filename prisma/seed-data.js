// Demo catalog: 6 categories, 3 suppliers, 40 products.
// Prices here are in dollars for readability; seed.js converts them to cents.
//
// Images come from two free sources:
//  - dummyjson.com product images (free for testing / demos)
//  - Wikimedia Commons (freely licensed; sourceUrl links to the author + license page),
//    stored locally in server/public/products
// Run `npm run images:upload` to copy them all into your own Cloudinary account.

const dj = (path, count = 1) =>
  Array.from({ length: count }, (_, i) => ({
    url: `https://cdn.dummyjson.com/product-images/${path}/${i + 1}.webp`,
  }));

// Wikimedia photos are stored in server/public/products (Wikimedia rate limits hotlinking),
// served by the API at /static/products/..., and credited via sourceUrl.
export const localImageName = (commonsPath) =>
  decodeURIComponent(commonsPath.split("/").pop())
    .toLowerCase()
    .replace(/\.[a-z]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") + ".webp";

const commons = (path) => [
  {
    url: `/static/products/${localImageName(path)}`,
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${path.split("/").pop()}`,
  },
];

export const categories = [
  { name: "Phones", slug: "phones", icon: "phone" },
  { name: "Smart Watches", slug: "smart-watches", icon: "watch" },
  { name: "Cameras", slug: "cameras", icon: "camera" },
  { name: "Headphones", slug: "headphones", icon: "headphones" },
  { name: "Computers", slug: "computers", icon: "computer" },
  { name: "Gaming", slug: "gaming", icon: "gaming" },
];

// Fake suppliers. ".example" domains are reserved and never resolve.
export const suppliers = [
  { key: "cn", name: "Shenzhen TechSource Ltd.", country: "China", contactEmail: "orders@techsource.example", website: "https://techsource.example", shippingDays: 9 },
  { key: "de", name: "EuroGadget Distribution GmbH", country: "Germany", contactEmail: "dropship@eurogadget.example", website: "https://eurogadget.example", shippingDays: 4 },
  { key: "us", name: "Pacific Electronics Wholesale", country: "United States", contactEmail: "partners@pacific-wholesale.example", website: "https://pacific-wholesale.example", shippingDays: 3 },
];

// cost = what the supplier charges us. Margin is roughly 20-35%, typical for electronics dropshipping.
export const products = [
  // ---------------- Phones ----------------
  {
    category: "phones", supplier: "us", name: "Apple iPhone 13 Pro", brand: "Apple",
    price: 799, compareAt: 999, cost: 610, stock: 24, rating: 4.8, reviews: 1284, featured: true, bestseller: true,
    colors: ["Graphite", "Sierra Blue", "Gold"],
    description: "A 6.1-inch Super Retina XDR display with ProMotion, the A15 Bionic chip and a pro camera system with macro photography. All-day battery life in a surgical-grade stainless steel design.",
    specs: { "Screen size": "6.1\"", "Chip": "A15 Bionic", "Storage": "128 GB", "Main camera": "12 MP triple", "Front camera": "12 MP", "Battery": "3095 mAh" },
    images: dj("smartphones/iphone-13-pro", 3),
  },
  {
    category: "phones", supplier: "us", name: "Apple iPhone X", brand: "Apple",
    price: 399, compareAt: 499, cost: 300, stock: 15, rating: 4.5, reviews: 932,
    colors: ["Space Gray", "Silver"],
    description: "The phone that introduced the all-screen design. 5.8-inch OLED display, Face ID and a dual 12 MP camera, professionally refurbished and tested.",
    specs: { "Screen size": "5.8\"", "Chip": "A11 Bionic", "Storage": "64 GB", "Main camera": "12 MP dual", "Front camera": "7 MP", "Battery": "2716 mAh" },
    images: dj("smartphones/iphone-x", 3),
  },
  {
    category: "phones", supplier: "cn", name: "Apple iPhone 6", brand: "Apple",
    price: 179, cost: 120, stock: 9, rating: 4.1, reviews: 412,
    colors: ["Space Gray", "Gold"],
    description: "A compact classic with a 4.7-inch Retina HD display and Touch ID. A dependable backup phone or a first phone for kids. Refurbished.",
    specs: { "Screen size": "4.7\"", "Chip": "A8", "Storage": "32 GB", "Main camera": "8 MP", "Front camera": "1.2 MP", "Battery": "1810 mAh" },
    images: dj("smartphones/iphone-6", 3),
  },
  {
    category: "phones", supplier: "de", name: "Samsung Galaxy S10", brand: "Samsung",
    price: 449, compareAt: 549, cost: 340, stock: 18, rating: 4.6, reviews: 768, bestseller: true,
    colors: ["Prism Black", "Prism White", "Prism Blue"],
    description: "Infinity-O Dynamic AMOLED display, ultrasonic in-screen fingerprint reader and a triple camera with ultra-wide lens. Wireless PowerShare charges your earbuds from the back of the phone.",
    specs: { "Screen size": "6.1\"", "Chip": "Exynos 9820", "Storage": "128 GB", "Main camera": "12 MP triple", "Front camera": "10 MP", "Battery": "3400 mAh" },
    images: dj("smartphones/samsung-galaxy-s10", 3),
  },
  {
    category: "phones", supplier: "de", name: "Samsung Galaxy S8", brand: "Samsung",
    price: 249, cost: 175, stock: 0, rating: 4.3, reviews: 655,
    colors: ["Midnight Black", "Orchid Gray"],
    description: "The curved Infinity Display that started it all, with an IP68 water-resistant body and expandable storage.",
    specs: { "Screen size": "5.8\"", "Chip": "Exynos 8895", "Storage": "64 GB", "Main camera": "12 MP", "Front camera": "8 MP", "Battery": "3000 mAh" },
    images: dj("smartphones/samsung-galaxy-s8", 3),
  },
  {
    category: "phones", supplier: "cn", name: "Oppo F19 Pro Plus", brand: "Oppo",
    price: 329, cost: 235, stock: 30, rating: 4.4, reviews: 214,
    colors: ["Fluid Black", "Space Silver"],
    description: "5G speed, 50W Flash Charge and a 48 MP AI quad camera with night portrait video, in a slim 7.8 mm body.",
    specs: { "Screen size": "6.4\"", "Chip": "Dimensity 800U", "Storage": "128 GB", "Main camera": "48 MP quad", "Front camera": "16 MP", "Battery": "4310 mAh" },
    images: dj("smartphones/oppo-f19-pro-plus", 3),
  },
  {
    category: "phones", supplier: "cn", name: "Realme XT", brand: "Realme",
    price: 229, cost: 160, stock: 27, rating: 4.2, reviews: 189,
    colors: ["Pearl Blue", "Pearl White"],
    description: "A 64 MP quad camera at a mid-range price, with a Super AMOLED display and VOOC 3.0 fast charging.",
    specs: { "Screen size": "6.4\"", "Chip": "Snapdragon 712", "Storage": "128 GB", "Main camera": "64 MP quad", "Front camera": "16 MP", "Battery": "4000 mAh" },
    images: dj("smartphones/realme-xt", 3),
  },
  {
    category: "phones", supplier: "cn", name: "Vivo X21", brand: "Vivo",
    price: 299, cost: 210, stock: 12, rating: 4.3, reviews: 143,
    colors: ["Black", "Ruby Red"],
    description: "One of the first phones with an in-display fingerprint sensor, plus an AI-powered dual camera and a 6.28-inch Super AMOLED screen.",
    specs: { "Screen size": "6.28\"", "Chip": "Snapdragon 660", "Storage": "128 GB", "Main camera": "12 MP dual", "Front camera": "12 MP", "Battery": "3200 mAh" },
    images: dj("smartphones/vivo-x21", 3),
  },

  // ---------------- Computers ----------------
  {
    category: "computers", supplier: "us", name: "Apple MacBook Pro 14\" Space Grey", brand: "Apple",
    price: 1999, cost: 1590, stock: 11, rating: 4.9, reviews: 876, featured: true, bestseller: true,
    colors: ["Space Grey", "Silver"],
    description: "Liquid Retina XDR display, up to 17 hours of battery life and Apple silicon that handles pro workflows without breaking a sweat. HDMI, SDXC and MagSafe 3 built in.",
    specs: { "Screen size": "14.2\"", "Processor": "Apple M-series Pro", "Memory": "16 GB", "Storage": "512 GB SSD", "Battery life": "Up to 17 h", "Weight": "1.6 kg" },
    images: dj("laptops/apple-macbook-pro-14-inch-space-grey", 3),
  },
  {
    category: "computers", supplier: "de", name: "Asus Zenbook Pro Duo", brand: "Asus",
    price: 1799, cost: 1380, stock: 6, rating: 4.6, reviews: 203,
    colors: ["Celestial Blue"],
    description: "Two screens, one laptop. The full-width ScreenPad Plus extends your workspace for timelines, palettes and chat, above a 4K OLED main display.",
    specs: { "Screen size": "15.6\" + 14\"", "Processor": "Intel Core i9", "Memory": "32 GB", "Storage": "1 TB SSD", "Graphics": "GeForce RTX", "Weight": "2.3 kg" },
    images: dj("laptops/asus-zenbook-pro-dual-screen-laptop", 3),
  },
  {
    category: "computers", supplier: "cn", name: "Huawei MateBook X Pro", brand: "Huawei",
    price: 1299, compareAt: 1499, cost: 990, stock: 14, rating: 4.5, reviews: 318,
    colors: ["Space Gray", "Emerald Green"],
    description: "A 3K FullView touch display with a 91% screen-to-body ratio, in a 13.9-inch aluminium chassis that weighs just 1.33 kg.",
    specs: { "Screen size": "13.9\"", "Processor": "Intel Core i7", "Memory": "16 GB", "Storage": "1 TB SSD", "Battery life": "Up to 12 h", "Weight": "1.33 kg" },
    images: dj("laptops/huawei-matebook-x-pro", 3),
  },
  {
    category: "computers", supplier: "de", name: "Lenovo Yoga 920", brand: "Lenovo",
    price: 999, cost: 760, stock: 8, rating: 4.4, reviews: 251,
    colors: ["Platinum", "Bronze"],
    description: "A 2-in-1 with a watchband hinge that flips from laptop to tablet. Includes the Lenovo Active Pen 2 for sketching and notes.",
    specs: { "Screen size": "13.9\"", "Processor": "Intel Core i7", "Memory": "16 GB", "Storage": "512 GB SSD", "Battery life": "Up to 15 h", "Weight": "1.37 kg" },
    images: dj("laptops/lenovo-yoga-920", 3),
  },
  {
    category: "computers", supplier: "us", name: "Dell XPS 13 9300", brand: "Dell",
    price: 1199, cost: 920, stock: 16, rating: 4.7, reviews: 642, bestseller: true,
    colors: ["Platinum Silver", "Frost White"],
    description: "A 13.4-inch InfinityEdge display on all four sides in the smallest 13-inch laptop Dell has made, machined from a single block of aluminium.",
    specs: { "Screen size": "13.4\"", "Processor": "Intel Core i7", "Memory": "16 GB", "Storage": "512 GB SSD", "Battery life": "Up to 14 h", "Weight": "1.2 kg" },
    images: dj("laptops/new-dell-xps-13-9300-laptop", 3),
  },
  {
    category: "computers", supplier: "us", name: "Apple iPad mini (2021) Starlight", brand: "Apple",
    price: 499, cost: 385, stock: 21, rating: 4.8, reviews: 534,
    colors: ["Starlight", "Space Gray", "Purple"],
    description: "The full iPad experience in an ultraportable 8.3-inch design, with the A15 Bionic chip, USB-C and Apple Pencil (2nd generation) support.",
    specs: { "Screen size": "8.3\"", "Chip": "A15 Bionic", "Storage": "64 GB", "Camera": "12 MP", "Connector": "USB-C", "Weight": "293 g" },
    images: dj("tablets/ipad-mini-2021-starlight", 4),
  },
  {
    category: "computers", supplier: "de", name: "Samsung Galaxy Tab S8+", brand: "Samsung",
    price: 899, compareAt: 999, cost: 690, stock: 10, rating: 4.6, reviews: 287,
    colors: ["Graphite", "Silver"],
    description: "A 12.4-inch Super AMOLED display and the S Pen included in the box. DeX mode turns it into a desktop-style workspace.",
    specs: { "Screen size": "12.4\"", "Chip": "Snapdragon 8 Gen 1", "Storage": "128 GB", "Camera": "13 MP + 6 MP", "Connector": "USB-C", "Weight": "567 g" },
    images: dj("tablets/samsung-galaxy-tab-s8-plus-grey", 4),
  },

  // ---------------- Headphones ----------------
  {
    category: "headphones", supplier: "us", name: "Apple AirPods", brand: "Apple",
    price: 169, compareAt: 179, cost: 120, stock: 40, rating: 4.7, reviews: 2210, bestseller: true,
    colors: ["White"],
    description: "Spatial audio with dynamic head tracking, sweat and water resistance, and up to 30 hours of listening with the charging case.",
    specs: { "Type": "True wireless earbuds", "Noise cancelling": "No", "Battery": "Up to 30 h with case", "Connectivity": "Bluetooth 5.0", "Water resistance": "IPX4" },
    images: dj("mobile-accessories/apple-airpods", 3),
  },
  {
    category: "headphones", supplier: "us", name: "Apple AirPods Max Silver", brand: "Apple",
    price: 549, cost: 430, stock: 7, rating: 4.7, reviews: 1035, featured: true,
    colors: ["Silver", "Space Gray", "Sky Blue"],
    description: "High-fidelity audio with Active Noise Cancellation, Transparency mode and spatial audio, in an over-ear design with a knit-mesh canopy and memory-foam cushions.",
    specs: { "Type": "Over-ear", "Noise cancelling": "Active", "Battery": "Up to 20 h", "Connectivity": "Bluetooth 5.0", "Weight": "385 g" },
    images: dj("mobile-accessories/apple-airpods-max-silver", 1),
  },
  {
    category: "headphones", supplier: "cn", name: "Beats Flex Wireless Earphones", brand: "Beats",
    price: 69, cost: 42, stock: 55, rating: 4.4, reviews: 980,
    colors: ["Beats Black", "Flame Blue", "Yuzu Yellow"],
    description: "All-day wireless earphones with magnetic earbuds that pause your music when clipped together. Up to 12 hours of battery.",
    specs: { "Type": "Neckband earphones", "Noise cancelling": "No", "Battery": "Up to 12 h", "Connectivity": "Bluetooth Class 1", "Weight": "18.6 g" },
    images: dj("mobile-accessories/beats-flex-wireless-earphones", 1),
  },
  {
    category: "headphones", supplier: "de", name: "Samsung Galaxy Buds Live", brand: "Samsung",
    price: 119, compareAt: 149, cost: 82, stock: 22, rating: 4.3, reviews: 611,
    colors: ["Mystic Bronze", "Mystic Black"],
    description: "A bean-shaped open fit with Active Noise Cancellation and 12 mm AKG-tuned speakers. Up to 29 hours of play with the case.",
    specs: { "Type": "True wireless earbuds", "Noise cancelling": "Active (open type)", "Battery": "Up to 29 h with case", "Connectivity": "Bluetooth 5.0", "Water resistance": "IPX2" },
    images: commons("a/a0/Samsung_Galaxy_Buds_Live.jpg"),
  },
  {
    category: "headphones", supplier: "us", name: "Bose QuietComfort 35 II", brand: "Bose",
    price: 249, compareAt: 299, cost: 180, stock: 13, rating: 4.7, reviews: 3457, featured: true,
    colors: ["Black", "Silver"],
    description: "Legendary Bose noise cancellation with three adjustable levels, Alexa and Google Assistant built in, and up to 20 hours of wireless listening.",
    specs: { "Type": "Over-ear", "Noise cancelling": "Active (3 levels)", "Battery": "Up to 20 h", "Connectivity": "Bluetooth 4.1, NFC", "Weight": "234 g" },
    images: commons("d/d6/Bose_QuietComfort_35_II_Wireless_Headphones.jpg"),
  },
  {
    category: "headphones", supplier: "de", name: "Samsung Galaxy Buds+", brand: "Samsung",
    price: 99, cost: 65, stock: 31, rating: 4.4, reviews: 822,
    colors: ["Cosmic Black", "White", "Cloud Blue"],
    description: "Two-way dynamic speakers tuned by AKG and up to 11 hours of playback on a single charge, 22 hours with the case.",
    specs: { "Type": "True wireless earbuds", "Noise cancelling": "Ambient sound", "Battery": "Up to 22 h with case", "Connectivity": "Bluetooth 5.0", "Water resistance": "IPX2" },
    images: commons("e/e5/SAMSUNG_Galaxy_Buds%2B_%284%29.jpg"),
  },

  // ---------------- Smart Watches ----------------
  {
    category: "smart-watches", supplier: "us", name: "Apple Watch Series 4 Gold", brand: "Apple",
    price: 299, compareAt: 349, cost: 215, stock: 17, rating: 4.6, reviews: 1120, bestseller: true,
    colors: ["Gold", "Silver", "Space Gray"],
    description: "A larger edge-to-edge display, fall detection and an electrical heart sensor that can take an ECG from your wrist.",
    specs: { "Case size": "44 mm", "Display": "LTPO OLED Retina", "Battery": "Up to 18 h", "Water resistance": "50 m", "Health": "ECG, heart rate, fall detection" },
    images: dj("mobile-accessories/apple-watch-series-4-gold", 3),
  },
  {
    category: "smart-watches", supplier: "de", name: "Samsung Galaxy Watch", brand: "Samsung",
    price: 249, cost: 180, stock: 19, rating: 4.5, reviews: 734,
    colors: ["Midnight Black", "Rose Gold"],
    description: "A classic round watch face with a rotating bezel, multi-day battery life and 39 tracked workouts.",
    specs: { "Case size": "46 mm", "Display": "Super AMOLED", "Battery": "Up to 4 days", "Water resistance": "5 ATM", "Health": "Heart rate, sleep, stress" },
    images: commons("0/0f/SAMSUNG_Galaxy_Watch_%282%29.jpg"),
  },
  {
    category: "smart-watches", supplier: "cn", name: "Garmin Forerunner 35", brand: "Garmin",
    price: 169, cost: 115, stock: 4, rating: 4.4, reviews: 389,
    colors: ["Black", "Frost Blue"],
    description: "An easy-to-use GPS running watch with wrist-based heart rate, activity tracking and smart notifications.",
    specs: { "Case size": "35.5 mm", "Display": "Sunlight-visible LCD", "Battery": "Up to 9 days", "Water resistance": "5 ATM", "Health": "Heart rate, steps, calories" },
    images: commons("2/2d/Garmin_Forerunner_35_GPS_Watch_%2850660957927%29.jpg"),
  },
  {
    category: "smart-watches", supplier: "us", name: "Google Pixel Watch", brand: "Google",
    price: 279, cost: 205, stock: 12, rating: 4.3, reviews: 276, featured: true,
    colors: ["Matte Black", "Polished Silver"],
    description: "A domed, circular design with Fitbit health tracking built in, Google Assistant and Wear OS apps.",
    specs: { "Case size": "41 mm", "Display": "AMOLED", "Battery": "Up to 24 h", "Water resistance": "5 ATM", "Health": "Heart rate, sleep, SpO2" },
    images: commons("7/71/Google_Pixel_Watch_-_1.jpg"),
  },
  {
    category: "smart-watches", supplier: "cn", name: "Fitbit Versa Lite", brand: "Fitbit",
    price: 129, compareAt: 159, cost: 85, stock: 26, rating: 4.1, reviews: 512,
    colors: ["Charcoal", "Lilac", "Mulberry"],
    description: "A light, swim-proof smartwatch with one-button navigation, 4+ day battery and on-screen workouts.",
    specs: { "Case size": "39 mm", "Display": "LCD touchscreen", "Battery": "4+ days", "Water resistance": "50 m", "Health": "Heart rate, sleep stages" },
    images: commons("8/83/Fitbit_Versa_Lite_No_-_3.jpg"),
  },
  {
    category: "smart-watches", supplier: "cn", name: "Huawei Watch Classic", brand: "Huawei",
    price: 199, compareAt: 249, cost: 140, stock: 15, rating: 4.2, reviews: 198,
    colors: ["Steel", "Black Leather"],
    description: "A sapphire crystal AMOLED face in a cold-forged stainless steel case, with interchangeable straps and Wear OS apps.",
    specs: { "Case size": "42 mm", "Display": "AMOLED, sapphire crystal", "Battery": "Up to 2 days", "Water resistance": "IP67", "Health": "Heart rate, steps, sleep" },
    images: commons("e/e0/Huawei_Watch_%2816948546718%29.jpg"),
  },

  // ---------------- Cameras ----------------
  {
    category: "cameras", supplier: "de", name: "Sony Alpha 7 IV", brand: "Sony",
    price: 2499, cost: 2040, stock: 5, rating: 4.9, reviews: 403, featured: true,
    colors: ["Black"],
    description: "A 33 MP full-frame hybrid camera with real-time Eye AF for humans, animals and birds, and 4K 60p 10-bit video.",
    specs: { "Sensor": "33 MP full-frame", "Video": "4K 60p", "Stabilization": "5-axis IBIS", "Mount": "Sony E", "Weight": "658 g" },
    images: commons("0/0a/Sony_Alpha_7_Mark_IV.jpg"),
  },
  {
    category: "cameras", supplier: "de", name: "Canon EOS R6", brand: "Canon",
    price: 2099, cost: 1700, stock: 6, rating: 4.8, reviews: 351,
    colors: ["Black"],
    description: "A 20 MP full-frame sensor with outstanding low-light performance, up to 8 stops of image stabilization and 20 fps continuous shooting.",
    specs: { "Sensor": "20 MP full-frame", "Video": "4K 60p", "Stabilization": "5-axis IBIS", "Mount": "Canon RF", "Weight": "680 g" },
    images: commons("8/8d/Canon_R6_und_RF_85_1%2C2-8068.jpg"),
  },
  {
    category: "cameras", supplier: "cn", name: "Fujifilm X100V", brand: "Fujifilm",
    price: 1599, cost: 1260, stock: 3, rating: 4.9, reviews: 689, bestseller: true,
    colors: ["Silver", "Black"],
    description: "A premium compact with a fixed 23 mm f/2 lens, hybrid viewfinder and Fujifilm's film simulations straight out of camera.",
    specs: { "Sensor": "26 MP APS-C", "Video": "4K 30p", "Lens": "23 mm f/2 (fixed)", "Viewfinder": "Hybrid OVF/EVF", "Weight": "478 g" },
    images: commons("d/d5/Fujifilm_X100V_9_feb_2020a.jpg"),
  },
  {
    category: "cameras", supplier: "us", name: "GoPro HERO9 Black", brand: "GoPro",
    price: 299, compareAt: 349, cost: 215, stock: 28, rating: 4.5, reviews: 1430,
    colors: ["Black"],
    description: "5K video, HyperSmooth 3.0 stabilization and a front-facing screen for framing yourself. Waterproof to 10 m without a housing.",
    specs: { "Sensor": "23.6 MP", "Video": "5K 30p", "Stabilization": "HyperSmooth 3.0", "Waterproof": "10 m", "Weight": "158 g" },
    images: commons("7/7e/GoPro_Hero_9_Black_-_Front.jpg"),
  },
  {
    category: "cameras", supplier: "de", name: "Nikon Z fc", brand: "Nikon",
    price: 899, cost: 690, stock: 9, rating: 4.6, reviews: 274,
    colors: ["Silver", "Black"],
    description: "Heritage dials inspired by the classic Nikon FM2, modern mirrorless performance and a fully articulating touchscreen.",
    specs: { "Sensor": "20.9 MP APS-C", "Video": "4K 30p", "Stabilization": "Electronic (video)", "Mount": "Nikon Z", "Weight": "445 g" },
    images: commons("6/64/Nikon_Z_fc_3_aug_2021a.jpg"),
  },
  {
    category: "cameras", supplier: "cn", name: "DJI Mini 2 Drone", brand: "DJI",
    price: 449, cost: 330, stock: 2, rating: 4.7, reviews: 1876,
    colors: ["Grey"],
    description: "Under 249 g, so no registration is needed in most countries. 4K camera on a 3-axis gimbal and up to 31 minutes of flight time.",
    specs: { "Sensor": "12 MP 1/2.3\"", "Video": "4K 30p", "Flight time": "31 min", "Range": "10 km", "Weight": "249 g" },
    images: commons("2/2f/DJI_Mini_2.jpg"),
  },

  // ---------------- Gaming ----------------
  {
    category: "gaming", supplier: "us", name: "Sony PlayStation 5", brand: "Sony",
    price: 499, cost: 410, stock: 20, rating: 4.9, reviews: 3120, featured: true, bestseller: true,
    colors: ["White"],
    description: "Lightning-fast loading with an ultra-high-speed SSD, haptic feedback and adaptive triggers on the DualSense controller, and 3D audio.",
    specs: { "Storage": "825 GB SSD", "Resolution": "Up to 4K 120 Hz", "Disc drive": "Ultra HD Blu-ray", "Controller": "DualSense included", "Weight": "4.5 kg" },
    images: commons("0/00/PlayStation_5_and_DualSense.jpg"),
  },
  {
    category: "gaming", supplier: "us", name: "Xbox Series X", brand: "Microsoft",
    price: 499, cost: 405, stock: 14, rating: 4.8, reviews: 2045,
    colors: ["Carbon Black"],
    description: "The fastest, most powerful Xbox ever, with 12 teraflops of processing power, Quick Resume and true 4K gaming.",
    specs: { "Storage": "1 TB SSD", "Resolution": "Up to 4K 120 Hz", "Disc drive": "4K UHD Blu-ray", "Controller": "Xbox Wireless included", "Weight": "4.45 kg" },
    images: commons("3/3f/Xbox_Series_X%E3%81%A8Series_S.jpg"),
  },
  {
    category: "gaming", supplier: "cn", name: "Nintendo Switch", brand: "Nintendo",
    price: 299, cost: 235, stock: 25, rating: 4.8, reviews: 2788, bestseller: true,
    colors: ["Neon Red/Blue", "Gray"],
    description: "Play at home on the TV or on the go. The detachable Joy-Con controllers make local multiplayer possible anywhere.",
    specs: { "Storage": "32 GB", "Resolution": "1080p docked / 720p handheld", "Battery": "4.5 - 9 h", "Controller": "2 Joy-Con included", "Weight": "398 g" },
    images: commons("7/76/Nintendo-Switch-Console-Docked-wJoyConRB.jpg"),
  },
  {
    category: "gaming", supplier: "us", name: "Valve Steam Deck", brand: "Valve",
    price: 399, cost: 320, stock: 3, rating: 4.7, reviews: 964,
    colors: ["Black"],
    description: "Your Steam library, in your hands. A handheld gaming PC with a 7-inch touchscreen, full-size controls and a dock for TV play.",
    specs: { "Storage": "512 GB NVMe", "Resolution": "1280 x 800", "Battery": "2 - 8 h", "Controller": "Built in", "Weight": "669 g" },
    images: commons("5/5d/Steam_Deck_%28front%29.png"),
  },
  {
    category: "gaming", supplier: "cn", name: "DualSense Wireless Controller", brand: "Sony",
    price: 69, compareAt: 74, cost: 46, stock: 48, rating: 4.7, reviews: 1677,
    colors: ["White", "Midnight Black", "Cosmic Red"],
    description: "Feel every hit with haptic feedback and dynamic adaptive triggers. Built-in microphone and a USB-C charging port.",
    specs: { "Compatibility": "PS5, PC", "Connectivity": "Bluetooth, USB-C", "Battery": "Up to 12 h", "Haptics": "Adaptive triggers", "Weight": "280 g" },
    images: commons("3/3c/Playstation_DualSense_Controller.png"),
  },
  {
    category: "gaming", supplier: "cn", name: "Xbox Wireless Controller Carbon Black", brand: "Microsoft",
    price: 59, cost: 38, stock: 37, rating: 4.6, reviews: 1290,
    colors: ["Carbon Black", "Robot White"],
    description: "A refined design with textured grips, a hybrid D-pad and a Share button for capturing and sharing gameplay.",
    specs: { "Compatibility": "Xbox, PC, mobile", "Connectivity": "Xbox Wireless, Bluetooth", "Battery": "AA (up to 40 h)", "Haptics": "Impulse triggers", "Weight": "287 g" },
    images: commons("c/cb/Xbox_Series_Controller_Carbon_Black.jpg"),
  },
  {
    category: "gaming", supplier: "us", name: "Meta Quest 3", brand: "Meta",
    price: 499, cost: 395, stock: 8, rating: 4.6, reviews: 852, featured: true,
    colors: ["White"],
    description: "Mixed reality that blends the virtual and physical worlds, with pancake lenses, 4K+ Infinite Display and the Snapdragon XR2 Gen 2.",
    specs: { "Storage": "128 GB", "Resolution": "2064 x 2208 per eye", "Refresh rate": "Up to 120 Hz", "Battery": "Up to 2.2 h", "Weight": "515 g" },
    images: commons("9/99/Meta_Quest_3_front_View.jpg"),
  },
];
