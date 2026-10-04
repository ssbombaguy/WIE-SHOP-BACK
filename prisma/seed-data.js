// Demo catalog: 4 categories (phones, chargers, screen protectors, headphones), 3 suppliers, 38 products.
// Prices are in Georgian lari (₾) for readability; seed.js converts them to tetri (1 ₾ = 100 tetri).
//
// Images come from three sources:
//  - dummyjson.com product images (free for testing / demos)
//  - Wikimedia Commons (freely licensed; sourceUrl links to the author + license page),
//    stored locally in server/public/products
//  - our own renders of the screen protectors, also in server/public/products
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

const commons = (...paths) =>
  paths.map((path) => ({
    url: `/static/products/${localImageName(path)}`,
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${path.split("/").pop()}`,
  }));

// Images we made ourselves (no attribution needed), stored in server/public/products.
const own = (name) => [{ url: `/static/products/${name}.webp` }];

export const categories = [
  { name: "Phones", slug: "phones", icon: "phone" },
  { name: "Chargers", slug: "chargers", icon: "charger" },
  { name: "Screen Protectors", slug: "screen-protectors", icon: "shield" },
  { name: "Headphones", slug: "headphones", icon: "headphones" },
];

// Fake suppliers. ".example" domains are reserved and never resolve.
export const suppliers = [
  { key: "cn", name: "Shenzhen TechSource Ltd.", country: "China", contactEmail: "orders@techsource.example", website: "https://techsource.example", shippingDays: 9 },
  { key: "de", name: "EuroGadget Distribution GmbH", country: "Germany", contactEmail: "dropship@eurogadget.example", website: "https://eurogadget.example", shippingDays: 4 },
  { key: "us", name: "Pacific Electronics Wholesale", country: "United States", contactEmail: "partners@pacific-wholesale.example", website: "https://pacific-wholesale.example", shippingDays: 3 },
];

// condition defaults to NEW; older phones are sold REFURBISHED or USED (second hand).
// cost = what the supplier charges us. Phones and headphones run roughly 20-35% margin;
// chargers and screen protectors are cheap to source, so their margin is much higher.
export const products = [
  // ---------------- Phones ----------------
  {
    category: "phones", supplier: "us", name: "Apple iPhone 17 Pro Max", brand: "Apple",
    price: 3899, cost: 3120, stock: 14, rating: 4.9, reviews: 386, featured: true, bestseller: true,
    colors: ["Cosmic Orange", "Deep Blue", "Silver"],
    description: "Apple's biggest Pro yet: a forged aluminium unibody with a vapor chamber that keeps the A19 Pro cool, three 48 MP Fusion cameras with up to 8x optical-quality zoom, and the longest battery life ever in an iPhone.",
    descriptionKa: "Apple-ის ყველაზე დიდი Pro: ნაჭედი ალუმინის კორპუსი ორთქლის კამერით, რომელიც A19 Pro ჩიპს აგრილებს, სამი 48 MP Fusion კამერა 8x ოპტიკური ხარისხის ზუმით და iPhone-ის ისტორიაში ყველაზე ხანგრძლივი ბატარეა.",
    specs: { "Screen size": "6.9\"", "Chip": "A19 Pro", "Storage": "256 GB", "Main camera": "48 MP triple", "Front camera": "18 MP Center Stage", "Battery": "Up to 37 h video" },
    images: commons("9/92/Cosmic_Orange_iPhone_17_Pro_Max.jpg", "b/b6/Deep_Blue_iPhone_17_Pro_Max.jpg", "9/9d/Silver_iPhone_17_Pro_Max.jpg"),
  },
  {
    category: "phones", supplier: "us", name: "Apple iPhone Air", brand: "Apple",
    price: 3249, cost: 2600, stock: 16, rating: 4.7, reviews: 241, featured: true,
    colors: ["Space Black", "Sky Blue", "Light Gold"],
    description: "The thinnest iPhone ever at just 5.6 mm, with a titanium frame, a 6.5-inch ProMotion display, the A19 Pro chip and a 48 MP Fusion camera.",
    descriptionKa: "ყველაზე თხელი iPhone, სულ 5.6 მმ: ტიტანის ჩარჩო, 6.5-დიუმიანი ProMotion ეკრანი, A19 Pro ჩიპი და 48 MP Fusion კამერა.",
    specs: { "Screen size": "6.5\"", "Chip": "A19 Pro", "Storage": "256 GB", "Main camera": "48 MP Fusion", "Front camera": "18 MP Center Stage", "Battery": "Up to 27 h video" },
    images: commons("0/0e/Space_Black_iPhone_Air.jpg", "4/49/Sky_Blue_iPhone_Air.jpg", "8/84/Light_Gold_iPhone_Air.jpg"),
  },
  {
    category: "phones", supplier: "de", name: "Samsung Galaxy S26 Ultra", brand: "Samsung",
    price: 4219, cost: 3380, stock: 9, rating: 4.8, reviews: 214, featured: true,
    colors: ["Cobalt Violet", "Black", "White"],
    description: "A 6.9-inch display with a built-in Privacy Display that hides your screen from people beside you, a 200 MP main camera, 60W super-fast charging and the S Pen tucked inside the thinnest Ultra yet.",
    descriptionKa: "6.9-დიუმიანი ეკრანი ჩაშენებული Privacy Display-ით, რომელიც ეკრანს გვერდით მყოფებისგან მალავს, 200 MP მთავარი კამერა, 60W სწრაფი დატენვა და S Pen აქამდე ყველაზე თხელ Ultra-ში.",
    specs: { "Screen size": "6.9\"", "Chip": "Snapdragon 8 Elite Gen 5 for Galaxy", "Storage": "256 GB", "Main camera": "200 MP quad", "Front camera": "12 MP", "Battery": "5000 mAh, 60W" },
    images: commons("8/87/Galaxy_S26_Ultra_-_1.jpg", "1/14/Galaxy_S26_Ultra_-_2.jpg"),
  },
  {
    category: "phones", supplier: "us", name: "Apple iPhone 13 Pro", brand: "Apple", condition: "REFURBISHED",
    price: 2599, compareAt: 3249, cost: 1983, stock: 24, rating: 4.8, reviews: 1284, featured: true, bestseller: true,
    colors: ["Graphite", "Sierra Blue", "Gold"],
    description: "A 6.1-inch Super Retina XDR display with ProMotion, the A15 Bionic chip and a pro camera system with macro photography. All-day battery life in a surgical-grade stainless steel design. Refurbished to full working order with a new battery.",
    descriptionKa: "6.1-დიუმიანი Super Retina XDR ეკრანი ProMotion-ით, A15 Bionic ჩიპი და პროფესიონალური კამერა მაკრო ფოტოგრაფიით. მთელი დღის ბატარეა უჟანგავი ფოლადის კორპუსში. აღდგენილია სრულ სამუშაო მდგომარეობამდე, ახალი ბატარეით.",
    specs: { "Screen size": "6.1\"", "Chip": "A15 Bionic", "Storage": "128 GB", "Main camera": "12 MP triple", "Front camera": "12 MP", "Battery": "3095 mAh" },
    images: dj("smartphones/iphone-13-pro", 3),
  },
  {
    category: "phones", supplier: "us", name: "Apple iPhone X", brand: "Apple", condition: "REFURBISHED",
    price: 1299, compareAt: 1619, cost: 975, stock: 15, rating: 4.5, reviews: 932,
    colors: ["Space Gray", "Silver"],
    description: "The phone that introduced the all-screen design. 5.8-inch OLED display, Face ID and a dual 12 MP camera, professionally refurbished and tested.",
    descriptionKa: "ტელეფონი, რომელმაც სრულეკრანიანი დიზაინი დაამკვიდრა. 5.8-დიუმიანი OLED ეკრანი, Face ID და ორმაგი 12 MP კამერა. პროფესიონალურად აღდგენილი და შემოწმებული.",
    specs: { "Screen size": "5.8\"", "Chip": "A11 Bionic", "Storage": "64 GB", "Main camera": "12 MP dual", "Front camera": "7 MP", "Battery": "2716 mAh" },
    images: dj("smartphones/iphone-x", 3),
  },
  {
    category: "phones", supplier: "cn", name: "Apple iPhone 6", brand: "Apple", condition: "REFURBISHED",
    price: 579, cost: 390, stock: 9, rating: 4.1, reviews: 412,
    colors: ["Space Gray", "Gold"],
    description: "A compact classic with a 4.7-inch Retina HD display and Touch ID. A dependable backup phone or a first phone for kids. Refurbished.",
    descriptionKa: "კომპაქტური კლასიკა 4.7-დიუმიანი Retina HD ეკრანით და Touch ID-ით. საიმედო სათადარიგო ტელეფონი ან ბავშვის პირველი ტელეფონი. აღდგენილი.",
    specs: { "Screen size": "4.7\"", "Chip": "A8", "Storage": "32 GB", "Main camera": "8 MP", "Front camera": "1.2 MP", "Battery": "1810 mAh" },
    images: dj("smartphones/iphone-6", 3),
  },
  {
    category: "phones", supplier: "de", name: "Samsung Galaxy S10", brand: "Samsung", condition: "USED",
    price: 1459, compareAt: 1779, cost: 1105, stock: 18, rating: 4.6, reviews: 768, bestseller: true,
    colors: ["Prism Black", "Prism White", "Prism Blue"],
    description: "Infinity-O Dynamic AMOLED display, ultrasonic in-screen fingerprint reader and a triple camera with ultra-wide lens. Wireless PowerShare charges your earbuds from the back of the phone.",
    descriptionKa: "Infinity-O Dynamic AMOLED ეკრანი, ულტრაბგერითი თითის ანაბეჭდის სენსორი ეკრანში და სამმაგი კამერა ულტრაფართო ლინზით. Wireless PowerShare-ით ყურსასმენებს ტელეფონის ზურგით დატენავთ.",
    specs: { "Screen size": "6.1\"", "Chip": "Exynos 9820", "Storage": "128 GB", "Main camera": "12 MP triple", "Front camera": "10 MP", "Battery": "3400 mAh" },
    images: dj("smartphones/samsung-galaxy-s10", 3),
  },
  {
    category: "phones", supplier: "de", name: "Samsung Galaxy S8", brand: "Samsung", condition: "USED",
    price: 809, cost: 569, stock: 0, rating: 4.3, reviews: 655,
    colors: ["Midnight Black", "Orchid Gray"],
    description: "The curved Infinity Display that started it all, with an IP68 water-resistant body and expandable storage.",
    descriptionKa: "მოხრილი Infinity Display, რომლითაც ყველაფერი დაიწყო, IP68 წყალგაუმტარი კორპუსი და გაფართოებადი მეხსიერება.",
    specs: { "Screen size": "5.8\"", "Chip": "Exynos 8895", "Storage": "64 GB", "Main camera": "12 MP", "Front camera": "8 MP", "Battery": "3000 mAh" },
    images: dj("smartphones/samsung-galaxy-s8", 3),
  },
  {
    category: "phones", supplier: "cn", name: "Oppo F19 Pro Plus", brand: "Oppo", condition: "USED",
    price: 1069, cost: 764, stock: 30, rating: 4.4, reviews: 214,
    colors: ["Fluid Black", "Space Silver"],
    description: "5G speed, 50W Flash Charge and a 48 MP AI quad camera with night portrait video, in a slim 7.8 mm body.",
    descriptionKa: "5G სიჩქარე, 50W Flash Charge და 48 MP AI ოთხმაგი კამერა ღამის პორტრეტული ვიდეოთი, სულ 7.8 მმ სისქის კორპუსში.",
    specs: { "Screen size": "6.4\"", "Chip": "Dimensity 800U", "Storage": "128 GB", "Main camera": "48 MP quad", "Front camera": "16 MP", "Battery": "4310 mAh" },
    images: dj("smartphones/oppo-f19-pro-plus", 3),
  },
  {
    category: "phones", supplier: "cn", name: "Realme XT", brand: "Realme", condition: "USED",
    price: 739, cost: 520, stock: 27, rating: 4.2, reviews: 189,
    colors: ["Pearl Blue", "Pearl White"],
    description: "A 64 MP quad camera at a mid-range price, with a Super AMOLED display and VOOC 3.0 fast charging.",
    descriptionKa: "64 MP ოთხმაგი კამერა საშუალო ფასად, Super AMOLED ეკრანით და VOOC 3.0 სწრაფი დატენვით.",
    specs: { "Screen size": "6.4\"", "Chip": "Snapdragon 712", "Storage": "128 GB", "Main camera": "64 MP quad", "Front camera": "16 MP", "Battery": "4000 mAh" },
    images: dj("smartphones/realme-xt", 3),
  },
  {
    category: "phones", supplier: "cn", name: "Vivo X21", brand: "Vivo", condition: "USED",
    price: 969, cost: 683, stock: 12, rating: 4.3, reviews: 143,
    colors: ["Black", "Ruby Red"],
    description: "One of the first phones with an in-display fingerprint sensor, plus an AI-powered dual camera and a 6.28-inch Super AMOLED screen.",
    descriptionKa: "ერთ-ერთი პირველი ტელეფონი ეკრანში ჩაშენებული თითის ანაბეჭდის სენსორით, AI ორმაგი კამერით და 6.28-დიუმიანი Super AMOLED ეკრანით.",
    specs: { "Screen size": "6.28\"", "Chip": "Snapdragon 660", "Storage": "128 GB", "Main camera": "12 MP dual", "Front camera": "12 MP", "Battery": "3200 mAh" },
    images: dj("smartphones/vivo-x21", 3),
  },
  {
    category: "phones", supplier: "cn", name: "Oppo K1", brand: "Oppo", condition: "USED",
    price: 709, cost: 488, stock: 21, rating: 4.2, reviews: 167,
    colors: ["Piano Black", "Molandi Blue"],
    description: "A 6.4-inch AMOLED display with an in-screen fingerprint reader and a 25 MP selfie camera, at a price that leaves room for accessories.",
    descriptionKa: "6.4-დიუმიანი AMOLED ეკრანი ჩაშენებული თითის ანაბეჭდის სენსორით და 25 MP სელფი კამერა ფასად, რომელიც აქსესუარებისთვისაც გიტოვებთ.",
    specs: { "Screen size": "6.4\"", "Chip": "Snapdragon 660", "Storage": "64 GB", "Main camera": "16 MP dual", "Front camera": "25 MP", "Battery": "3600 mAh" },
    images: dj("smartphones/oppo-k1", 4),
  },
  {
    category: "phones", supplier: "cn", name: "Realme C35", brand: "Realme",
    price: 519, compareAt: 609, cost: 341, stock: 36, rating: 4.3, reviews: 402,
    colors: ["Glowing Green", "Glowing Black"],
    description: "A big 6.6-inch FHD+ screen, 50 MP AI triple camera and a 5000 mAh battery with 18W quick charging. A lot of phone for the money.",
    descriptionKa: "დიდი 6.6-დიუმიანი FHD+ ეკრანი, 50 MP AI სამმაგი კამერა და 5000 mAh ბატარეა 18W სწრაფი დატენვით. ბევრი ტელეფონი მცირე ფასად.",
    specs: { "Screen size": "6.6\"", "Chip": "Unisoc T616", "Storage": "128 GB", "Main camera": "50 MP triple", "Front camera": "8 MP", "Battery": "5000 mAh" },
    images: dj("smartphones/realme-c35", 3),
  },
  {
    category: "phones", supplier: "de", name: "Samsung Galaxy S7", brand: "Samsung", condition: "REFURBISHED",
    price: 479, cost: 319, stock: 11, rating: 4.1, reviews: 538,
    colors: ["Black Onyx", "Gold Platinum"],
    description: "A water-resistant classic with a 5.1-inch Quad HD Super AMOLED display and a fast dual-pixel camera. Refurbished and tested.",
    descriptionKa: "წყალგაუმტარი კლასიკა 5.1-დიუმიანი Quad HD Super AMOLED ეკრანით და სწრაფი Dual Pixel კამერით. აღდგენილი და შემოწმებული.",
    specs: { "Screen size": "5.1\"", "Chip": "Exynos 8890", "Storage": "32 GB", "Main camera": "12 MP", "Front camera": "5 MP", "Battery": "3000 mAh" },
    images: dj("smartphones/samsung-galaxy-s7", 3),
  },
  {
    category: "phones", supplier: "cn", name: "Vivo V9", brand: "Vivo", condition: "USED",
    price: 649, cost: 449, stock: 19, rating: 4.2, reviews: 226,
    colors: ["Champagne Gold", "Pearl Black"],
    description: "A 6.3-inch FullView display, a 24 MP AI selfie camera and face unlock, in a slim body that is easy to use one-handed.",
    descriptionKa: "6.3-დიუმიანი FullView ეკრანი, 24 MP AI სელფი კამერა და სახით განბლოკვა თხელ კორპუსში, რომელიც ერთი ხელით მოსახერხებელია.",
    specs: { "Screen size": "6.3\"", "Chip": "Snapdragon 626", "Storage": "64 GB", "Main camera": "16 MP dual", "Front camera": "24 MP", "Battery": "3260 mAh" },
    images: dj("smartphones/vivo-v9", 3),
  },

  // ---------------- Headphones ----------------
  {
    category: "headphones", supplier: "us", name: "Apple AirPods", brand: "Apple",
    price: 549, compareAt: 579, cost: 390, stock: 40, rating: 4.7, reviews: 2210, bestseller: true,
    colors: ["White"],
    description: "Spatial audio with dynamic head tracking, sweat and water resistance, and up to 30 hours of listening with the charging case.",
    descriptionKa: "სივრცითი აუდიო თავის მოძრაობის თვალყურის დევნებით, ოფლისა და წყლისგან დაცვა და დამტენი ქეისით 30 საათამდე მოსმენა.",
    specs: { "Type": "True wireless earbuds", "Noise cancelling": "No", "Battery": "Up to 30 h with case", "Connectivity": "Bluetooth 5.0", "Water resistance": "IPX4" },
    images: dj("mobile-accessories/apple-airpods", 3),
  },
  {
    category: "headphones", supplier: "us", name: "Apple AirPods Max Silver", brand: "Apple",
    price: 1779, cost: 1398, stock: 7, rating: 4.7, reviews: 1035, featured: true,
    colors: ["Silver", "Space Gray", "Sky Blue"],
    description: "High-fidelity audio with Active Noise Cancellation, Transparency mode and spatial audio, in an over-ear design with a knit-mesh canopy and memory-foam cushions.",
    descriptionKa: "მაღალი ხარისხის ხმა აქტიური ხმაურის ჩახშობით, Transparency რეჟიმით და სივრცითი აუდიოთი. ყურზე მოსარგები დიზაინი ბადისებრი თავსაკრავით და მეხსიერების ქაფის ბალიშებით.",
    specs: { "Type": "Over-ear", "Noise cancelling": "Active", "Battery": "Up to 20 h", "Connectivity": "Bluetooth 5.0", "Weight": "385 g" },
    images: dj("mobile-accessories/apple-airpods-max-silver", 1),
  },
  {
    category: "headphones", supplier: "cn", name: "Beats Flex Wireless Earphones", brand: "Beats",
    price: 219, cost: 137, stock: 55, rating: 4.4, reviews: 980,
    colors: ["Beats Black", "Flame Blue", "Yuzu Yellow"],
    description: "All-day wireless earphones with magnetic earbuds that pause your music when clipped together. Up to 12 hours of battery.",
    descriptionKa: "მთელი დღის უსადენო ყურსასმენები მაგნიტური საყურეებით, რომლებიც მუსიკას აჩერებს, როცა ერთმანეთს მიაკრავთ. ბატარეა 12 საათამდე.",
    specs: { "Type": "Neckband earphones", "Noise cancelling": "No", "Battery": "Up to 12 h", "Connectivity": "Bluetooth Class 1", "Weight": "18.6 g" },
    images: dj("mobile-accessories/beats-flex-wireless-earphones", 1),
  },
  {
    category: "headphones", supplier: "de", name: "Samsung Galaxy Buds Live", brand: "Samsung", condition: "USED",
    price: 389, compareAt: 479, cost: 267, stock: 22, rating: 4.3, reviews: 611,
    colors: ["Mystic Bronze", "Mystic Black"],
    description: "A bean-shaped open fit with Active Noise Cancellation and 12 mm AKG-tuned speakers. Up to 29 hours of play with the case.",
    descriptionKa: "ლობიოს ფორმის ღია მორგება აქტიური ხმაურის ჩახშობით და AKG-ის მიერ აწყობილი 12 მმ დინამიკებით. ქეისით 29 საათამდე მოსმენა.",
    specs: { "Type": "True wireless earbuds", "Noise cancelling": "Active (open type)", "Battery": "Up to 29 h with case", "Connectivity": "Bluetooth 5.0", "Water resistance": "IPX2" },
    images: commons("a/a0/Samsung_Galaxy_Buds_Live.jpg"),
  },
  {
    category: "headphones", supplier: "us", name: "Bose QuietComfort 35 II", brand: "Bose", condition: "REFURBISHED",
    price: 809, compareAt: 969, cost: 585, stock: 13, rating: 4.7, reviews: 3457, featured: true,
    colors: ["Black", "Silver"],
    description: "Legendary Bose noise cancellation with three adjustable levels, Alexa and Google Assistant built in, and up to 20 hours of wireless listening. Refurbished with new ear cushions.",
    descriptionKa: "Bose-ის ცნობილი ხმაურის ჩახშობა სამი დონით, ჩაშენებული Alexa და Google Assistant და 20 საათამდე უსადენო მოსმენა. აღდგენილია ახალი ბალიშებით.",
    specs: { "Type": "Over-ear", "Noise cancelling": "Active (3 levels)", "Battery": "Up to 20 h", "Connectivity": "Bluetooth 4.1, NFC", "Weight": "234 g" },
    images: commons("d/d6/Bose_QuietComfort_35_II_Wireless_Headphones.jpg"),
  },
  {
    category: "headphones", supplier: "de", name: "Samsung Galaxy Buds+", brand: "Samsung",
    price: 319, cost: 211, stock: 31, rating: 4.4, reviews: 822,
    colors: ["Cosmic Black", "White", "Cloud Blue"],
    description: "Two-way dynamic speakers tuned by AKG and up to 11 hours of playback on a single charge, 22 hours with the case.",
    descriptionKa: "AKG-ის მიერ აწყობილი ორზოლიანი დინამიკები, ერთი დატენვით 11 საათამდე მოსმენა და ქეისით 22 საათამდე.",
    specs: { "Type": "True wireless earbuds", "Noise cancelling": "Ambient sound", "Battery": "Up to 22 h with case", "Connectivity": "Bluetooth 5.0", "Water resistance": "IPX2" },
    images: commons("e/e5/SAMSUNG_Galaxy_Buds%2B_%284%29.jpg"),
  },

  // ---------------- Chargers ----------------
  {
    category: "chargers", supplier: "us", name: "Apple USB Power Adapter with Lightning Cable", brand: "Apple",
    price: 94, compareAt: 109, cost: 46, stock: 80, rating: 4.6, reviews: 1890, bestseller: true,
    colors: ["White"],
    description: "The compact Apple wall adapter with a 1 m USB to Lightning cable. Charges and syncs any iPhone with a Lightning port.",
    descriptionKa: "Apple-ის კომპაქტური კედლის ადაპტერი 1 მეტრიანი USB-Lightning კაბელით. ტენის და სინქრონიზაციას უკეთებს ნებისმიერ iPhone-ს Lightning პორტით.",
    specs: { "Output": "5 W", "Connector": "USB-A to Lightning", "Cable length": "1 m", "Compatible with": "iPhone 5 and later" },
    images: dj("mobile-accessories/apple-iphone-charger", 2),
  },
  {
    category: "chargers", supplier: "us", name: "Apple MagSafe Charger", brand: "Apple",
    price: 149, cost: 91, stock: 46, rating: 4.5, reviews: 1322, featured: true,
    colors: ["White"],
    description: "Magnets snap the charger into place on the back of your iPhone for faster wireless charging up to 15W. USB-C cable built in.",
    descriptionKa: "მაგნიტები დამტენს iPhone-ის ზურგზე ზუსტად ამაგრებს და 15W-მდე სწრაფ უსადენო დატენვას უზრუნველყოფს. USB-C კაბელი ჩაშენებულია.",
    specs: { "Output": "Up to 15 W", "Connector": "USB-C", "Cable length": "1 m", "Compatible with": "iPhone 12 and later, AirPods" },
    images: commons("0/01/MagSafe_and_USB-C_Cable_Charger_for_iPhone.jpg"),
  },
  {
    category: "chargers", supplier: "us", name: "Apple MagSafe Battery Pack", brand: "Apple",
    price: 319, compareAt: 389, cost: 215, stock: 18, rating: 4.4, reviews: 745, featured: true,
    colors: ["White"],
    description: "A slim battery that snaps onto your iPhone and keeps it topped up on the go. Charge both at once by plugging in a Lightning cable.",
    descriptionKa: "თხელი ბატარეა, რომელიც iPhone-ს ზურგზე ემაგრება და გზაში დამუხტულს გინარჩუნებთ. Lightning კაბელით ორივეს ერთდროულად დატენავთ.",
    specs: { "Capacity": "1460 mAh", "Wireless output": "Up to 7.5 W", "Input": "Lightning, up to 20 W", "Compatible with": "iPhone 12 and later" },
    images: dj("mobile-accessories/apple-magsafe-battery-pack", 2),
  },
  {
    category: "chargers", supplier: "de", name: "Dual Wireless Charging Mat", brand: "Cyber",
    price: 189, cost: 104, stock: 27, rating: 4.3, reviews: 214,
    colors: ["White"],
    description: "Charge your phone and earbuds side by side on one soft-touch mat. Qi certified, with foreign-object detection and overheat protection.",
    descriptionKa: "დატენეთ ტელეფონი და ყურსასმენები გვერდიგვერდ ერთ რბილ ზედაპირზე. Qi სერტიფიცირებული, უცხო საგნის აღმოჩენით და გადახურებისგან დაცვით.",
    specs: { "Output": "Up to 15 W", "Devices at once": "2", "Standard": "Qi", "Connector": "USB-C" },
    images: dj("mobile-accessories/apple-airpower-wireless-charger", 1),
  },
  {
    category: "chargers", supplier: "cn", name: "Re-Load 10W Wireless Charging Pad", brand: "Re-Load",
    price: 59, cost: 29, stock: 64, rating: 4.1, reviews: 388,
    colors: ["Black"],
    description: "A slim, non-slip pad for any Qi phone. Drop your phone on and it starts charging, even through most cases up to 5 mm.",
    descriptionKa: "თხელი, არამოცურებადი უსადენო დამტენი ნებისმიერი Qi ტელეფონისთვის. დადეთ ტელეფონი და დატენვა იწყება, 5 მმ-მდე ქეისის გავლითაც.",
    specs: { "Output": "Up to 10 W", "Standard": "Qi", "Connector": "USB-A", "Cable length": "1 m" },
    images: commons("c/c0/Smartphone_induction_charger.jpg"),
  },
  {
    category: "chargers", supplier: "cn", name: "15W Fast Wireless Charger", brand: "Cyber",
    price: 79, compareAt: 99, cost: 39, stock: 52, rating: 4.2, reviews: 276,
    colors: ["White", "Black"],
    description: "A round fast-charging pad with a discreet status light that stays dim at night. Works with iPhone, Samsung Galaxy and AirPods cases.",
    descriptionKa: "მრგვალი სწრაფი უსადენო დამტენი დისკრეტული ინდიკატორით, რომელიც ღამით მკრთალად ანათებს. თავსებადია iPhone-თან, Samsung Galaxy-სთან და AirPods-ის ქეისებთან.",
    specs: { "Output": "Up to 15 W", "Standard": "Qi", "Connector": "USB-C", "Cable length": "1.2 m" },
    images: commons("7/7c/Wireless_Charger_white_front.jpg"),
  },
  {
    category: "chargers", supplier: "cn", name: "3-in-1 Retractable Charging Cable + Adapter", brand: "Cyber",
    price: 49, cost: 20, stock: 90, rating: 4.0, reviews: 152,
    colors: ["Red"],
    description: "One tangle-free retractable cable with Lightning, USB-C and Micro-USB tips, plus a compact USB wall adapter. Perfect for travel bags.",
    descriptionKa: "ერთი დასახვევი კაბელი Lightning, USB-C და Micro-USB ბოლოებით და კომპაქტური USB ადაპტერი. იდეალურია მოგზაურობისთვის.",
    specs: { "Connectors": "Lightning, USB-C, Micro-USB", "Output": "Up to 12 W", "Cable length": "1.2 m (retractable)", "In the box": "Cable + USB adapter" },
    images: commons("1/16/Multi-USB_and_charger.jpg"),
  },

  {
    category: "chargers", supplier: "us", name: "Apple 20W USB-C Power Adapter", brand: "Apple",
    price: 79, compareAt: 94, cost: 42, stock: 85, rating: 4.8, reviews: 2140, bestseller: true,
    colors: ["White"],
    description: "Apple's compact USB-C wall charger. Fast-charges iPhone 8 and later to 50% in around 30 minutes, and powers MagSafe chargers.",
    descriptionKa: "Apple-ის კომპაქტური USB-C დამტენი. iPhone 8 და უფრო ახალ მოდელებს დაახლოებით 30 წუთში 50%-მდე ტენის და MagSafe დამტენებსაც კვებავს.",
    specs: { "Output": "20 W", "Connector": "USB-C", "Fast charging": "Yes (USB Power Delivery)", "Compatible with": "iPhone 8 and later, iPad, AirPods" },
    images: own("apple-20w-usb-c-power-adapter"),
  },

  // ---------------- Screen Protectors ----------------
  {
    category: "screen-protectors", supplier: "cn", name: "Tempered Glass for iPhone 17 Pro Max (2-pack)", brand: "Cyber",
    price: 59, compareAt: 79, cost: 16, stock: 140, rating: 4.7, reviews: 312, bestseller: true,
    colors: ["Clear"],
    description: "9H tempered glass cut precisely around the Dynamic Island, with an oleophobic coating and an alignment frame for a bubble-free fit.",
    descriptionKa: "9H ნაწრთობი მინა, ზუსტად Dynamic Island-ის ირგვლივ ამოჭრილი, ანაბეჭდებისგან დამცავი საფარით და ჩარჩოთი ბუშტების გარეშე დასაკრავად.",
    specs: { "Material": "Tempered glass", "Hardness": "9H", "Thickness": "0.33 mm", "Pack": "2 pieces", "Fits": "iPhone 17 Pro Max" },
    images: own("tempered-glass-iphone-17-pro-max"),
  },
  {
    category: "screen-protectors", supplier: "cn", name: "Camera Lens Protector for iPhone 17 Pro Max", brand: "Cyber",
    price: 39, cost: 10, stock: 120, rating: 4.6, reviews: 158,
    colors: ["Clear"],
    description: "One glass piece that covers the full-width camera plateau, with cut-outs for all three lenses, the flash and the LiDAR sensor.",
    descriptionKa: "ერთიანი მინა, რომელიც კამერის მთელ პლატოს ფარავს, სამივე ლინზის, ფლეშის და LiDAR სენსორის ამონაჭრებით.",
    specs: { "Material": "Tempered glass", "Hardness": "9H", "Coverage": "Full camera plateau", "Pack": "1 piece", "Fits": "iPhone 17 Pro / 17 Pro Max" },
    images: own("camera-lens-protector-iphone-17-pro-max"),
  },
  {
    category: "screen-protectors", supplier: "de", name: "Tempered Glass for Samsung Galaxy S26 Ultra", brand: "Cyber",
    price: 59, cost: 16, stock: 90, rating: 4.5, reviews: 87,
    colors: ["Clear"],
    description: "Flat edge-to-edge glass made for the S26 Ultra's flat display, with a punch-hole cut-out. Works with the ultrasonic fingerprint reader.",
    descriptionKa: "ბრტყელი, კიდიდან კიდემდე მინა S26 Ultra-ს ბრტყელი ეკრანისთვის, კამერის ამონაჭრით. თავსებადია ულტრაბგერით თითის ანაბეჭდის სენსორთან.",
    specs: { "Material": "Tempered glass", "Hardness": "9H", "Edges": "Flat, full coverage", "Pack": "1 piece", "Fits": "Galaxy S26 Ultra" },
    images: own("tempered-glass-galaxy-s26-ultra"),
  },
  {
    category: "screen-protectors", supplier: "cn", name: "Tempered Glass for iPhone 13 Pro (2-pack)", brand: "Cyber",
    price: 49, compareAt: 59, cost: 13, stock: 120, rating: 4.6, reviews: 932, bestseller: true,
    colors: ["Clear"],
    description: "9H hardness tempered glass with an oleophobic coating that resists fingerprints. Includes an alignment frame for a bubble-free fit in seconds.",
    descriptionKa: "9H სიმტკიცის ნაწრთობი მინა ანაბეჭდებისგან დამცავი საფარით. კომპლექტში მოყვება ჩარჩო, რომლითაც წამებში ბუშტების გარეშე დააკრავთ.",
    specs: { "Material": "Tempered glass", "Hardness": "9H", "Thickness": "0.33 mm", "Pack": "2 pieces", "Fits": "iPhone 13 Pro" },
    images: own("tempered-glass-iphone-13-pro"),
  },
  {
    category: "screen-protectors", supplier: "cn", name: "Privacy Glass for iPhone 13 Pro", brand: "Cyber",
    price: 59, cost: 20, stock: 75, rating: 4.4, reviews: 418,
    colors: ["Black tint"],
    description: "A privacy filter that keeps your screen clear for you and dark for anyone looking from the side. Full-coverage tempered glass.",
    descriptionKa: "კონფიდენციალურობის ფილტრი: ეკრანი თქვენთვის ნათელია, გვერდიდან კი მუქი ჩანს. სრულად მფარავი ნაწრთობი მინა.",
    specs: { "Material": "Tempered glass", "Hardness": "9H", "Viewing angle": "30°", "Pack": "1 piece", "Fits": "iPhone 13 Pro" },
    images: own("privacy-glass-iphone-13-pro"),
  },
  {
    category: "screen-protectors", supplier: "de", name: "Curved Glass for Samsung Galaxy S10", brand: "Cyber",
    price: 54, compareAt: 69, cost: 16, stock: 58, rating: 4.3, reviews: 305,
    colors: ["Clear"],
    description: "3D curved edge-to-edge glass with a cut-out for the punch-hole camera. Compatible with the ultrasonic in-screen fingerprint reader.",
    descriptionKa: "3D მოხრილი, კიდიდან კიდემდე მინა კამერის ამონაჭრით. თავსებადია ულტრაბგერით თითის ანაბეჭდის სენსორთან.",
    specs: { "Material": "Tempered glass", "Hardness": "9H", "Edges": "3D curved", "Pack": "1 piece", "Fits": "Galaxy S10" },
    images: own("curved-glass-galaxy-s10"),
  },
  {
    category: "screen-protectors", supplier: "cn", name: "Matte Anti-Glare Film for iPhone X (2-pack)", brand: "Cyber",
    price: 39, cost: 10, stock: 84, rating: 4.1, reviews: 197,
    colors: ["Matte"],
    description: "A frosted film that cuts reflections outdoors and gives the screen a smooth, paper-like feel. Ideal for gaming without smudges.",
    descriptionKa: "მქრქალი ფირი, რომელიც გარეთ ანარეკლს ამცირებს და ეკრანს ქაღალდივით გლუვ შეგრძნებას აძლევს. იდეალურია თამაშისთვის ლაქების გარეშე.",
    specs: { "Material": "PET film", "Finish": "Matte anti-glare", "Thickness": "0.15 mm", "Pack": "2 pieces", "Fits": "iPhone X / XS" },
    images: own("matte-film-iphone-x"),
  },
  {
    category: "screen-protectors", supplier: "cn", name: "Camera Lens Protector for iPhone 13 Pro", brand: "Cyber",
    price: 29, cost: 7, stock: 110, rating: 4.5, reviews: 264,
    colors: ["Clear"],
    description: "A single piece of glass that covers the whole camera bump, with precise cut-outs so photos stay sharp and the flash is not blocked.",
    descriptionKa: "ერთიანი მინა, რომელიც კამერის მთელ ბლოკს ფარავს ზუსტი ამონაჭრებით, ასე რომ ფოტოები მკვეთრი რჩება და ფლეში არ იფარება.",
    specs: { "Material": "Tempered glass", "Hardness": "9H", "Coverage": "Full camera module", "Pack": "1 piece", "Fits": "iPhone 13 Pro" },
    images: own("camera-lens-protector-iphone-13-pro"),
  },
  {
    category: "screen-protectors", supplier: "cn", name: "Universal Clear Screen Film (3-pack)", brand: "Cyber",
    price: 24, cost: 3, stock: 150, rating: 3.9, reviews: 88,
    colors: ["Clear"],
    description: "Thin, self-adhesive clear film that you can trim to fit older or less common phones. Protects against everyday scratches.",
    descriptionKa: "თხელი, თვითწებვადი გამჭვირვალე ფირი, რომელსაც ძველი ან ნაკლებად გავრცელებული ტელეფონების ზომაზე მოჭრით. იცავს ყოველდღიური ნაკაწრებისგან.",
    specs: { "Material": "PET film", "Thickness": "0.12 mm", "Size": "Up to 5\" (trim to fit)", "Pack": "3 pieces" },
    images: commons("9/94/Screen_protector.png"),
  },
];

// "Cheaper together" (ერთად იაფია): accessories offered on a product's page at a discount when they're
// bought in the same order. discount = % off the accessory, only for as many units as the main product.
export const bundles = [
  {
    product: "Apple iPhone 17 Pro Max",
    items: [
      ["Tempered Glass for iPhone 17 Pro Max (2-pack)", 30],
      ["Camera Lens Protector for iPhone 17 Pro Max", 25],
      ["Apple 20W USB-C Power Adapter", 15],
      ["Apple MagSafe Charger", 10],
      ["Apple MagSafe Battery Pack", 10],
    ],
  },
  {
    product: "Apple iPhone Air",
    items: [
      ["Apple 20W USB-C Power Adapter", 15],
      ["Apple MagSafe Charger", 10],
      ["Apple AirPods", 5],
    ],
  },
  {
    product: "Samsung Galaxy S26 Ultra",
    items: [
      ["Tempered Glass for Samsung Galaxy S26 Ultra", 30],
      ["15W Fast Wireless Charger", 20],
      ["Samsung Galaxy Buds+", 10],
    ],
  },
  {
    product: "Apple iPhone 13 Pro",
    items: [
      ["Tempered Glass for iPhone 13 Pro (2-pack)", 30],
      ["Camera Lens Protector for iPhone 13 Pro", 25],
      ["Apple USB Power Adapter with Lightning Cable", 15],
    ],
  },
  {
    product: "Apple iPhone X",
    items: [
      ["Matte Anti-Glare Film for iPhone X (2-pack)", 30],
      ["Apple USB Power Adapter with Lightning Cable", 15],
    ],
  },
  {
    product: "Samsung Galaxy S10",
    items: [
      ["Curved Glass for Samsung Galaxy S10", 30],
      ["15W Fast Wireless Charger", 20],
    ],
  },
];
