export type CategoryId =
  | "pc-gamer"
  | "portatil"
  | "portatil-gamer"
  | "accesorios"
  | "componentes";

export type Category = {
  id: CategoryId;
  title: string;
  description: string;
  image: string;
  anchor: string;
};

export type Product = {
  id: string;
  name: string;
  slug?: string;
  description: string;
  priceCOP: number;
  category: CategoryId;
  image: string;
  photo?: string;
  badge?: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "pc-gamer",
    title: "Computador Gamer",
    description: "Equipos armados y listos para jugar con rendimiento sólido.",
    image: "/images/categories/pc-gamer.svg",
    anchor: "pc-gamer",
  },
  {
    id: "portatil",
    title: "Portátil",
    description: "Para estudio y trabajo, livianos y con buena batería.",
    image: "/images/categories/portatil.svg",
    anchor: "portatil",
  },
  {
    id: "portatil-gamer",
    title: "Portátil Gamer",
    description: "Potencia para jugar y crear, en formato portátil.",
    image: "/images/categories/portatil-gamer.svg",
    anchor: "portatil-gamer",
  },
  {
    id: "accesorios",
    title: "Accesorios",
    description: "Teclados, mouse, audífonos y más para tu setup.",
    image: "/images/categories/accesorios.svg",
    anchor: "accesorios",
  },
  {
    id: "componentes",
    title: "Componentes",
    description: "RAM, SSD, GPU y piezas para actualizar tu PC.",
    image: "/images/categories/componentes.svg",
    anchor: "componentes",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "pc-pulse",
    name: "PC Gamer Pulse",
    description: "Ryzen 7 · 32GB · SSD 1TB · Gráficos dedicados",
    priceCOP: 7899000,
    category: "pc-gamer",
    image: "/images/products/pc-tower.svg",
    photo: "/images/products/pc-gamer-pulse.webp",
    badge: "Top",
  },
  {
    id: "pc-studio",
    name: "PC Estudio",
    description: "Ryzen 5 · 16GB · SSD 1TB · Silencioso",
    priceCOP: 3299000,
    category: "pc-gamer",
    image: "/images/products/pc-tower.svg",
    photo: "/images/products/pc-estudio.webp",
  },
  {
    id: "pc-zenith",
    name: "PC Gamer Zenith",
    description: "Ryzen 9 · 32GB · SSD 2TB · Enfriamiento líquido",
    priceCOP: 9999000,
    category: "pc-gamer",
    image: "/images/products/pc-tower.svg",
    badge: "Premium",
  },
  {
    id: "pc-valor",
    name: "PC Gamer Valor",
    description: "Ryzen 7 · 16GB · SSD 1TB · Listo para 1440p",
    priceCOP: 6499000,
    category: "pc-gamer",
    image: "/images/products/pc-tower.svg",
  },
  {
    id: "pc-arc",
    name: "PC Gamer Arc",
    description: "Core i7 · 32GB · SSD 1TB · RGB minimalista",
    priceCOP: 7199000,
    category: "pc-gamer",
    image: "/images/products/pc-tower.svg",
  },
  {
    id: "pc-compact",
    name: "PC Gamer Compact",
    description: "Ryzen 5 · 16GB · SSD 1TB · Formato compacto",
    priceCOP: 4899000,
    category: "pc-gamer",
    image: "/images/products/pc-tower.svg",
  },
  {
    id: "pc-stream",
    name: "PC Stream",
    description: "Core i5 · 16GB · SSD 1TB · Ideal para streaming",
    priceCOP: 4599000,
    category: "pc-gamer",
    image: "/images/products/pc-tower.svg",
  },
  {
    id: "pc-fps",
    name: "PC FPS Pro",
    description: "Ryzen 7 · 32GB · SSD 1TB · Alto FPS en 1080p",
    priceCOP: 6999000,
    category: "pc-gamer",
    image: "/images/products/pc-tower.svg",
  },
  {
    id: "pc-ultra",
    name: "PC Ultra",
    description: "Core i9 · 64GB · SSD 2TB · Máxima potencia",
    priceCOP: 12999000,
    category: "pc-gamer",
    image: "/images/products/pc-tower.svg",
    badge: "Ultra",
  },
  {
    id: "pc-entry",
    name: "PC Gamer Entry",
    description: "Ryzen 5 · 16GB · SSD 512GB · Perfecto para empezar",
    priceCOP: 3699000,
    category: "pc-gamer",
    image: "/images/products/pc-tower.svg",
  },
  {
    id: "pc-silent",
    name: "PC Silent",
    description: "Core i7 · 16GB · SSD 1TB · Silencioso y eficiente",
    priceCOP: 5499000,
    category: "pc-gamer",
    image: "/images/products/pc-tower.svg",
  },
  {
    id: "laptop-creator-16",
    name: "Laptop Creator 16",
    description: "i7 · 32GB · SSD 1TB · Pantalla 16\"",
    priceCOP: 6899000,
    category: "portatil",
    image: "/images/products/laptop-creator.svg",
    photo: "/images/products/laptop-creator-16.webp",
    badge: "Nuevo",
  },
  {
    id: "laptop-pro-14",
    name: "Laptop Pro 14",
    description: "i7 · 16GB · SSD 1TB · Liviana",
    priceCOP: 5299000,
    category: "portatil",
    image: "/images/products/laptop-creator.svg",
    photo: "/images/products/laptop-pro-14.webp",
  },
  {
    id: "laptop-air-13",
    name: "Laptop Air 13",
    description: "i5 · 16GB · SSD 512GB · Ultraliviana",
    priceCOP: 3999000,
    category: "portatil",
    image: "/images/products/laptop-creator.svg",
  },
  {
    id: "laptop-student-15",
    name: "Laptop Student 15",
    description: "i5 · 8GB · SSD 512GB · Para clases y tareas",
    priceCOP: 2699000,
    category: "portatil",
    image: "/images/products/laptop-creator.svg",
  },
  {
    id: "laptop-business-14",
    name: "Laptop Business 14",
    description: "i7 · 16GB · SSD 1TB · Teclado cómodo",
    priceCOP: 4899000,
    category: "portatil",
    image: "/images/products/laptop-creator.svg",
  },
  {
    id: "laptop-battery-16",
    name: "Laptop Battery+ 16",
    description: "i7 · 16GB · SSD 1TB · Batería extendida",
    priceCOP: 5799000,
    category: "portatil",
    image: "/images/products/laptop-creator.svg",
    badge: "Batería",
  },
  {
    id: "laptop-creator-14",
    name: "Laptop Creator 14",
    description: "i7 · 16GB · SSD 1TB · Pantalla 14\"",
    priceCOP: 5599000,
    category: "portatil",
    image: "/images/products/laptop-creator.svg",
  },
  {
    id: "laptop-office-15",
    name: "Laptop Office 15",
    description: "i5 · 16GB · SSD 512GB · Fluida en oficina",
    priceCOP: 3199000,
    category: "portatil",
    image: "/images/products/laptop-creator.svg",
  },
  {
    id: "laptop-pro-16",
    name: "Laptop Pro 16",
    description: "i9 · 32GB · SSD 2TB · Para trabajo pesado",
    priceCOP: 8999000,
    category: "portatil",
    image: "/images/products/laptop-creator.svg",
    badge: "Pro",
  },
  {
    id: "laptop-quiet-14",
    name: "Laptop Quiet 14",
    description: "i5 · 16GB · SSD 512GB · Silenciosa y fresca",
    priceCOP: 3599000,
    category: "portatil",
    image: "/images/products/laptop-creator.svg",
  },
  {
    id: "laptop-2in1-14",
    name: "Laptop 2 en 1 14",
    description: "Pantalla táctil · 16GB · SSD 512GB · Convertible",
    priceCOP: 4499000,
    category: "portatil",
    image: "/images/products/laptop-creator.svg",
  },
  {
    id: "laptop-gamer-15",
    name: "Laptop Gamer 15",
    description: "Ryzen 7 · 16GB · SSD 1TB · 144Hz",
    priceCOP: 6599000,
    category: "portatil-gamer",
    image: "/images/products/laptop-creator.svg",
    photo: "/images/products/laptop-gamer-15.webp",
    badge: "Gaming",
  },
  {
    id: "laptop-gamer-16-qhd",
    name: "Laptop Gamer 16 QHD",
    description: "Core i7 · 16GB · SSD 1TB · 165Hz",
    priceCOP: 7699000,
    category: "portatil-gamer",
    image: "/images/products/laptop-creator.svg",
  },
  {
    id: "laptop-gamer-17",
    name: "Laptop Gamer 17",
    description: "Ryzen 9 · 32GB · SSD 2TB · Pantalla 17\"",
    priceCOP: 9999000,
    category: "portatil-gamer",
    image: "/images/products/laptop-creator.svg",
    badge: "Top",
  },
  {
    id: "laptop-gamer-14",
    name: "Laptop Gamer 14",
    description: "Ryzen 7 · 16GB · SSD 1TB · Compacta",
    priceCOP: 6999000,
    category: "portatil-gamer",
    image: "/images/products/laptop-creator.svg",
  },
  {
    id: "laptop-gamer-15-rtx",
    name: "Laptop Gamer 15 RTX",
    description: "Core i7 · 32GB · SSD 1TB · Ray tracing",
    priceCOP: 8999000,
    category: "portatil-gamer",
    image: "/images/products/laptop-creator.svg",
  },
  {
    id: "laptop-gamer-15-lite",
    name: "Laptop Gamer 15 Lite",
    description: "Ryzen 5 · 16GB · SSD 512GB · Buen precio",
    priceCOP: 5599000,
    category: "portatil-gamer",
    image: "/images/products/laptop-creator.svg",
  },
  {
    id: "laptop-gamer-16-creator",
    name: "Laptop Gamer Creator 16",
    description: "Core i9 · 32GB · SSD 2TB · Para crear y jugar",
    priceCOP: 10999000,
    category: "portatil-gamer",
    image: "/images/products/laptop-creator.svg",
    badge: "Creator",
  },
  {
    id: "laptop-gamer-15-esports",
    name: "Laptop Gamer eSports",
    description: "Ryzen 7 · 16GB · SSD 1TB · 240Hz",
    priceCOP: 8299000,
    category: "portatil-gamer",
    image: "/images/products/laptop-creator.svg",
  },
  {
    id: "laptop-gamer-15-cool",
    name: "Laptop Gamer Cool",
    description: "Core i7 · 16GB · SSD 1TB · Mejor flujo de aire",
    priceCOP: 7399000,
    category: "portatil-gamer",
    image: "/images/products/laptop-creator.svg",
  },
  {
    id: "laptop-gamer-16-max",
    name: "Laptop Gamer Max 16",
    description: "Ryzen 9 · 32GB · SSD 2TB · Máximo rendimiento",
    priceCOP: 11999000,
    category: "portatil-gamer",
    image: "/images/products/laptop-creator.svg",
    badge: "Max",
  },
  {
    id: "monitor-27",
    name: "Monitor 27\" 165Hz",
    description: "QHD · IPS · 1ms · Ajustable",
    priceCOP: 1399000,
    category: "accesorios",
    image: "/images/products/monitor.svg",
    photo: "/images/products/monitor-27-165hz.webp",
  },
  {
    id: "keyboard-mech",
    name: "Teclado Mecánico",
    description: "Hot-swap · RGB · Compacto",
    priceCOP: 329000,
    category: "accesorios",
    image: "/images/products/keyboard.svg",
    photo: "/images/products/teclado-mecanico.webp",
  },
  {
    id: "mouse-gaming",
    name: "Mouse Gaming",
    description: "Ligero · Sensor preciso · 6 botones",
    priceCOP: 189000,
    category: "accesorios",
    image: "/images/products/mouse.svg",
    photo: "/images/products/mouse-gaming.webp",
  },
  {
    id: "monitor-24-144",
    name: "Monitor 24\" 144Hz",
    description: "Full HD · IPS · 1ms · Gaming",
    priceCOP: 999000,
    category: "accesorios",
    image: "/images/products/monitor.svg",
  },
  {
    id: "monitor-32-4k",
    name: "Monitor 32\" 4K",
    description: "UHD · IPS · HDR · Productividad",
    priceCOP: 2199000,
    category: "accesorios",
    image: "/images/products/monitor.svg",
    badge: "4K",
  },
  {
    id: "keyboard-compact",
    name: "Teclado Compacto",
    description: "60% · RGB · Portátil",
    priceCOP: 229000,
    category: "accesorios",
    image: "/images/products/keyboard.svg",
  },
  {
    id: "keyboard-silent",
    name: "Teclado Silent",
    description: "Teclas silenciosas · Ideal oficina",
    priceCOP: 179000,
    category: "accesorios",
    image: "/images/products/keyboard.svg",
  },
  {
    id: "mouse-ultralight",
    name: "Mouse Ultralight",
    description: "Ultraligero · Alta precisión",
    priceCOP: 249000,
    category: "accesorios",
    image: "/images/products/mouse.svg",
  },
  {
    id: "mouse-wireless",
    name: "Mouse Wireless",
    description: "Inalámbrico · Batería larga",
    priceCOP: 219000,
    category: "accesorios",
    image: "/images/products/mouse.svg",
    badge: "Wireless",
  },
  {
    id: "pad-xl",
    name: "Mousepad XL",
    description: "Superficie amplia · Control",
    priceCOP: 89000,
    category: "accesorios",
    image: "/images/products/mouse.svg",
  },
  {
    id: "gpu-performance",
    name: "Tarjeta Gráfica",
    description: "Alto rendimiento para 1080p/1440p",
    priceCOP: 2499000,
    category: "componentes",
    image: "/images/products/gpu.svg",
    photo: "/images/products/tarjeta-grafica.webp",
    badge: "Trending",
  },
  {
    id: "ssd-2tb",
    name: "SSD NVMe 2TB",
    description: "Lectura hasta 7,000MB/s",
    priceCOP: 799000,
    category: "componentes",
    image: "/images/products/ssd.svg",
    photo: "/images/products/ssd-nvme-2tb.webp",
  },
  {
    id: "ssd-1tb",
    name: "SSD 1TB",
    description: "Carga rápida para juegos y apps",
    priceCOP: 299000,
    category: "componentes",
    image: "/images/products/ssd.svg",
    photo: "/images/products/ssd-1tb.webp",
  },
  {
    id: "gpu-compact",
    name: "GPU Compact",
    description: "Diseño compacto · Excelente eficiencia",
    priceCOP: 1999000,
    category: "componentes",
    image: "/images/products/gpu.svg",
  },
  {
    id: "gpu-pro",
    name: "GPU Pro",
    description: "Más potencia para 1440p/4K",
    priceCOP: 3499000,
    category: "componentes",
    image: "/images/products/gpu.svg",
    badge: "Pro",
  },
  {
    id: "ssd-512",
    name: "SSD 512GB",
    description: "Mejora rápida para tu equipo",
    priceCOP: 169000,
    category: "componentes",
    image: "/images/products/ssd.svg",
  },
  {
    id: "ssd-4tb",
    name: "SSD NVMe 4TB",
    description: "Almacenamiento masivo y rápido",
    priceCOP: 1499000,
    category: "componentes",
    image: "/images/products/ssd.svg",
    badge: "4TB",
  },
  {
    id: "ssd-heatsink",
    name: "SSD NVMe con Heatsink",
    description: "Temperaturas estables · Alto rendimiento",
    priceCOP: 899000,
    category: "componentes",
    image: "/images/products/ssd.svg",
  },
  {
    id: "gpu-entry",
    name: "GPU Entry",
    description: "Excelente para 1080p y eSports",
    priceCOP: 1499000,
    category: "componentes",
    image: "/images/products/gpu.svg",
  },
  {
    id: "ssd-1tb-pro",
    name: "SSD 1TB Pro",
    description: "Más velocidad para juegos y edición",
    priceCOP: 449000,
    category: "componentes",
    image: "/images/products/ssd.svg",
    badge: "Pro",
  },
];

export const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

export function slugify(value: unknown) {
  if (typeof value !== "string") return "";

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function getCategorySlug(category: Category) {
  return slugify(category.title);
}

export function findCategoryBySlug(slug: unknown) {
  const normalized = slugify(slug);
  if (!normalized) return null;
  return (
    CATEGORIES.find((c) => slugify(c.title) === normalized) ??
    CATEGORIES.find((c) => c.id === normalized) ??
    CATEGORIES.find((c) => c.anchor === normalized) ??
    null
  );
}

export function findProductBySlugInCategory(opts: {
  productSlug: unknown;
  categoryId: CategoryId;
}) {
  const normalized = slugify(opts.productSlug);
  if (!normalized) return null;
  return (
    PRODUCTS.find(
      (p) => p.category === opts.categoryId && slugify(p.name) === normalized
    ) ??
    PRODUCTS.find((p) => p.category === opts.categoryId && p.id === normalized) ??
    null
  );
}

export function getProductDetailsHref(product: Product) {
  const categorySlug = product.category;
  const productSlug = product.slug?.trim() ? product.slug : slugify(product.name);

  return `/categoria/${encodeURIComponent(categorySlug)}/${encodeURIComponent(
    productSlug
  )}/detalles`;
}
