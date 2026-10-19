// 首次启动的种子数据（宠物用品 + 手作品类示例）
module.exports = function seed({ q, hashPassword }) {
  // 管理员
  q.run("INSERT OR IGNORE INTO admins (username, password_hash) VALUES (?,?)",
    ['admin', hashPassword('admin123')]);

  // 站点设置
  const settings = {
    site_name: 'WhimsiPaw',
    tagline: 'Handmade Pet Fashion & Custom Cosplay',
    logo_emoji: '🐾',
    primary_color: '#E85D9E',
    footer_note: 'Handmade pet apparel, cozy living and made-to-measure cosplay — stitched with love, shipped worldwide.',
    contact_email: 'hello@whimspaw.com',
    currency: 'USD',
  };
  for (const [k, v] of Object.entries(settings)) {
    q.run("INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)", [k, v]);
  }

  // 分类
  const cats = [
    ['pet-apparel', 'Pet Apparel', 'Sweaters, raincoats, bandanas & more — hand-stitched.'],
    ['pet-living', 'Pet Living', 'Bowls, beds, leashes & carriers for everyday joy.'],
    ['handmade-cosplay', 'Handmade & Cosplay', 'One-of-a-kind costumes & commissions, made to order.'],
  ];
  for (const [slug, name, desc] of cats) {
    q.run("INSERT OR IGNORE INTO categories (slug, name, description) VALUES (?,?,?)", [slug, name, desc]);
  }

  // 产品
  const products = [
    {
      slug: 'sakura-kimono', cat: 'handmade-cosplay', name: 'Sakura Kimono', subtitle: 'Handmade cosplay · blossom print',
      desc: 'A handmade anime-inspired kimono costume in sakura-pink with embroidered cherry blossoms. Made to measure, signed by the maker.',
      price: 45, compare: 59, badge: 'sale', featured: 1,
      images: ['p_kimono.jpg', 'p_bandana.jpg', 'p_catcos.jpg'],
      options: [{ name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL'] }, { name: 'Color', values: ['Sakura Pink', 'Mint', 'Lavender'] }],
      custom_note: 'Send us your pet\'s chest, neck & back length — we tailor the fit free of charge.',
    },
    {
      slug: 'cloud-knit-sweater', cat: 'pet-apparel', name: 'Cloud Knit Sweater', subtitle: 'Chunky hand-knit · pom-pom collar',
      desc: 'A chunky hand-knitted pet sweater in blush pink with a tiny pom-pom collar. Cloud-soft merino blend, pre-washed.',
      price: 39, compare: 49, badge: 'sale', featured: 1,
      images: ['p_sweater.jpg', 'p_kimono.jpg'],
      options: [{ name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL'] }],
      custom_note: '',
    },
    {
      slug: 'blossom-slow-feed-bowl', cat: 'pet-living', name: 'Blossom Slow-Feed Bowl', subtitle: 'Ceramic · flower-shaped maze',
      desc: 'A hand-glazed ceramic slow-feeder with a raised flower maze that turns mealtime into a calm, 10-minute ritual.',
      price: 29, compare: 0, badge: 'new', featured: 1,
      images: ['p_bowl.jpg', 'p_bed.jpg'], options: [], custom_note: '',
    },
    {
      slug: 'cloud-donut-bed', cat: 'pet-living', name: 'Cloud Donut Bed', subtitle: 'Cream boucle · machine washable',
      desc: 'A cozy round donut bed in cream boucle with a plush raised rim — the nap your pet deserves.',
      price: 59, compare: 79, badge: 'sale', featured: 1,
      images: ['p_bed.jpg', 'p_bowl.jpg'], options: [{ name: 'Size', values: ['S', 'M', 'L'] }], custom_note: '',
    },
    {
      slug: 'candy-rope-leash', cat: 'pet-living', name: 'Candy Rope Leash', subtitle: 'Hand-braided cotton · brass clip',
      desc: 'A hand-braided cotton rope leash in coral, cream & mint colour blocks with a solid brass clip.',
      price: 24, compare: 0, badge: '', featured: 0,
      images: ['p_leash.jpg'], options: [{ name: 'Length', values: ['120cm', '150cm'] }], custom_note: '',
    },
    {
      slug: 'star-witch-cosplay-set', cat: 'handmade-cosplay', name: 'Star Witch Cosplay Set', subtitle: 'Hat + cape · star embroidery',
      desc: 'A tiny pastel witch hat and lavender cape with star embroidery — for the most magical pet on the block.',
      price: 42, compare: 50, badge: 'sale', featured: 1,
      images: ['p_catcos.jpg', 'p_kimono.jpg'], options: [{ name: 'Size', values: ['XS', 'S', 'M'] }], custom_note: '',
    },
    {
      slug: 'sunny-raincoat', cat: 'pet-apparel', name: 'Sunny Raincoat', subtitle: 'Translucent · hooded',
      desc: 'A translucent yellow raincoat with hood to keep puddle-jumps drama-free. Custom length available.',
      price: 35, compare: 0, badge: '', featured: 0,
      images: ['p_raincoat.jpg'], options: [{ name: 'Size', values: ['XS', 'S', 'M', 'L'] }], custom_note: 'Custom length: add your pet\'s back length at checkout.',
    },
    {
      slug: 'blossom-silk-bandana', cat: 'pet-apparel', name: 'Blossom Silk Bandana', subtitle: 'Mulberry silk · bell collar',
      desc: 'A mulberry-silk bandana in sakura pink with cherry-blossom print and a matching small bell collar.',
      price: 18, compare: 0, badge: 'new', featured: 0,
      images: ['p_bandana.jpg'], options: [{ name: 'Size', values: ['S', 'M', 'L'] }], custom_note: '',
    },
    {
      slug: 'bubble-carrier-backpack', cat: 'pet-living', name: 'Bubble Carrier Backpack', subtitle: 'Cream · clear bubble window',
      desc: 'A stylish canvas pet carrier backpack with a clear bubble window for safe, snug adventures.',
      price: 69, compare: 0, badge: '', featured: 0,
      images: ['p_backpack.jpg'], options: [{ name: 'Color', values: ['Cream', 'Mint', 'Pink'] }], custom_note: '',
    },
    {
      slug: 'handwoven-tote-bag', cat: 'handmade-cosplay', name: 'Handwoven Tote Bag', subtitle: 'Cotton rope · wooden handles',
      desc: 'A handwoven cotton-rope tote with pink & mint accent stripes and wooden handles. One of one.',
      price: 32, compare: 0, badge: 'new', featured: 0,
      images: ['p_tote.jpg'], options: [], custom_note: 'Each bag is woven to order — expect slight, charming variations.',
    },
  ];
  const catId = (slug) => q.get('SELECT id FROM categories WHERE slug=?', [slug]).id;
  for (const p of products) {
    q.insert(`INSERT INTO products (slug, category_id, name, subtitle, description, price, compare_at_price, currency, badge, images, options, custom_note, featured, status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [p.slug, catId(p.cat), p.name, p.subtitle, p.desc, p.price, p.compare, 'USD', p.badge,
       JSON.stringify(p.images.map(i => '/assets/media/' + i)), JSON.stringify(p.options), p.custom_note, p.featured, 'active']);
  }

  // 博客/单页
  const pages = [
    ['sizing-guide', 'How to Measure Your Pet for a Perfect Fit', 'blog', 'Sizing Guide',
      'Neck, chest, length — the three numbers that decide whether an outfit fits or fails. Wrap a soft tape snugly, never tight, and always measure over the fur.',
      'p_backpack.jpg', 'published'],
    ['craft-journal-bags', 'Behind the Seams: How Our Handwoven Bags Are Made', 'blog', 'Craft Story',
      'From cotton rope to finished tote — 6 hours, 2 hands, zero machines. Every knot is tied by the same maker who signs your card.',
      'p_tote.jpg', 'published'],
    ['cat-cosplay-ideas', '5 Cosplay Ideas for Your Cat\'s Next Photoshoot', 'blog', 'Pet Life',
      'Witch, samurai, sailor, detective, bumblebee — plus what fabric works best for each look.',
      'p_bed.jpg', 'published'],
    ['about', 'About WhimsiPaw', 'about', 'Our Story',
      'Two humans, many paws. We started WhimsiPaw because every pet deserves clothes that actually fit and a costume that tells a story.',
      'p_kimono.jpg', 'published'],
  ];
  for (const [slug, title, type, excerpt, body, cover, status] of pages) {
    q.run("INSERT OR IGNORE INTO pages (slug, title, type, excerpt, body, cover, status) VALUES (?,?,?,?,?,?,?)",
      [slug, title, type, excerpt, body, '/assets/media/' + cover, status]);
  }

  // 首页区块（全权可编辑）
  const sections = [
    ['hero', 'hero', 'Home Hero', '', {
      slides: [
        { video: '/assets/media/banner-pet-1.mp4', kicker: 'WhimsiPaw Signature', h1: 'Outfits That Make<br>Tails Wag Harder',
          p: 'Handmade pet apparel & gear, stitched one piece at a time — because your best friend deserves one-of-one.',
          cta: [{ label: 'Shop Pet Apparel', href: '/products' }, { label: 'Meet the Family', href: '#family' }] },
        { video: '/assets/media/banner-pet-2.mp4', kicker: 'WhimsiPaw Cosplay Studio', h1: 'Little Heroes,<br>Handmade Costumes',
          p: 'Anime-inspired cosplay for cats & dogs — made to measure, embroidered by hand, ready for the photoshoot.',
          cta: [{ label: 'Explore Cosplay', href: '/product/sakura-kimono' }, { label: 'Why Handmade', href: '#why' }] },
      ],
    }],
    ['product_grid', 'product_grid', 'New Arrivals, Made With Love', 'Fresh drops from the studio', {}],
    ['creators', 'creators', 'Stars of the WhimsiPaw Family', 'Real pets. Real outfits. Real zoomies.', {
      items: [
        { name: 'Mochi · Shiba Inu', wearing: 'Sakura Kimono · Size M', img: '/assets/media/p_kimono.jpg' },
        { name: 'Yuki · Ragdoll Cat', wearing: 'Blossom Silk Bandana · One size', img: '/assets/media/p_bandana.jpg' },
        { name: 'Mikan · Orange Tabby', wearing: 'Star Witch Cosplay Set · Size S', img: '/assets/media/p_catcos.jpg' },
        { name: 'Pudding · Dachshund', wearing: 'Sunny Raincoat · Custom length', img: '/assets/media/p_raincoat.jpg' },
      ],
    }],
    ['pain_points', 'pain_points', 'Why Pet Parents Choose Handmade', '', {
      items: [
        { title: 'One-Size-Fits-None', img: '/assets/media/p_sweater.jpg', body: 'Every piece is cut to your pet\'s real measurements — chest, neck, length — so nothing rides up, squeezes or drags.' },
        { title: 'Scratchy, Cheap Fabrics', img: '/assets/media/p_bandana.jpg', body: 'We only use skin-friendly cotton, boucle and mulberry silk — pre-washed, pre-shrunk and soft from day one.' },
        { title: 'Mass-Produced Boredom', img: '/assets/media/p_tote.jpg', body: 'No two WhimsiPaw pieces are identical. Patterns rotate, fabrics are limited-run, and your pet\'s piece is truly theirs.' },
        { title: 'Falls Apart After Two Washes', img: '/assets/media/p_raincoat.jpg', body: 'Reinforced double stitching, bar-tacked stress points and colourfast dyes — built for zoomies and muddy adventures.' },
        { title: 'No Soul in Fast Fashion', img: '/assets/media/p_kimono.jpg', body: 'Each order is made by a named maker in our studio, signed on the care card, and shipped with a paw-printed thank-you note.' },
      ],
    }],
    ['milestones', 'milestones', 'The WhimsiPaw Journey', '', {
      items: [
        { date: 'MARCH 2025', title: 'The WhimsiPaw studio opens its doors', emoji: '🧵' },
        { date: 'OCTOBER 2025', title: '10,000+ happy pets dressed worldwide', emoji: '🐾' },
        { date: 'DECEMBER 2025', title: 'Cosplay commission waitlist opens', emoji: '✨' },
        { date: 'APRIL 2026', title: 'Featured in Paws & Style Magazine', emoji: '📰' },
        { date: 'JUNE 2026', title: '100% organic fabric line launches', emoji: '🌱' },
        { date: 'AUGUST 2026', title: '100k pet parents join the community', emoji: '🎉' },
      ],
    }],
    ['reviews', 'reviews', 'Loved by Pet Parents Worldwide', '', {
      items: [
        { stars: 5, quote: 'I\'ve ordered pet clothes from a dozen shops. This is the first sweater that actually fit my corgi\'s long body — and the knit is softer than mine.', name: 'Amy & Mochi', sub: 'Cloud Knit Sweater, Size M' },
        { stars: 5, quote: 'Commissioned a cosplay of my cat as a magical girl. They asked for measurements, sent progress photos, and the result made me cry. 10/10.', name: 'Ken & Yuki', sub: 'Custom Cosplay Commission' },
        { stars: 4, quote: 'The slow-feed bowl is beautiful enough to leave out, and mealtime finally lasts more than 30 seconds.', name: 'Sofia & Bean', sub: 'Blossom Slow-Feed Bowl' },
        { stars: 5, quote: 'You can feel the handwork in every stitch. The care card signed by the maker is such a lovely touch.', name: 'Daniel & Pudding', sub: 'Sunny Raincoat, Custom' },
      ],
    }],
    ['blog', 'blog', 'From the Craft Journal', '', {}],
    ['newsletter', 'newsletter', 'Subscribe & Get 10% Off Your First Custom Order!', '', {
      note: 'Join the WhimsiPaw newsletter for early access to limited drops, custom-commission slots and pet-parent stories.',
    }],
  ];
  let so = 0;
  for (const [key, type, title, subtitle, data] of sections) {
    q.run("INSERT OR IGNORE INTO home_sections (section_key, type, title, subtitle, data, sort_order) VALUES (?,?,?,?,?,?)",
      [key, type, title, subtitle, JSON.stringify(data), so++]);
  }

  console.log('[seed] 示例数据已写入');
};
