import { useState, useEffect, useRef } from "react";
import { appStorage, appAuth, isSupabaseConfigured } from "./src/storage.js";

const allBrands = [
  { id: 1, name: "Alice + Olivia", notes: "Contemporary luxury, strong construction, elevated fabrics" },
  { id: 2, name: "For Love & Lemons", notes: "Intricate lace/details, romantic & feminine, high craftsmanship" },
  { id: 3, name: "Anthropologie", notes: "Curated quality, bohemian chic, beloved by repeat customers" },
  { id: 4, name: "Grace Loves Lace", notes: "Bridal-grade quality, lace specialist, premium materials" },
  { id: 5, name: "Show Me Your MuMu", notes: "Fun & flirty, good quality for the price, reliable sizing" },
  { id: 6, name: "Free People", notes: "Boho staple, quality varies by line, WTF line is great" },
  { id: 7, name: "House of CB", notes: "Signature corsets, high-quality materials, luxury feel" },
  { id: 8, name: "Miss Circle", notes: "Worn by Lady Gaga/Cardi B, elevated occasion wear, solid construction" },
  { id: 9, name: "Bardot", notes: "Australian brand, consistent quality, good occasion wear" },
  { id: 10, name: "I Am Gia", notes: "Edgy aesthetic, decent quality, popular with influencers" },
  { id: 11, name: "Sabo Skirt", notes: "Trend-forward, decent mid-range quality" },
  { id: 12, name: "Princess Polly", notes: "On-trend, reliable quality for price point, good CS" },
  { id: 13, name: "Zara", notes: "Hit or miss quality, great design but fast fashion fabrics" },
  { id: 14, name: "Intermissy", notes: "Mid-tier occasion wear, limited public data" },
  { id: 15, name: "Commence", notes: "Smaller brand, limited reviews" },
  { id: 16, name: "AffRM", notes: "Smaller brand, limited public data" },
  { id: 17, name: "Super Down", notes: "Affordable, trend-driven, inconsistent quality" },
  { id: 18, name: "Baby Boo", notes: "Budget-friendly, inconsistent sizing and quality" },
  { id: 19, name: "Edikted", notes: "Very trendy, thin fabrics, fast fashion tier" },
  { id: 20, name: "Mishka", notes: "Budget fast fashion, low quality reports" },
  { id: 21, name: "Nasty Gal", notes: "Declined significantly post-Boohoo acquisition" },
  { id: 22, name: "FashionNova", notes: "Poor fabric quality, sizing issues, but cheap" },
  { id: 23, name: "Pretty Little Things", notes: "1.6 stars, scam complaints, terrible CS — avoid" },
  { id: 24, name: "Michael Costello", notes: "Couture-influenced, celeb red carpet presence, strong construction" },
  { id: 25, name: "WeWoreWhat", notes: "Danielle Bernstein's brand, decent quality, good fits, some inconsistency" },
  { id: 26, name: "Steve Madden", notes: "Better known for shoes, apparel is trend-driven and decent but unremarkable" },
  { id: 27, name: "Altar'd State", notes: "Solid boho-feminine quality, good fabrics for mid-range, consistent CS" },
  { id: 28, name: "Akira", notes: "Trendy Chicago retailer, good selection but quality varies by piece" },
  { id: 29, name: "SKIMS", notes: "Kim K's brand — premium shapewear and loungewear, excellent construction and sizing" },
  { id: 30, name: "Missguided", notes: "Bankrupt 2022, relaunched under Boohoo as dropshipped fast fashion — avoid" },
  { id: 31, name: "Bebe", notes: "Post-2017 relaunch is online-only, thin fabrics, nostalgic but unremarkable quality" },
  { id: 32, name: "NBD", notes: "Nordstrom-carried, good occasion wear, solid construction and flattering silhouettes" },
  { id: 33, name: "Windsor", notes: "Affordable formalwear, popular for events/prom, thin fabrics and inconsistent quality" },
  { id: 34, name: "Do+Be", notes: "LA-based trendy basics and sets, decent quality, popular on social but mid-tier" },
  { id: 35, name: "Le Lis", notes: "Brazilian luxury brand, beautiful fabrics, elegant construction, justified price point" },
  { id: 36, name: "Selfie Leslie", notes: "Australian-born LA brand, trendy occasion dresses, decent quality but not built to last" },
  { id: 37, name: "Nightway Collections", notes: "Affordable formalwear, decent construction for price, good for one-time event wear" },
  { id: 38, name: "Peppermayo", notes: "Australian brand, trendy and affordable, fun prints but fast fashion quality" },
  { id: 39, name: "Line & Dot", notes: "LA-based contemporary, sold at Nordstrom, clean elevated basics, punches above price point" },
  { id: 40, name: "Lovers + Friends", notes: "LA-based, carried at Revolve and Nordstrom, flattering silhouettes, solid occasion wear" },
  { id: 41, name: "Naked Wardrobe", notes: "LA-based bodycon basics and sets, decent quality but very trend-driven and mid-tier" },
  { id: 42, name: "More To Come", notes: "Nordstrom house brand, affordable trend-driven basics, fast fashion quality level" },
  { id: 43, name: "Camila Coelho", notes: "Brazilian influencer-turned-designer, carried at Revolve, feminine and elevated, good construction" },
  { id: 44, name: "Edit by Nine", notes: "Australian contemporary, clean polished silhouettes, good fabric quality for the price" },
  { id: 45, name: "White Fox", notes: "Australian, popular on social, trendy but inconsistent quality and thin fabrics" },
  { id: 46, name: "Heiress Beverly Hills", notes: "2-star reviews, orders not arriving, poor quality, no refunds, fake reviews — avoid" },
  { id: 47, name: "Untamed Petals", notes: "Women-owned bridal brand, carried at Nordstrom, beautiful fabrics, excellent CS and construction" },
  { id: 48, name: "June Bridals", notes: "Chinese knockoff site, 1.3-star rating, dresses nothing like photos, avoid" },
  { id: 49, name: "Monique Lhuillier", notes: "Prestige luxury bridal and occasion wear, impeccable craftsmanship, worn by A-list celebrities" },
  { id: 50, name: "Lulus", notes: "Popular online brand, great for affordable occasion wear, thin fabrics, not built to last" },
  { id: 51, name: "Bariano", notes: "Australian occasion wear, quality craftsmanship and bespoke fabrics, but poor CS and return policy" },
  { id: 52, name: "12th Tribe", notes: "LA-based boho brand, great festival and vacation wear, good quality for the price" },
  { id: 53, name: "Club L London", notes: "UK occasion wear, good construction and flattering silhouettes, above fast fashion tier" },
  { id: 54, name: "Tularosa", notes: "LA-based boho-contemporary, carried at Revolve and Nordstrom, great fabrics and flattering silhouettes" },
  { id: 55, name: "Quince", notes: "Direct-to-consumer, cashmere and silk at fraction of typical prices, quality punches well above cost" },
  { id: 56, name: "Meshki", notes: "Australian occasion and going-out brand, trendy but inconsistent quality, thin fabrics" },
  { id: 57, name: "L'atiste", notes: "LA-based, embellished and appliqué pieces, popular for occasions but beading can feel cheap in person" },
  { id: 58, name: "Enez Swim", notes: "Miami-based swimwear, trendy and supportive, soft fully-lined materials, praised for quality" },
  { id: 59, name: "Hello Molly", notes: "Australian occasion and going-out brand, cute styles but thin fabrics and inconsistent sizing" },
  { id: 60, name: "Vici", notes: "Popular online boutique, trendy and affordable, thin fabrics and inconsistent quality" },
  { id: 61, name: "Silvia Rufino", notes: "Special occasion and evening wear, polyester/spandex blends, frequently on deep discount" },
  { id: 62, name: "Gianni Bruno", notes: "Elevated occasion and evening wear, beautiful embellishments, luxurious fabrics and well-executed detailing" },
  { id: 63, name: "Gianni Bini", notes: "Dillard's private label, quality materials and good construction, reliable mid-range occasion wear" },
  { id: 64, name: "Essue", notes: "LA Fashion District brand, trendy and affordable, decent quality but firmly fast fashion tier" },
  { id: 65, name: "A'GACI", notes: "Budget fast fashion, closed stores in 2019, relaunched online only, thin fabrics and poor construction" },
  { id: 66, name: "Show Po", notes: "Australian brand, affordable and trendy, fast fashion quality, good for a fun purchase" },
  { id: 67, name: "Tiger Mist", notes: "Australian brand, hit or miss quality, terrible CS and store credit-only returns, delivery issues" },
  { id: 68, name: "Topshop", notes: "Collapsed 2021, now ASOS-owned online only — shadow of former self, decent but hollow quality" },
  { id: 69, name: "Tempt Me", notes: "Budget Amazon/Walmart swimwear, flattering for the price but thin materials and mass retail quality" },
  { id: 70, name: "LPA", notes: "LA-based, carried at Revolve, designed by Pia Arrobio, elevated fabrics and sophisticated construction" },
  { id: 71, name: "Hurley", notes: "Surf/action sports brand, watered down since Nike sold in 2020, mass market quality" },
  { id: 72, name: "Relleciga", notes: "Amazon/Walmart budget swimwear, flattering cuts and tummy control but thin fabrics that can discolor" },
  { id: 73, name: "Bar III", notes: "Macy's private label, trendy affordable workwear and occasion pieces, decent but unremarkable quality" },
  { id: 74, name: "White House Black Market", notes: "Chico's-owned, polished workwear and occasion pieces, solid fabrics and flattering fits" },
  { id: 75, name: "Eberjey", notes: "Cult loungewear and sleepwear, legendary Gisele pajamas, incredibly soft modal fabrics, repurchased for years" },
  { id: 76, name: "Jonathan Simkhai", notes: "CFDA-Vogue Fashion Fund winner, carried at Net-a-Porter, innovative fabrics and impeccable tailoring" },
  { id: 77, name: "Calvin Klein", notes: "Iconic American brand, excellent basics and denim, RTW inconsistent post-Raf Simons departure" },
  { id: 78, name: "Vince Camuto", notes: "Better known for footwear, apparel is solid — flattering silhouettes and good occasion/workwear pieces" },
  { id: 79, name: "Upbra", notes: "Made in USA, patented ActiveLift technology, impeccable quality, premium price fully justified" },
  { id: 80, name: "Sans Souci", notes: "LA Fashion District wholesaler since 1988, trendy junior/contemporary, boutique and Amazon distributed" },
  { id: 81, name: "Suboo", notes: "Bondi-founded resort wear and swimwear, French and Italian jacquard fabrics, carried at Anthropologie" },
  { id: 82, name: "Wayf", notes: "Seattle-based, carried at Nordstrom, flattering silhouettes and good quality, great for bridesmaid styles" },
  { id: 83, name: "Milly", notes: "NYC contemporary luxury, carried at Neiman Marcus and Saks, vibrant prints and impeccable tailoring" },
  { id: 84, name: "Angel Biba", notes: "Australian brand, bold and dramatic statement pieces, fun but fast fashion quality tier" },
  { id: 85, name: "Nookie", notes: "Australian brand, impeccable craftsmanship and sleek silhouettes, mixed CS reviews but solid product" },
  { id: 86, name: "Miss Holly", notes: "Australian brand, high quality for the price, excellent CS, popular for formal and bridesmaid dresses" },
  { id: 87, name: "Michael Lauren", notes: "LA-made, micro modal and tencel fabrics, elevated soft basics and loungewear, some sizing inconsistency" },
  { id: 88, name: "L*Space", notes: "California-based premium swimwear, carried at Nordstrom and Revolve, beautiful prints and excellent construction" },
  { id: 89, name: "A New Day", notes: "Target's in-house brand, decent quality for mass market, good basics and consistent sizing" },
  { id: 90, name: "Sioni", notes: "Family-run brand, carried at Nordstrom and Macy's, vivid prints and quality construction, great workwear" },
  { id: 91, name: "Soly Hux", notes: "Chinese fast fashion via Amazon, ultra-affordable but thin fabrics and poor construction" },
  { id: 92, name: "Mable", notes: "LA Fashion District wholesale brand, boutique-distributed, decent quality but firmly mid-tier" },
  { id: 93, name: "Skylar Rose", notes: "Contemporary wholesale brand since 2008, carried at Nordstrom Rack and ASOS, trendy and affordable" },
  { id: 94, name: "C/MEO Collective", notes: "Australian contemporary, carried at Revolve and ASOS, structured silhouettes and quality fabrication" },
  { id: 95, name: "Nicholas", notes: "Australian luxury contemporary, carried at Net-a-Porter and Saks, exceptional craftsmanship and elevated fabrics" },
  { id: 96, name: "Peixoto", notes: "Colombian-made premium swimwear, worn by Kardashians and Gal Gadot, carried at Bloomingdale's and Saks" },
  { id: 97, name: "SNDYS", notes: "Sydney-based, carried at Revolve, some great pieces but poor CS and return policies bring it down" },
  { id: 98, name: "RYSE The Label", notes: "Small Australian contemporary brand, decent occasion pieces but limited retail presence and review data" },
  { id: 99, name: "H:OURS", notes: "LA nightlife-inspired brand, metallic and sequin party dresses, great aesthetic but fast fashion quality" },
  { id: 100, name: "Haute Monde", notes: "Primarily sold at Walmart, budget mass market despite luxury-sounding name, faux suede and basics" },
  { id: 101, name: "Vera & Lucy", notes: "French wholesale brand, items found under $15 on resale sites, budget fast fashion level" },
  { id: 102, name: "Rebellious Fashion", notes: "UK budget fast fashion, trend-driven and affordable, recurring delivery issues and mass market quality" },
  { id: 103, name: "Reset by Jane", notes: "Boutique wholesale brand, delicate designs distributed through independent boutiques, mid-tier quality" },
  { id: 104, name: "Sunfere", notes: "Instagram-driven vacation dresses since 2022, some cute pieces but shipping nightmares and refund issues" },
  { id: 105, name: "Daniel Cremieux", notes: "Classic American heritage brand at Dillard's, quality dress shirts and polished workwear, reliable construction" },
  { id: 106, name: "Wear Your Love", notes: "Northern CA handmade bridal, organic cotton and sustainable fabrics, made-to-measure, glowing bride reviews" },
  { id: 107, name: "Bluxlabel Bridal", notes: "Minimalist satin-forward bridal, elevated packaging and aesthetic, limited reviews but quality looks solid" },
  { id: 108, name: "Choosy", notes: "AI-driven Instagram trend copier, sub-$100 fast fashion, website appears defunct — budget fast fashion" },
  { id: 109, name: "MUXXN", notes: "Amazon-distributed Chinese brand, vintage-inspired retro dresses, decent reviews for the price, mass market" },
  { id: 110, name: "After Six", notes: "Classic American bridal and bridesmaids brand, decades of history, good construction and flattering silhouettes" },
  { id: 111, name: "Mac Duggal", notes: "Premier American eveningwear, carried at Nordstrom and Saks, quality beading and flattering formal gowns" },
  { id: 112, name: "Missacci", notes: "Small online contemporary brand, trendy occasion dresses, decent quality but limited review data" },
  { id: 113, name: "Issue New York", notes: "Locally designed and made in NYC, cocktail and evening dresses, Made in USA quality edge" },
  { id: 114, name: "L'IDEE", notes: "Australian luxury label, signature pleated fabrications, carried at Nordstrom and Moda Operandi, cult following" },
  { id: 115, name: "Adika", notes: "Israeli brand, trendy and affordable, but inconsistent quality, thin fabrics, runs very small, mixed CS" },
  { id: 116, name: "JLUXLABEL", notes: "Size inclusive affordable luxury, 2500+ glowing reviews, quality holds up years later, excellent CS" },
  { id: 117, name: "Betabrand", notes: "SF-based, famous for Dress Pant Yoga Pants, comfortable polished workwear, loyal repeat customer base" },
  { id: 118, name: "Theory", notes: "Gold standard for work pants, impeccable suiting fabrics, elevated construction" },
  { id: 119, name: "L'AGENCE", notes: "Sleek and elevated, exceptional drape and construction, premium workwear" },
  { id: 120, name: "Lafayette 148 New York", notes: "Tailored luxury workwear, outstanding quality and craftsmanship" },
  { id: 121, name: "Veronica Beard", notes: "Polished and sophisticated, excellent construction, elevated contemporary" },
  { id: 122, name: "Eileen Fisher", notes: "Sustainable beautifully draped pieces, incredibly reliable, beloved repeat customers" },
  { id: 123, name: "Vince", notes: "Minimal and elevated, wonderful fabrics, effortless luxury basics" },
  { id: 124, name: "M.M.LaFleur", notes: "Designed specifically for working women, exceptional value and thoughtful construction" },
  { id: 125, name: "Reformation", notes: "Sustainable fabrics, flattering cuts, strong quality for the price" },
  { id: 126, name: "Wit & Wisdom", notes: "Nordstrom bestseller, consistent quality for the price, great for work basics" },
  { id: 127, name: "SPANX", notes: "The pull-on work pant queen, seriously comfortable, smoothing and polished" },
  { id: 128, name: "NYDJ", notes: "Reliable fit especially for curvy body types, good denim and trouser options" },
  { id: 129, name: "Madewell", notes: "Great everyday quality, good denim and basics, reliable sizing" },
  { id: 130, name: "Halogen", notes: "Nordstrom house brand, well-reviewed workwear basics, reliable sizing and quality" },
  { id: 131, name: "Tahari ASL", notes: "Fine for one season, decent occasionwear but not built to last" },
  { id: 132, name: "Karen Kane", notes: "Decent mid-range workwear, forgettable but reliable" },
  { id: 133, name: "Bishop + Young", notes: "LA-based, carried at Anthropologie, 4.6 stars, versatile day-to-night, good matching sets and flattering fits" },
  { id: 134, name: "Tommy Hilfiger", notes: "Classic American prep, iconic but quality declined significantly, thin fabrics and mass market construction" },
  { id: 135, name: "Urban Outfitters", notes: "Primarily a retailer, house label is fast fashion — trendy and affordable but thin fabrics and inconsistent sizing" },
  { id: 136, name: "Antonio Melani", notes: "Dillard's contemporary brand, solid quality suiting and occasion wear, good fabrics, always NWT on Poshmark" },
  { id: 137, name: "ASTR the Label", notes: "LA-based, carried at Nordstrom and Revolve, trendy occasion dresses, thin fabrics, good for one-time wear" },
  { id: 138, name: "Jason Wu", notes: "Dressed Michelle Obama at two inaugurations, carried at Neiman Marcus, impeccable construction and feminine elegance" },
  { id: 139, name: "Pinko", notes: "Italian contemporary, iconic Love bag, elevated RTW, good quality and fashion-forward, carried at Nordstrom and Saks" },
  { id: 140, name: "Ted Baker", notes: "British contemporary, polished workwear, note their own numeric sizing (0-4), runs small" },
  { id: 141, name: "BCBG Max Azria", notes: "French-American, elevated occasion and workwear, beautiful draping, tons of NWT pieces on Poshmark and TRR" },
  { id: 142, name: "Poleci", notes: "LA luxury since 1994, Harvey Nichols and global boutiques, Liv Tyler/Eva Longoria clientele, silk pieces stunning, up to 90% off on resale" },
  { id: 143, name: "Jagger & Stone", notes: "California cool rock 'n' roll glam, fun aesthetic but fast fashion quality, ASOS-distributed" },
  { id: 144, name: "Amour Vert", notes: "SF sustainable brand, made in California, organic and recycled fabrics, Parisian-meets-California chic, has own resale marketplace ReAmour" },
  { id: 145, name: "MISA Los Angeles", notes: "Handmade in LA with 50+ steps per garment, bohemian feminine prints, Emma Roberts and Olivia Palermo fans, pieces you keep for years" },
  { id: 146, name: "Dynamite", notes: "Canadian fast fashion, trendy and affordable, decent for going-out pieces but thin fabrics and inconsistent sizing" },
  { id: 147, name: "Cartonnier", notes: "Anthropologie's workwear sub-label, signature Charlie trousers, great blazers and jumpsuits, tons on Poshmark cheap" },
  { id: 148, name: "Saunders Collective", notes: "Rent the Runway design brand, elevated occasion dresses $310-468 retail, solid construction, great on Poshmark for $35-135" },
  { id: 149, name: "Christian Lacroix", notes: "Legendary French haute couture, theatrical maximalism, extraordinary craftsmanship, couture house closed 2009 but vintage pieces are treasures on TRR and Vestiaire" },
  { id: 150, name: "Cider", notes: "Chinese ultra-fast fashion, copies indie designers, fake reviews, nonexistent CS, sizing unreliable — avoid" },
  { id: 151, name: "Walter Baker", notes: "NYC contemporary, carried at Nordstrom and Bloomingdale's, elevated blazers and leather jackets, great Poshmark find" },
  { id: 152, name: "Pistola", notes: "LA premium denim brand, carried at Saks/Nordstrom/Revolve, Greta Gerwig wore their Barbie jumpsuit, great flattering fits" },
  { id: 153, name: "Nina Leonard", notes: "Sold at QVC and Dillard's, ponte knit dresses and separates that travel well, decent quality but mass market, great on ThredUp" },
  { id: 154, name: "Everlane", notes: "SF direct-to-consumer, radical transparency pricing, great cashmere and denim basics, ethical production, consistent quality" },
  { id: 155, name: "Velvet by Graham & Spencer", notes: "LA luxury basics, signature cotton-modal and silk blends, elevated tees and tanks that feel genuinely expensive, carried at Nordstrom and Saks" },
  { id: 156, name: "Lioness", notes: "Australian brand, trendy occasion and going-out dresses, popular on social but thin fabrics and inconsistent sizing" },
  { id: 157, name: "Alexia Admor", notes: "Family brand since 1989, three generations, occasion and workwear dresses, thicker fabric than photos suggest, great fit and feminine touches" },
  { id: 158, name: "Wilfred", notes: "Aritzia's elevated sub-label, minimalist flowy blouses and wide leg trousers, good construction, tons of NWT on Poshmark" },
  { id: 159, name: "Favorite Daughter", notes: "Founded by Erin and Sara Foster 2020, viral Favorite Pant, exceptional fabrics, great for tall women, petite/tall/maternity sizing" },
  { id: 160, name: "Wild Fang", notes: "Portland gender-neutral brand, utility jumpsuits and tomboy-chic aesthetic, decent quality, great androgynous workwear looks" },
  { id: 161, name: "T.W.I.N.", notes: "Twin-owned NYC brand, size/gender/ability inclusive, deadstock fabrics, transparent pricing, great suiting and sets, Mott Street storefront" },
  { id: 162, name: "Dress the Population", notes: "LA luxury occasionwear, carried at Nordstrom and Neiman Marcus, sequin dresses and gowns, 4.3 stars, great Poshmark find" },
  { id: 163, name: "Sezane", notes: "First French brand born online 2013, effortless Parisian aesthetic, extraordinary knitwear, sustainable limited drops, cult following worldwide" },
  { id: 164, name: "Aritzia", notes: "Canadian contemporary powerhouse, consistent construction and great fabrics across all sub-labels, beloved by repeat customers" },
  { id: 165, name: "Babaton", notes: "Aritzia's most elevated sub-label, sophisticated minimalist suiting and blazers, Contour blazer and Studio trousers are standouts" },
  { id: 166, name: "Amadi", notes: "LA-made since 2012, carried at Anthropologie, rich fabrics with easy care finishes, effortless California-cool, great on Poshmark $11-35" },
  { id: 167, name: "Eva Longoria Collection", notes: "Celebrity brand, accessible contemporary, decent quality but mid-tier, wearable but not built to last" },
  { id: 168, name: "J. Peterman", notes: "Iconic literary-style catalog brand, natural fabrics and timeless silhouettes, solid quality, deeply underpriced on Poshmark" },
  { id: 169, name: "Daniel Rainn", notes: "LA boho-chic brand since 2008, soft modal and chiffon, romantic ruffles and prints, DR2 sub-label great for office, 8000+ resale listings" },
  { id: 170, name: "CAbi", notes: "Carol Anderson By Invitation, sold through stylists since 2002, excellent quality and fit, timeless pieces kept for years — size down, runs large" },
  { id: 171, name: "Zac & Rachel", notes: "Affordable contemporary at Macy's, decent ponte knit pieces, reliable and consistent but nothing elevated" },
  { id: 172, name: "IZOD", notes: "Classic American sportswear, reliable mass market, quality declined after multiple ownership changes" },
  { id: 173, name: "Rebecca Taylor", notes: "NYC brand since 1996, exceptional silk quality, worn by Cameron Diaz and Reese Witherspoon, holds resale value well" },
  { id: 174, name: "Diane von Furstenberg", notes: "Iconic wrap dress inventor, extraordinary quality, flattering on every body type, pieces last decades" },
  { id: 175, name: "French Connection", notes: "British contemporary, famous FCUK marketing, quality declined over the years, decent for trend pieces" },
  { id: 176, name: "Jaded London", notes: "UK festival and going-out brand, bold maximalist sequins and co-ords, fast fashion quality, built for one night out" },
  { id: 177, name: "Maison d'Amelie", notes: "French-inspired, designed in NYC with European materials, genuinely premium fabric, flattering cuts, up to 90% off on ThredUp" },
  { id: 178, name: "Cleobella", notes: "California ethical boho brand, handmade by decade-long artisan partners in SE Asia, GOTS organic cotton, thick and well-made, runs true to size" },
  { id: 179, name: "Stitches & Stripes", notes: "Contemporary knitwear brand at Revolve, colorblock sweaters and striped knits, 100% cotton, $68-128 retail but $13-50 on Poshmark" },
  { id: 180, name: "Dorothee Schumacher", notes: "German luxury since 1989, sold in 46 countries, exquisite knitwear and quiet luxury RTW, clients keep pieces for decades, great on TRR" },
  { id: 181, name: "Geraldine Lustgarten", notes: "Colombian-born designer, luxury workwear with NYC minimalism, 100% silk pieces with exquisite draping, rising designer to invest in now" },
  { id: 182, name: "Patrizia Pepe", notes: "Florentine affordable luxury since 1993, clean lines and structural shapes, above Zara but below traditional designers, good on Poshmark" },
  { id: 183, name: "BTFBM", notes: "Chinese Amazon fast fashion, ultra-affordable but thin fabrics, inconsistent sizing and poor construction" },
  { id: 184, name: "Isabel Garcia", notes: "Bologna-based Italian brand since 2009, London Fashion Week Gold Label, luxurious fabrics and haute-couture embroidery, great on YOOX and Farfetch" },
  { id: 185, name: "Cinq a Sept", notes: "NYC contemporary luxury by Jane Siskin, feminine suiting and sets, carried at Nordstrom/Saks/Neiman Marcus, transitions effortlessly from work to evening" },
  { id: 186, name: "Endless Rose", notes: "Carried at Bloomingdale's and Revolve, trendy occasion dresses and sets, inconsistent sizing, good for wedding guest wear" },
  { id: 187, name: "Slate & Willow", notes: "Originally RTR exclusive, decent ponte and crepe fabrics, reliable workwear and occasion pieces, great on ThredUp for $10-30" },
  { id: 188, name: "Trina Turk", notes: "Palm Springs-inspired California luxury, bold prints and vibrant colors, solid construction, great for creative professionals" },
  { id: 189, name: "Boston Proper", notes: "Direct-to-consumer, bold and figure-flattering resort and going-out styles, decent quality but mid-tier, frequently on major sale" },
  { id: 190, name: "United Colors of Benetton", notes: "Italian mass market, once innovative colorful knitwear, quality declined significantly, thin fabrics now" },
  { id: 191, name: "Maniere De Voir", notes: "UK brand, edgy structured designs, rayon and cotton fabrics, decent quality but strict 30-day returns — size up 2 from US size" },
  { id: 192, name: "Nanette Lepore", notes: "NYC contemporary designer since 1987, vibrant feminine boho aesthetic, intricate details and bold prints, well-made, runs small — size up" },
  { id: 193, name: "Likely", notes: "Carried at Revolve and Bloomingdale's, trendy occasion and event dresses, decent quality but fast fashion level fabrics" },
  { id: 194, name: "DKNY", notes: "Donna Karan diffusion line, quality declined post-2016 G-III acquisition, mass market now — older pre-2016 pieces on Poshmark are better" },
  { id: 195, name: "Fendi", notes: "Roman luxury powerhouse since 1925, 54 years with Karl Lagerfeld, extraordinary RTW suiting and blazers, iconic FF monogram, true investment pieces" },
  { id: 196, name: "Coldwater Creek", notes: "Casual inclusive women's clothing, size-inclusive XS-3X, decent quality but CS and shipping issues since ownership changes" },
  { id: 197, name: "Opening Ceremony", notes: "Founded 2002 by Humberto Leon and Carol Lim, streetwear meets high fashion, premium fabrics and bold cultural collaborations" },
  { id: 198, name: "Red Carter", notes: "Miami swimwear brand since 2003, Oscar de la Renta trained designer, worn by Beyonce and Kardashians, bold prints and flattering cuts" },
  { id: 199, name: "Joie", notes: "LA accessible luxury, cashmere and silk blouses, feminine vintage-meets-modern, 4.5 stars, loyal customers keep pieces for years" },
  { id: 200, name: "St. John", notes: "American knit suiting royalty since 1962, signature Santana knit never wrinkles, Marilyn Monroe to Nancy Reagan, $800-2000 retail/$30-80 Poshmark" },
  { id: 201, name: "Etcetera", notes: "By-appointment luxury, sister to Carlisle, exquisitely tailored knits and suiting, customers keep pieces 10+ years, up to 90% off on TRR" },
];

const initialRanked = [
  { id: 119, tier: "S" }, { id: 1, tier: "S" }, { id: 149, tier: "S" }, { id: 195, tier: "S" },
  { id: 2, tier: "S" }, { id: 4, tier: "S" }, { id: 76, tier: "S" }, { id: 49, tier: "S" }, { id: 118, tier: "S" },
  { id: 88, tier: "A" }, { id: 120, tier: "A" }, { id: 3, tier: "A" }, { id: 165, tier: "A" }, { id: 185, tier: "A" },
  { id: 174, tier: "A" }, { id: 180, tier: "A" }, { id: 35, tier: "A" }, { id: 75, tier: "A" }, { id: 201, tier: "A" },
  { id: 122, tier: "A" }, { id: 181, tier: "A" }, { id: 7, tier: "A" }, { id: 114, tier: "A" }, { id: 138, tier: "A" },
  { id: 199, tier: "A" }, { id: 124, tier: "A" }, { id: 24, tier: "A" }, { id: 83, tier: "A" }, { id: 145, tier: "A" },
  { id: 8, tier: "A" }, { id: 95, tier: "A" }, { id: 197, tier: "A" }, { id: 70, tier: "A" }, { id: 96, tier: "A" },
  { id: 142, tier: "A" }, { id: 173, tier: "A" }, { id: 125, tier: "A" }, { id: 163, tier: "A" }, { id: 5, tier: "A" },
  { id: 29, tier: "A" }, { id: 200, tier: "A" }, { id: 81, tier: "A" }, { id: 47, tier: "A" }, { id: 79, tier: "A" },
  { id: 121, tier: "A" }, { id: 123, tier: "A" }, { id: 106, tier: "A" },
  { id: 52, tier: "B" }, { id: 110, tier: "B" }, { id: 157, tier: "B" }, { id: 27, tier: "B" }, { id: 166, tier: "B" },
  { id: 144, tier: "B" }, { id: 136, tier: "B" }, { id: 164, tier: "B" }, { id: 9, tier: "B" }, { id: 51, tier: "B" },
  { id: 141, tier: "B" }, { id: 117, tier: "B" }, { id: 133, tier: "B" }, { id: 107, tier: "B" }, { id: 94, tier: "B" },
  { id: 170, tier: "B" }, { id: 77, tier: "B" }, { id: 43, tier: "B" }, { id: 147, tier: "B" }, { id: 178, tier: "B" },
  { id: 53, tier: "B" }, { id: 105, tier: "B" }, { id: 169, tier: "B" }, { id: 162, tier: "B" }, { id: 44, tier: "B" },
  { id: 58, tier: "B" }, { id: 154, tier: "B" }, { id: 159, tier: "B" }, { id: 6, tier: "B" }, { id: 63, tier: "B" },
  { id: 62, tier: "B" }, { id: 130, tier: "B" }, { id: 10, tier: "B" }, { id: 39, tier: "B" }, { id: 184, tier: "B" },
  { id: 113, tier: "B" }, { id: 168, tier: "B" }, { id: 116, tier: "B" }, { id: 111, tier: "B" }, { id: 129, tier: "B" },
  { id: 177, tier: "B" }, { id: 87, tier: "B" }, { id: 86, tier: "B" }, { id: 192, tier: "B" }, { id: 32, tier: "B" },
  { id: 85, tier: "B" }, { id: 128, tier: "B" }, { id: 40, tier: "B" }, { id: 182, tier: "B" }, { id: 139, tier: "B" },
  { id: 152, tier: "B" }, { id: 55, tier: "B" }, { id: 198, tier: "B" }, { id: 148, tier: "B" }, { id: 90, tier: "B" },
  { id: 127, tier: "B" }, { id: 179, tier: "B" }, { id: 161, tier: "B" }, { id: 140, tier: "B" }, { id: 188, tier: "B" },
  { id: 54, tier: "B" }, { id: 155, tier: "B" }, { id: 78, tier: "B" }, { id: 151, tier: "B" }, { id: 82, tier: "B" },
  { id: 25, tier: "B" }, { id: 74, tier: "B" }, { id: 158, tier: "B" }, { id: 126, tier: "B" },
  { id: 89, tier: "C" }, { id: 16, tier: "C" }, { id: 28, tier: "C" }, { id: 84, tier: "C" }, { id: 137, tier: "C" },
  { id: 57, tier: "C" }, { id: 73, tier: "C" }, { id: 31, tier: "C" }, { id: 189, tier: "C" }, { id: 196, tier: "C" },
  { id: 15, tier: "C" }, { id: 194, tier: "C" }, { id: 34, tier: "C" }, { id: 146, tier: "C" }, { id: 186, tier: "C" },
  { id: 64, tier: "C" }, { id: 167, tier: "C" }, { id: 175, tier: "C" }, { id: 99, tier: "C" }, { id: 59, tier: "C" },
  { id: 71, tier: "C" }, { id: 193, tier: "C" }, { id: 14, tier: "C" }, { id: 156, tier: "C" }, { id: 172, tier: "C" },
  { id: 143, tier: "C" }, { id: 132, tier: "C" }, { id: 92, tier: "C" }, { id: 191, tier: "C" }, { id: 56, tier: "C" },
  { id: 112, tier: "C" }, { id: 42, tier: "C" }, { id: 109, tier: "C" }, { id: 41, tier: "C" }, { id: 37, tier: "C" },
  { id: 153, tier: "C" }, { id: 38, tier: "C" }, { id: 12, tier: "C" }, { id: 103, tier: "C" }, { id: 98, tier: "C" },
  { id: 11, tier: "C" }, { id: 80, tier: "C" }, { id: 36, tier: "C" }, { id: 66, tier: "C" }, { id: 61, tier: "C" },
  { id: 93, tier: "C" }, { id: 187, tier: "C" }, { id: 97, tier: "C" }, { id: 26, tier: "C" }, { id: 134, tier: "C" },
  { id: 68, tier: "C" }, { id: 50, tier: "C" }, { id: 190, tier: "C" }, { id: 60, tier: "C" }, { id: 45, tier: "C" },
  { id: 160, tier: "C" }, { id: 33, tier: "C" }, { id: 171, tier: "C" }, { id: 13, tier: "C" },
  { id: 65, tier: "D" }, { id: 115, tier: "D" }, { id: 18, tier: "D" }, { id: 183, tier: "D" }, { id: 108, tier: "D" },
  { id: 19, tier: "D" }, { id: 100, tier: "D" }, { id: 176, tier: "D" }, { id: 20, tier: "D" }, { id: 102, tier: "D" },
  { id: 72, tier: "D" }, { id: 91, tier: "D" }, { id: 104, tier: "D" }, { id: 17, tier: "D" }, { id: 69, tier: "D" },
  { id: 67, tier: "D" }, { id: 135, tier: "D" }, { id: 101, tier: "D" },
  { id: 150, tier: "F" }, { id: 22, tier: "F" }, { id: 46, tier: "F" }, { id: 48, tier: "F" }, { id: 30, tier: "F" },
  { id: 21, tier: "F" }, { id: 23, tier: "F" },
];

const categoryOverrides = {
  "Steve Madden": ["Clothing", "Shoes"],
  "Vince Camuto": ["Clothing", "Shoes"],
  "Gianni Bini": ["Clothing", "Shoes"],
  "Fendi": ["Clothing", "Handbags", "Accessories"],
  "Pinko": ["Clothing", "Handbags", "Accessories"],
  "Calvin Klein": ["Clothing", "Accessories"],
  "Ted Baker": ["Clothing", "Accessories"],
  "Red Carter": ["Clothing", "Accessories"],
};

const categorizedBrands = allBrands.map((brand) => ({
  ...brand,
  categories: categoryOverrides[brand.name] || ["Clothing"],
}));

const TIER_CONFIG = [
  { label: "S", color: "#967342", bg: "#eee5d6", desc: "Elite" },
  { label: "A", color: "#71806c", bg: "#e7ede6", desc: "Great" },
  { label: "B", color: "#718092", bg: "#e8edf1", desc: "Solid" },
  { label: "C", color: "#967d8b", bg: "#eee7eb", desc: "Decent" },
  { label: "D", color: "#a27e64", bg: "#f0e8e0", desc: "Meh" },
  { label: "F", color: "#996c6c", bg: "#f0e5e3", desc: "Skip" },
];

// A new account starts empty. This used to hold one person's real name and
// measurements, which meant every new signup inherited them — and it masked a
// broken load, because the unfetched initial state looked like real data.
const EMPTY_PROFILE = { name: "", measurements: {} };

function Medal({ rank }) {
  if (rank === 1) return <span style={{ fontSize: "12px" }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: "12px" }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: "12px" }}>🥉</span>;
  return <span style={{ fontSize: "11px", color: "#81776b", fontFamily: "monospace", width: "18px", display: "inline-block", textAlign: "center" }}>{rank}</span>;
}

// ---- AI helper ----
async function askClaude(prompt, useWebSearch) {
  const body = {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  };
  if (useWebSearch) {
    // Each search folds its results into the prompt. Left unbounded this
    // reached ~92K input tokens on a single brand, and enough searches pushed
    // past Haiku's 200K context window, which the API rejects with a 400
    // ("prompt is too long"). Three searches is plenty for these lookups and
    // keeps every call an order of magnitude under the ceiling.
    body.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }];
  }
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`The AI request failed (HTTP ${res.status}).`);
  }
  if (!res.ok) {
    throw new Error(data.error?.message || data.error || `The AI request failed (HTTP ${res.status}).`);
  }
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

// ---- Fuzzy brand matching ----
// Search should still find a brand when it is typed from memory and misspelled,
// so compare against the catalog by edit distance rather than substring only.
const normalizeBrandName = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

function editDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

function brandSimilarity(query, name) {
  const a = normalizeBrandName(query);
  const b = normalizeBrandName(name);
  if (!a || !b) return 0;
  if (a === b) return 1;
  // A typed prefix of a longer brand name is a strong signal on its own.
  if (b.startsWith(a) && a.length >= 3) return 0.95;
  if (b.includes(a) && a.length >= 4) return 0.9;
  return 1 - editDistance(a, b) / Math.max(a.length, b.length);
}

// Returns catalog brands close enough to the search text to be worth offering
// as "did you mean", best match first.
function findSimilarBrands(query, brands, limit = 3) {
  const normalized = normalizeBrandName(query);
  if (normalized.length < 3) return [];
  return brands
    .map((brand) => ({ brand, score: brandSimilarity(query, brand.name) }))
    .filter(({ score, brand }) => {
      if (normalizeBrandName(brand.name) === normalized) return false; // exact match is handled elsewhere
      const distance = editDistance(normalized, normalizeBrandName(brand.name));
      return score >= 0.7 || distance <= (normalized.length <= 5 ? 1 : 2);
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ brand }) => brand);
}

// Researches a genuinely new brand so it starts at a sensible tier instead of
// defaulting to F.
async function researchBrandTier(brandName) {
  const prompt = `You are helping rank clothing brands by quality for a personal fashion tracker. Research the brand "${brandName}" and place it on this tier scale:
S = Elite (luxury/designer, exceptional craftsmanship)
A = Great (contemporary premium, strong construction and fabrics)
B = Solid (reliable mid-range, good for the price)
C = Decent (trend-driven, mixed quality, fast fashion adjacent)
D = Meh (thin fabrics, poor construction, low reviews)
F = Skip (scam complaints, terrible CS, avoid)

Search if needed. You MUST answer with the JSON object and nothing else — never ask a clarifying question and never reply in prose. If the brand is obscure and you cannot find much, make your best judgement from what you can find and say so in "reasoning".

Respond with ONLY raw JSON, no markdown fences, no other text, in exactly this shape:
{"tier":"B","reasoning":"1-2 sentences explaining the tier","notes":"one short catalog-style description of the brand","categories":["Clothing"]}
"categories" must be a non-empty subset of ["Clothing","Shoes","Handbags","Accessories"].`;
  const parsed = extractJSON(await askClaude(prompt, true));
  const allowed = ["Clothing", "Shoes", "Handbags", "Accessories"];
  const categories = (Array.isArray(parsed.categories) ? parsed.categories : []).filter((c) => allowed.includes(c));
  return {
    tier: TIER_CONFIG.some((t) => t.label === parsed.tier) ? parsed.tier : "C",
    reasoning: parsed.reasoning || "",
    notes: parsed.notes || "",
    categories: categories.length ? categories : ["Clothing"],
  };
}

function extractJSON(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in response");
  return JSON.parse(match[0]);
}

function sanitizeListingText(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = String(text || "");
  return textarea.value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim()
    .slice(0, 12000);
}

const btnStyle = (active) => ({
  padding: "9px 18px",
  borderRadius: "0",
  border: "1px solid " + (active ? "#967342" : "#cfc6ba"),
  background: active ? "#211d17" : "#fffdfa",
  color: active ? "#f7f3ed" : "#514b43",
  cursor: "pointer",
  fontSize: "12px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
});

const modalBtnStyle = {
  padding: "6px 11px",
  borderRadius: "0",
  border: "1px solid #cfc6ba",
  background: "#fffdfa",
  color: "#514b43",
  cursor: "pointer",
  fontSize: "10px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const iconBtnStyle = {
  width: "25px",
  height: "25px",
  padding: 0,
  borderRadius: "50%",
  border: "1px solid #cfc6ba",
  background: "transparent",
  color: "#967342",
  cursor: "pointer",
  fontSize: "15px",
  lineHeight: 1,
};

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "#fffdfa",
  border: "1px solid #cfc6ba",
  borderRadius: "0",
  color: "#211d17",
  padding: "13px 14px",
  fontSize: "13px",
  outline: "none",
  fontFamily: "inherit",
};

export default function FashionRankings() {
  const [brands, setBrands] = useState([]);
  const [ranked, setRanked] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("tier");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newBrandCategories, setNewBrandCategories] = useState(["Clothing"]);
  const [newestId, setNewestId] = useState(201);
  const dragItem = useRef(null);
  const dragSource = useRef(null);
  const nextId = useRef(202);

  // Brand detail modal state
  const [modalBrandId, setModalBrandId] = useState(null);
  const [sizeCharts, setSizeCharts] = useState([]);
  const [sizeChartIndex, setSizeChartIndex] = useState(0);
  const [sizeChartLoading, setSizeChartLoading] = useState(false);
  const [sizeChartError, setSizeChartError] = useState(null);

  const [fitInput, setFitInput] = useState("");
  const [poshmarkUrl, setPoshmarkUrl] = useState("");
  const [poshmarkLoading, setPoshmarkLoading] = useState(false);
  const [poshmarkError, setPoshmarkError] = useState(null);
  const [fitLoading, setFitLoading] = useState(false);
  const [fitResult, setFitResult] = useState(null);
  const [fitError, setFitError] = useState(null);

  const [priceGuide, setPriceGuide] = useState(null); // { retailLow, retailHigh, resaleLow, resaleHigh, goodBuyUnder, notes, fetchedAt }
  const [priceGuideLoading, setPriceGuideLoading] = useState(false);
  const [priceGuideError, setPriceGuideError] = useState(null);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [profileText, setProfileText] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileView, setProfileView] = useState(false);
  const [savedFits, setSavedFits] = useState([]);
  const [closetView, setClosetView] = useState(false);
  const [closetMode, setClosetMode] = useState("brand");
  const [closetSearch, setClosetSearch] = useState("");
  const [selectedFit, setSelectedFit] = useState(null);
  const [saveFitOpen, setSaveFitOpen] = useState(false);
  const [saveFitLabel, setSaveFitLabel] = useState("");
  const [saveFitPhoto, setSaveFitPhoto] = useState(null);
  const [saveFitPhotoPreview, setSaveFitPhotoPreview] = useState(null);
  const [saveFitLoading, setSaveFitLoading] = useState(false);
  const [saveFitError, setSaveFitError] = useState(null);
  const [saveFitConfirmed, setSaveFitConfirmed] = useState(false);

  // Auth + onboarding
  const [session, setSession] = useState(undefined); // undefined = still checking
  const [authEmail, setAuthEmail] = useState("");
  const [authSending, setAuthSending] = useState(false);
  const [authSent, setAuthSent] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [setupChecked, setSetupChecked] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [needsSeedChoice, setNeedsSeedChoice] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState(null);

  // "Did you mean" / new-brand research
  const [tierSuggestion, setTierSuggestion] = useState(null); // { name, tier, reasoning, notes, categories }
  const [tierResearching, setTierResearching] = useState(false);
  const [tierError, setTierError] = useState(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState([]);
  const [deletingBrand, setDeletingBrand] = useState(null);
  const [confirmRemoveBrand, setConfirmRemoveBrand] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};
    appAuth.getSession()
      .then((current) => {
        setSession(current);
        unsubscribe = appAuth.onAuthChange(setSession);
      })
      .catch((error) => {
        console.error("Could not read the current session", error);
        setSession(null);
      });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setSetupChecked(false);
      setLoaded(false);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const setup = await appStorage.getSetup();
        if (cancelled) return;
        if (!setup.seeded) {
          setNeedsSeedChoice(true);
          setSetupChecked(true);
          return;
        }
        setNeedsSeedChoice(false);
        const saved = await appStorage.load();
        const savedProfile = await appStorage.getProfile();
        if (cancelled) return;
        setBrands(saved.brands);
        setRanked(saved.ranked);
        setProfile(savedProfile);
        nextId.current = saved.brands.reduce((m, b) => Math.max(m, b.id), 0) + 1;
        try {
          const fits = await appStorage.getSavedFits();
          if (!cancelled) setSavedFits(fits);
        } catch (savedFitError) {
          console.error("Could not load saved fit checks", savedFitError);
        }
        if (!cancelled) { setLoadError(null); setLoaded(true); }
      } catch (error) {
        // Previously this fell through to setLoaded(true) with no brands, which
        // rendered an empty tier board and looked like "all my data vanished".
        // Surface the real failure instead — and leave `loaded` false so the
        // save effect can't persist the empty state over good data.
        console.error("Could not load Fashion Tracker data", error);
        if (!cancelled) setLoadError(error);
      }
      if (!cancelled) setSetupChecked(true);
    }
    load();
    return () => { cancelled = true; };
  }, [session]);

  useEffect(() => {
    if (!loaded || !session || needsSeedChoice || loadError) return;
    appStorage.save(brands, ranked).catch((error) => {
      console.error("Could not save Fashion Tracker data", error);
    });
  }, [brands, ranked, loaded, session, needsSeedChoice, loadError]);

  const sendMagicLink = async (event) => {
    event.preventDefault();
    if (!authEmail.trim()) return;
    setAuthSending(true); setAuthError(null);
    try {
      await appAuth.sendMagicLink(authEmail);
      setAuthSent(true);
    } catch (error) {
      setAuthError(error.message || "Could not send that link. Try again in a moment.");
    }
    setAuthSending(false);
  };

  const chooseSeed = async (choice) => {
    setSeeding(true); setSeedError(null);
    try {
      const seeded = await appStorage.seedCatalog(choice, categorizedBrands, initialRanked);
      const savedProfile = await appStorage.getProfile();
      setBrands(seeded.brands);
      setRanked(seeded.ranked);
      setProfile(savedProfile);
      nextId.current = seeded.brands.reduce((m, b) => Math.max(m, b.id), 0) + 1;
      setNeedsSeedChoice(false);
      setLoaded(true);
    } catch (error) {
      setSeedError(error.message || "Could not set up your list. Try again in a moment.");
    }
    setSeeding(false);
  };

  const getBrand = (id) => brands.find((b) => b.id === id);

  const handleDragStart = (e, id, source) => { dragItem.current = id; dragSource.current = source; setDragging(id); };
  const handleDragEnd = () => { setDragging(null); setDragOver(null); dragItem.current = null; dragSource.current = null; };

  const handleDropOnTier = (e, tier) => {
    e.preventDefault();
    const id = dragItem.current;
    if (!id) return;
    setRanked((prev) => [...prev.filter((r) => r.id !== id), { id, tier }]);
    setDragOver(null);
  };

  const handleDropReorder = (e, targetId, tier) => {
    e.preventDefault(); e.stopPropagation();
    const id = dragItem.current;
    if (!id || id === targetId) return;
    if (dragSource.current === "tier-" + tier) {
      setRanked((prev) => {
        const items = prev.filter((r) => r.tier === tier);
        const others = prev.filter((r) => r.tier !== tier);
        const fi = items.findIndex((r) => r.id === id);
        const ti = items.findIndex((r) => r.id === targetId);
        if (fi === -1 || ti === -1) return prev;
        const arr = [...items];
        arr.splice(fi, 1); arr.splice(ti, 0, { id, tier });
        return [...others, ...arr];
      });
    } else {
      setRanked((prev) => {
        const filtered = prev.filter((r) => r.id !== id);
        const ti = filtered.findIndex((r) => r.id === targetId);
        if (ti === -1) return [...filtered, { id, tier }];
        const arr = [...filtered]; arr.splice(ti, 0, { id, tier }); return arr;
      });
    }
    setDragOver(null);
  };

  const handleAddBrand = (brandName, categories = ["Clothing"], tier = "F", notes = "") => {
    const name = brandName.trim();
    if (!name) return;
    const newId = nextId.current++;
    setBrands((prev) => [...prev, { id: newId, name, notes, categories }]);
    setRanked((prev) => [...prev, { id: newId, tier }]);
    setNewestId(newId);
    setAddCategoryOpen(false);
    setNewBrandCategories(["Clothing"]);
    setTierSuggestion(null);
    setTierError(null);
    setSearch("");
  };

  // Looks the brand up before adding it so it lands on a researched tier rather
  // than defaulting to F. The user can still change the tier before saving.
  const researchNewBrand = async (brandName) => {
    setTierResearching(true); setTierError(null); setTierSuggestion(null);
    try {
      const suggestion = await researchBrandTier(brandName);
      setTierSuggestion({ name: brandName.trim(), ...suggestion });
      setNewBrandCategories(suggestion.categories);
    } catch (error) {
      setTierError("Couldn't research this brand right now — you can still add it and set the tier yourself.");
    }
    setTierResearching(false);
  };

  const removeBrand = async (brandId) => {
    setDeletingBrand(brandId);
    try {
      await appStorage.deleteBrand(brandId);
      setBrands((prev) => prev.filter((brand) => brand.id !== brandId));
      setRanked((prev) => prev.filter((entry) => entry.id !== brandId));
      setModalBrandId(null);
    } catch (error) {
      console.error("Could not remove brand", error);
    }
    setDeletingBrand(null);
  };

  // ---- Brand detail modal logic ----
  const openBrandModal = (id) => {
    setModalBrandId(id);
    setSizeCharts([]); setSizeChartIndex(0); setSizeChartError(null);
    setFitInput(""); setFitResult(null); setFitError(null);
    setPoshmarkUrl(""); setPoshmarkError(null);
    setPriceGuide(null); setPriceGuideError(null);
    setSaveFitOpen(false); setSaveFitLabel(""); attachPhoto(null); setSaveFitError(null);
    setSaveFitConfirmed(false);
    setConfirmRemoveBrand(null);
  };

  // Keeps the preview URL in step with the selected file and revokes the old
  // object URL so imported photos don't leak blobs.
  const attachPhoto = (file) => {
    setSaveFitPhoto(file);
    setSaveFitPhotoPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const saveCurrentFit = async () => {
    if (!saveFitLabel.trim() || !fitResult || !modalBrand) return;
    setSaveFitLoading(true); setSaveFitError(null);
    try {
      const normalized = extractJSON(await askClaude(`Normalize this clothing listing description into structured JSON. Extract measurements mentioned, size, material, and fit-related details. Respond with ONLY raw JSON in exactly this shape: {"measurements":{},"size":"","material":""}

${fitInput}`));
      const id = crypto.randomUUID();
      const photoPath = saveFitPhoto ? await appStorage.uploadFitPhoto(saveFitPhoto, id) : null;
      const saved = await appStorage.saveFit({
        id,
        brand: modalBrand.name,
        label: saveFitLabel.trim(),
        photo_path: photoPath,
        measurements: normalized.measurements || {},
        size: normalized.size || null,
        material: normalized.material || null,
        fit_verdict: fitResult.verdict,
        fit_reasoning: fitResult.reasoning || null,
        original_text: fitInput,
        confirmed_fit: "Not yet confirmed",
      });
      setSavedFits((current) => [saved, ...current]);
      setSaveFitOpen(false); setSaveFitLabel(""); attachPhoto(null);
      setSaveFitConfirmed(true);
    } catch (error) {
      setSaveFitError("Could not save this fit right now. Try again in a moment.");
    }
    setSaveFitLoading(false);
  };

  const deleteSavedFit = async (fit) => {
    try {
      await appStorage.deleteFit(fit.id);
      setSavedFits((current) => current.filter((saved) => saved.id !== fit.id));
      setSelectedFit(null);
    } catch (error) {
      console.error("Could not delete saved fit", error);
    }
  };

  const updateFitConfirmation = async (fit, confirmedFit) => {
    try {
      const updated = await appStorage.updateFitConfirmation(fit.id, confirmedFit);
      setSavedFits((current) => current.map((saved) => saved.id === fit.id ? { ...saved, ...updated } : saved));
      setSelectedFit((current) => current && current.id === fit.id ? { ...current, ...updated } : current);
    } catch (error) {
      console.error("Could not update fit confirmation", error);
    }
  };

  const openSavedFit = (fit) => {
    setSelectedFit(fit);
  };

  const updateProfile = async () => {
    if (!profileText.trim()) return;
    setProfileLoading(true); setProfileError(null);
    try {
      const prompt = `Parse the following body measurement information into JSON. Preserve every measurement you can identify, including bust, waist, hips, high bust, underbust, back width, shoulder width, back shoulder, neck to bust, waist to floor, chest to floor, shoe size, and any other useful measurement. Use clear camelCase field names and numeric values where possible. Respond with ONLY raw JSON, no markdown fences or other text.

${profileText}`;
      const measurements = extractJSON(await askClaude(prompt, false));
      const updated = { ...profile, measurements };
      await appStorage.setProfile(updated);
      setProfile(updated);
      setProfileText("");
    } catch (error) {
      setProfileError("Could not update measurements right now. Try again in a moment.");
    }
    setProfileLoading(false);
  };

  const closeBrandModal = () => setModalBrandId(null);

  // Load any cached size chart / price guide when a brand modal opens. These
  // are database reads only — the API lookups now happen when the user asks for
  // them, so opening a brand never spends credits on its own.
  useEffect(() => {
    if (modalBrandId === null) return;
    let cancelled = false;

    (async () => {
      try {
        const cached = await appStorage.getSizeCharts(modalBrandId);
        if (cached && !cancelled) setSizeCharts(cached);
      } catch (_) { /* no cache yet */ }
      try {
        const cachedP = await appStorage.getPriceGuide(modalBrandId);
        if (cachedP && !cancelled) setPriceGuide(cachedP);
      } catch (_) { /* no cache yet */ }
    })();

    return () => { cancelled = true; };
  }, [modalBrandId]);

  const fetchSizeChart = async (brandName, brandId, categories = ["Clothing"]) => {
    setSizeChartLoading(true); setSizeChartError(null);
    try {
      // A shoes-only brand needs shoe sizing, not bust/waist/hips.
      const list = categories && categories.length ? categories : ["Clothing"];
      const shoesOnly = list.includes("Shoes") && !list.includes("Clothing");
      const prompt = shoesOnly
        ? `Find official women's SHOE size charts for the brand "${brandName}". Search if needed to confirm. Include separate charts when the brand has meaningful differences, such as US vs EU vs UK conversions, or boots vs sneakers. If exact data isn't findable, provide one reasonable estimated chart and mark it estimated.

You MUST answer with the JSON object and nothing else — never ask a clarifying question and never reply in prose. Respond with ONLY raw JSON, no markdown fences, no other text, in exactly this shape:
{"charts":[{"label":"US women's","unit":"in","type":"shoes","estimated":true,"sizes":[{"size":"8","us":8,"eu":38.5,"uk":5.5,"footLength":9.6},{"size":"8.5","us":8.5,"eu":39,"uk":6,"footLength":9.8}],"note":"one short sentence of sizing guidance, e.g. whether the brand runs small"}]}
"footLength" is the foot length in inches. Every size row must include us, eu, uk, and footLength.`
        : `Find official women's clothing size charts for the brand "${brandName}". Search if needed to confirm. Include separate charts when the brand has meaningful differences such as dresses vs tops, or US vs international sizing. If exact data isn't findable, provide one reasonable estimated chart and mark it estimated.${list.includes("Shoes") ? ` This brand also sells shoes, so add one additional chart with "type":"shoes" using {"size","us","eu","uk","footLength"} rows, where footLength is in inches.` : ""}

You MUST answer with the JSON object and nothing else — never ask a clarifying question and never reply in prose. Respond with ONLY raw JSON, no markdown fences, no other text, in exactly this shape:
{"charts":[{"label":"US dresses","unit":"in","type":"clothing","estimated":true,"sizes":[{"size":"XS","bust":32,"waist":24,"hips":34},{"size":"S","bust":34,"waist":26,"hips":36}],"note":"one short sentence of sizing guidance"}]}`;
      const text = await askClaude(prompt, true);
      const parsed = extractJSON(text);
      const charts = (parsed.charts || []).map((chart) => ({
        ...chart,
        type: chart.type === "shoes" || shoesOnly ? "shoes" : "clothing",
        fetchedAt: new Date().toISOString(),
      }));
      if (!charts.length) throw new Error("No charts returned");
      setSizeCharts(charts);
      setSizeChartIndex(0);
      await appStorage.setSizeCharts(brandId, charts);
    } catch (err) {
      setSizeChartError("Couldn't get a size chart right now. Try again in a moment.");
    }
    setSizeChartLoading(false);
  };

  const runFitCheck = async (brandName, listingText = fitInput) => {
    if (!listingText.trim()) return;
    setFitLoading(true); setFitError(null); setFitResult(null);
    try {
      const chartText = sizeCharts.length ? JSON.stringify(sizeCharts) : "no size chart available — use general knowledge of this brand's fit if you have it";
      const prompt = `My saved body measurements: ${JSON.stringify(profile.measurements)}

Brand: ${brandName}
Brand size chart (body measurements by size): ${chartText}

Listing details I'm considering (may include a size label and/or garment measurements, possibly laid-flat so double where relevant for circumference):
"""${listingText}"""

Assess whether this listing will fit me. Respond with ONLY raw JSON, no markdown fences, no other text, in exactly this shape:
{"verdict":"good fit" or "tight" or "loose" or "unclear","recommendedSize":"e.g. size 4 / M","reasoning":"2-3 sentence explanation referencing the actual numbers"}`;
      const text = await askClaude(prompt, false);
      const parsed = extractJSON(text);
      setFitResult(parsed);
    } catch (err) {
      setFitError("Couldn't check fit right now. Try again in a moment.");
    }
    setFitLoading(false);
  };

  const importPoshmarkListing = async () => {
    if (!poshmarkUrl.trim()) return;
    setPoshmarkLoading(true); setPoshmarkError(null);
    try {
      const response = await fetch("/api/poshmark-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: poshmarkUrl.trim() }),
      });
      const listing = await response.json();
      if (!response.ok) throw new Error(listing.error || "Could not import this listing.");
      const listingText = sanitizeListingText([listing.title, listing.description].filter(Boolean).join("\n\n"));
      setFitInput(listingText);
      if (listing.title) setSaveFitLabel(listing.title);
      // A native file input can never display a programmatically-set file, so
      // the imported photo is surfaced as a preview thumbnail instead — that is
      // the only signal the user gets that a photo came across.
      attachPhoto(null);
      if (listing.image) {
        try {
          const imageResponse = await fetch(listing.image);
          if (!imageResponse.ok) throw new Error(`image responded ${imageResponse.status}`);
          const blob = await imageResponse.blob();
          if (!blob.size) throw new Error("image was empty");
          const extension = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
          attachPhoto(new File([blob], `poshmark-listing.${extension}`, { type: blob.type || "image/jpeg" }));
        } catch (imageError) {
          console.error("Could not attach the listing photo", imageError);
          setPoshmarkError("Imported the listing, but its photo couldn't be attached — add one manually if you want.");
        }
      }
      await runFitCheck(modalBrand.name, listingText);
    } catch (error) {
      setPoshmarkError(error.message || "Could not import this listing.");
    }
    setPoshmarkLoading(false);
  };

  const fetchPriceGuide = async (brandName, brandId) => {
    setPriceGuideLoading(true); setPriceGuideError(null);
    try {
      // Without the explicit "never ask a clarifying question" instruction the
      // model replies in prose for lesser-known brands and extractJSON fails.
      const prompt = `For the clothing brand "${brandName}", give a general sense of typical original retail prices and typical secondhand resale prices (on Poshmark, TheRealReal, ThredUp, or Vestiaire Collective) for a normal piece from this brand (e.g. a dress or top, gently used condition). Search if needed.

You MUST answer with the JSON object and nothing else. Never ask a clarifying question, never explain that data is unavailable, and never reply in prose. If you cannot find hard data, estimate from comparable brands and say so in "notes". Every numeric field is required and must be a plain number.

Respond with ONLY raw JSON, no markdown fences, no other text, in exactly this shape:
{"retailLow":80,"retailHigh":200,"resaleLow":30,"resaleHigh":90,"goodBuyUnder":45,"notes":"1-2 sentence explanation of resale demand/depreciation for this brand"}`;
      const text = await askClaude(prompt, true);
      const parsed = extractJSON(text);
      const withMeta = { ...parsed, fetchedAt: new Date().toISOString() };
      setPriceGuide(withMeta);
      await appStorage.setPriceGuide(brandId, withMeta);
    } catch (err) {
      setPriceGuideError("Couldn't get pricing right now. Try again in a moment.");
    }
    setPriceGuideLoading(false);
  };

  const tierOrder = TIER_CONFIG.map((t) => t.label);
  const rankedSorted = [...ranked].sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));

  const brandCard = (id, source, tier) => {
    const b = getBrand(id);
    if (!b) return null;
    const isDragging = dragging === id;
    const isNew = id === newestId;
    return (
      <div
        key={id} draggable
        onDragStart={(e) => handleDragStart(e, id, source)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { if (tier) handleDropReorder(e, id, tier); }}
        title={b.notes}
        style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "6px 10px", borderRadius: "0",
          background: isDragging ? "#e8e0d5" : isNew ? "#f0e7d5" : "#fffdfa",
          border: "1px solid " + (isDragging ? "#aa9d8d" : isNew ? "#967342" : "#ded6ca"),
          boxShadow: isNew ? "0 3px 12px rgba(86, 67, 43, 0.1)" : "0 1px 4px rgba(86, 67, 43, 0.04)",
          cursor: "grab", fontSize: "13px",
          color: isDragging ? "#8b8175" : "#302b25",
          userSelect: "none", opacity: isDragging ? 0.5 : 1,
          transition: "all 0.15s", whiteSpace: "normal", wordBreak: "break-word", minHeight: "38px", margin: "3px",
        }}
      >
        <span
          onClick={(e) => { e.stopPropagation(); openBrandModal(id); }}
          style={{ cursor: "pointer", textDecoration: "underline", textDecorationColor: "#b9aa98", textUnderlineOffset: "3px" }}
        >
          {b.name}
        </span>
        {isNew && <span style={{ fontSize: "9px", background: "#967342", color: "#fffdfa", borderRadius: "0", padding: "2px 5px", fontWeight: "bold", letterSpacing: "0.08em" }}>NEW</span>}
      </div>
    );
  };

  const shellStyle = { minHeight: "100vh", background: "#f7f3ed", color: "#302b25", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" };
  const cardStyle = { width: "100%", maxWidth: "420px", boxSizing: "border-box", background: "#fffdfa", border: "1px solid #cfc6ba", padding: "28px 24px", boxShadow: "0 16px 48px rgba(49, 39, 28, 0.1)" };
  const wordmark = <div style={{ fontSize: "25px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#211d17", marginBottom: "6px" }}>BQI</div>;

  if (!isSupabaseConfigured) return (
    <div style={shellStyle}><div style={cardStyle}>
      {wordmark}
      <div style={{ fontSize: "13px", color: "#665d53", lineHeight: 1.6 }}>
        Supabase isn't configured. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your <code>.env</code>, then reload.
      </div>
    </div></div>
  );

  if (session === undefined) return (
    <div style={shellStyle}><span style={{ color: "#8b8175" }}>loading...</span></div>
  );

  // ---- Sign in (email magic link, no password) ----
  if (!session) return (
    <div style={shellStyle}><div style={cardStyle}>
      {wordmark}
      <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#81776b", textTransform: "uppercase", marginBottom: "20px" }}>Brand Quality Index</div>
      {authSent ? (
        <div>
          <div style={{ fontSize: "14px", color: "#211d17", marginBottom: "8px" }}>Check your email</div>
          <div style={{ fontSize: "13px", color: "#665d53", lineHeight: 1.6 }}>
            We sent a sign-in link to <strong>{authEmail.trim()}</strong>. Open it on this device and you'll be signed in — no password needed.
          </div>
          <button onClick={() => { setAuthSent(false); setAuthError(null); }} style={{ ...modalBtnStyle, marginTop: "18px" }}>Use a different email</button>
        </div>
      ) : (
        <form onSubmit={sendMagicLink}>
          <div style={{ fontSize: "13px", color: "#665d53", lineHeight: 1.6, marginBottom: "16px" }}>
            Enter your email and we'll send you a sign-in link. You'll stay signed in on this device.
          </div>
          <label htmlFor="bqi-email" style={{ display: "block", fontSize: "10px", letterSpacing: "0.15em", color: "#81776b", textTransform: "uppercase", marginBottom: "7px" }}>Email</label>
          <input
            id="bqi-email" type="email" required autoComplete="email"
            value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
            placeholder="you@example.com" style={{ ...fieldStyle, marginBottom: "14px" }}
          />
          <button type="submit" disabled={authSending || !authEmail.trim()} style={btnStyle(true)}>
            {authSending ? "Sending..." : "Send sign-in link"}
          </button>
          {authError && <div style={{ fontSize: "12px", color: "#996c6c", marginTop: "12px" }}>{authError}</div>}
        </form>
      )}
    </div></div>
  );

  // ---- First-run choice: inherit the base catalog, or start empty ----
  if (needsSeedChoice) return (
    <div style={shellStyle}><div style={{ ...cardStyle, maxWidth: "520px" }}>
      {wordmark}
      <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#81776b", textTransform: "uppercase", marginBottom: "18px" }}>Set up your list</div>
      <div style={{ fontSize: "13px", color: "#665d53", lineHeight: 1.6, marginBottom: "20px" }}>
        How would you like to start? This is a one-time choice, and everything you add stays private to your account.
      </div>
      <button onClick={() => chooseSeed("base")} disabled={seeding} style={{ display: "block", width: "100%", textAlign: "left", padding: "14px 16px", marginBottom: "10px", background: "#fffdfa", border: "1px solid #967342", cursor: seeding ? "wait" : "pointer", fontFamily: "inherit", color: "#302b25" }}>
        <div style={{ fontSize: "14px", marginBottom: "4px" }}>Start with the base brand list</div>
        <div style={{ fontSize: "12px", color: "#81776b", lineHeight: 1.5 }}>Copies all {categorizedBrands.length} brands with their tiers, notes, and categories into your own list. You can re-rank or remove any of them.</div>
      </button>
      <button onClick={() => chooseSeed("blank")} disabled={seeding} style={{ display: "block", width: "100%", textAlign: "left", padding: "14px 16px", background: "#fffdfa", border: "1px solid #cfc6ba", cursor: seeding ? "wait" : "pointer", fontFamily: "inherit", color: "#302b25" }}>
        <div style={{ fontSize: "14px", marginBottom: "4px" }}>Start blank</div>
        <div style={{ fontSize: "12px", color: "#81776b", lineHeight: 1.5 }}>Begin with zero brands and build your list from scratch.</div>
      </button>
      {seeding && <div style={{ fontSize: "12px", color: "#81776b", marginTop: "14px" }}>Setting up your list...</div>}
      {seedError && <div style={{ fontSize: "12px", color: "#996c6c", marginTop: "14px" }}>{seedError}</div>}
      <button onClick={() => appAuth.signOut()} style={{ ...modalBtnStyle, marginTop: "20px" }}>Sign out</button>
    </div></div>
  );

  // A load failure must never look like an empty list.
  if (loadError) {
    const message = String(loadError?.message || loadError);
    const schemaMissing = /user_setup|does not exist|schema cache|PGRST20[25]/i.test(message);
    return (
      <div style={shellStyle}><div style={{ ...cardStyle, maxWidth: "560px" }}>
        {wordmark}
        <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#996c6c", textTransform: "uppercase", marginBottom: "16px" }}>Couldn't load your data</div>
        {schemaMissing ? (
          <div style={{ fontSize: "13px", color: "#665d53", lineHeight: 1.6, marginBottom: "14px" }}>
            Your account is signed in, but the database hasn't been migrated to the multi-user schema yet — so the app can't see your brands. <strong>Your data is safe and untouched.</strong> Run <code>supabase.sql</code> in the Supabase SQL editor, then reload this page.
          </div>
        ) : (
          <div style={{ fontSize: "13px", color: "#665d53", lineHeight: 1.6, marginBottom: "14px" }}>
            Something went wrong reading your list. Nothing has been changed or overwritten.
          </div>
        )}
        <div style={{ fontSize: "11px", color: "#81776b", fontFamily: "monospace", background: "#f7f3ed", border: "1px solid #ded6ca", padding: "10px 12px", overflowWrap: "anywhere", marginBottom: "16px" }}>{message}</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => window.location.reload()} style={btnStyle(true)}>Reload</button>
          <button onClick={() => appAuth.signOut()} style={modalBtnStyle}>Sign out</button>
        </div>
      </div></div>
    );
  }

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: "#f7f3ed", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b8175", fontFamily: "Georgia, serif" }}>loading...</div>
  );

  const modalBrand = modalBrandId !== null ? getBrand(modalBrandId) : null;
  const modalBrandCategories = (modalBrand?.categories?.length ? modalBrand.categories : ["Clothing"]);
  // Nothing to fit on a bag, so the Check Fit section is dropped for brands
  // tagged only Handbags (Accessories alone still counts as wearable).
  const modalBrandIsHandbagsOnly = modalBrandCategories.length > 0
    && modalBrandCategories.every((category) => category === "Handbags");
  const modalBrandIsShoesOnly = modalBrandCategories.includes("Shoes")
    && !modalBrandCategories.includes("Clothing");
  const modalTierEntry = modalBrandId !== null ? ranked.find((r) => r.id === modalBrandId) : null;
  const modalTierConfig = modalTierEntry ? TIER_CONFIG.find((t) => t.label === modalTierEntry.tier) : null;
  const savedFitsForModalBrand = modalBrand ? savedFits.filter((fit) => fit.brand === modalBrand.name) : [];
  const normalizedSearch = search.trim().toLowerCase();
  const searchKey = normalizeBrandName(search);
  // "fashion nova" should find "FashionNova", so match on the punctuation- and
  // space-stripped form as well as a plain substring.
  const matchesSearch = (brand) => Boolean(brand) && (
    !normalizedSearch
    || brand.name.toLowerCase().includes(normalizedSearch)
    || normalizeBrandName(brand.name) === searchKey
  );
  const rankedSearchMatches = ranked.some((entry) => matchesSearch(getBrand(entry.id)));
  const existingSearchBrand = normalizedSearch ? brands.some(matchesSearch) : false;
  // Close-but-not-exact catalog entries, offered before adding anything new.
  const similarBrands = normalizedSearch && !existingSearchBrand
    ? findSimilarBrands(search, brands).filter((brand) => !dismissedSuggestions.includes(brand.id))
    : [];
  const brandMatchesCategory = (brand) => Boolean(brand) && (categoryFilter === "All" || (brand.categories || ["Clothing"]).includes(categoryFilter));
  const normalizedClosetSearch = closetSearch.trim().toLowerCase();
  const filteredSavedFits = savedFits.filter((fit) => {
    if (!normalizedClosetSearch) return true;
    return fit.brand.toLowerCase().includes(normalizedClosetSearch) || fit.label.toLowerCase().includes(normalizedClosetSearch);
  });
  const savedFitDetailOverlay = selectedFit && (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(33,29,23,0.42)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "8px", overflowY: "auto", overflowX: "hidden" }} onClick={() => setSelectedFit(null)}>
      <div style={{ position: "relative", width: "100%", maxWidth: "560px", boxSizing: "border-box", margin: "8px 0", padding: "22px 18px", background: "#fffdfa", border: "1px solid #cfc6ba", boxShadow: "0 16px 48px rgba(49, 39, 28, 0.18)" }} onClick={(event) => event.stopPropagation()}>
        <button onClick={() => setSelectedFit(null)} aria-label="Close saved fit detail" title="Close saved fit detail" style={{ position: "absolute", top: "14px", right: "14px", background: "none", border: "none", color: "#81776b", cursor: "pointer", fontSize: "21px", lineHeight: 1, padding: "0 2px" }}>×</button>
        {selectedFit.photo_url && <img src={selectedFit.photo_url} alt={selectedFit.label} style={{ width: "100%", maxHeight: "380px", objectFit: "contain", background: "#f0e9df", marginBottom: "18px" }} />}
        <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#967342", textTransform: "uppercase", marginBottom: "6px" }}>{selectedFit.brand}</div>
        <h2 style={{ margin: "0 38px 8px 0", fontSize: "23px", fontWeight: "normal", color: "#211d17" }}>{selectedFit.label}</h2>
        <div style={{ fontSize: "14px", color: "#967342", textTransform: "capitalize", marginBottom: "16px" }}>{selectedFit.fit_verdict}</div>
        <div style={{ borderTop: "1px solid #ded6ca", paddingTop: "12px", fontSize: "13px", color: "#665d53", lineHeight: 1.6 }}>
          {selectedFit.size && <div><strong>Size:</strong> {selectedFit.size}</div>}
          {selectedFit.material && <div><strong>Material:</strong> {selectedFit.material}</div>}
          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
            <strong>Confirmed fit:</strong>
            <button onClick={() => updateFitConfirmation(selectedFit, "Fits")} style={{ ...modalBtnStyle, padding: "5px 8px", color: selectedFit.confirmed_fit === "Fits" ? "#71806c" : "#514b43", borderColor: selectedFit.confirmed_fit === "Fits" ? "#71806c" : "#cfc6ba" }}>✓ Fits</button>
            <button onClick={() => updateFitConfirmation(selectedFit, "Doesn't fit")} style={{ ...modalBtnStyle, padding: "5px 8px", color: selectedFit.confirmed_fit === "Doesn't fit" ? "#996c6c" : "#514b43", borderColor: selectedFit.confirmed_fit === "Doesn't fit" ? "#996c6c" : "#cfc6ba" }}>✗ Doesn't fit</button>
          </div>
          {selectedFit.fit_reasoning && <div style={{ marginTop: "8px" }}>{selectedFit.fit_reasoning}</div>}
          <div style={{ marginTop: "12px", fontSize: "11px", color: "#81776b" }}>Saved {new Date(selectedFit.saved_at).toLocaleDateString()}</div>
        </div>
        <div style={{ marginTop: "18px", fontSize: "12px", color: "#514b43", whiteSpace: "pre-wrap", borderTop: "1px solid #eee8df", paddingTop: "12px" }}>{selectedFit.original_text}</div>
        {Object.keys(selectedFit.measurements || {}).length > 0 && <div style={{ marginTop: "14px", fontSize: "12px", color: "#665d53" }}><strong>Measurements mentioned:</strong> {Object.entries(selectedFit.measurements).map(([key, value]) => `${key}: ${value}`).join(" · ")}</div>}
        <button onClick={() => deleteSavedFit(selectedFit)} style={{ ...modalBtnStyle, marginTop: "20px", color: "#996c6c", borderColor: "#c9aead" }}>Delete saved fit</button>
      </div>
    </div>
  );

  const saveProfileName = async (name) => {
    const updated = { ...profile, name };
    setProfile(updated);
    try {
      await appStorage.setProfile(updated);
    } catch (error) {
      setProfileError("Could not save your name right now.");
    }
  };

  const goHome = () => {
    setProfileView(false);
    setClosetView(false);
    setSelectedFit(null);
    setModalBrandId(null);
    setView("tier");
    setSearch("");
    setCategoryFilter("All");
  };

  if (profileView) return (
    <div style={{ minHeight: "100vh", width: "100%", boxSizing: "border-box", overflowX: "hidden", background: "#f7f3ed", color: "#302b25", fontFamily: "Georgia, serif", padding: "24px 16px 48px", maxWidth: "720px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid #cfc6ba", paddingBottom: "12px", marginBottom: "22px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "14px" }}>
          <button onClick={goHome} aria-label="Go to BQI home" style={{ padding: 0, border: "none", background: "none", color: "#211d17", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "14px", letterSpacing: "0.12em" }}>BQI</button>
          <h1 style={{ margin: 0, fontSize: "25px", fontWeight: "normal", letterSpacing: "0.12em", color: "#211d17", textTransform: "uppercase" }}>Profile</h1>
        </div>
        <button onClick={() => setProfileView(false)} aria-label="Close profile" title="Close profile" style={{ background: "none", border: "none", color: "#81776b", cursor: "pointer", fontSize: "21px", lineHeight: 1, padding: "0 2px" }}>×</button>
      </div>
      <label style={{ display: "block", fontSize: "10px", letterSpacing: "0.15em", color: "#81776b", textTransform: "uppercase", marginBottom: "7px" }}>Name</label>
      <input
        value={profile.name}
        onChange={(e) => setProfile((current) => ({ ...current, name: e.target.value }))}
        onBlur={(e) => saveProfileName(e.target.value)}
        placeholder="Your name"
        style={{ ...fieldStyle, marginBottom: "24px" }}
      />
      <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#81776b", textTransform: "uppercase", marginBottom: "10px" }}>Body measurements</div>
      <div style={{ borderTop: "1px solid #ded6ca", marginBottom: "24px" }}>
        {Object.entries(profile.measurements).map(([key, value]) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", gap: "20px", padding: "9px 0", borderBottom: "1px solid #eee8df", fontSize: "13px" }}>
            <span style={{ color: "#665d53" }}>{key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}</span>
            <span style={{ color: "#211d17" }}>{String(value)}</span>
          </div>
        ))}
      </div>
      <label style={{ display: "block", fontSize: "10px", letterSpacing: "0.15em", color: "#81776b", textTransform: "uppercase", marginBottom: "7px" }}>Paste measurement information</label>
      <textarea
        value={profileText}
        onChange={(e) => setProfileText(e.target.value)}
        placeholder="Paste your measurements here..."
        rows={7}
        style={{ ...fieldStyle, resize: "vertical", marginBottom: "10px" }}
      />
      <button onClick={updateProfile} disabled={profileLoading} style={btnStyle(true)}>{profileLoading ? "Updating..." : "Update measurements"}</button>
      {profileError && <div style={{ fontSize: "12px", color: "#996c6c", marginTop: "10px" }}>{profileError}</div>}
    </div>
  );

  if (closetView) return (
    <div style={{ minHeight: "100vh", width: "100%", boxSizing: "border-box", overflowX: "hidden", background: "#f7f3ed", color: "#302b25", fontFamily: "Georgia, serif", padding: "24px 16px 48px", maxWidth: "920px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid #cfc6ba", paddingBottom: "12px", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "14px" }}>
          <button onClick={goHome} aria-label="Go to BQI home" style={{ padding: 0, border: "none", background: "none", color: "#211d17", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "14px", letterSpacing: "0.12em" }}>BQI</button>
          <h1 style={{ margin: 0, fontSize: "25px", fontWeight: "normal", letterSpacing: "0.12em", color: "#211d17", textTransform: "uppercase" }}>My Closet</h1>
        </div>
        <button onClick={() => setClosetView(false)} aria-label="Close My Closet" title="Close My Closet" style={{ background: "none", border: "none", color: "#81776b", cursor: "pointer", fontSize: "21px", lineHeight: 1, padding: "0 2px" }}>×</button>
      </div>
      <input value={closetSearch} onChange={(e) => setClosetSearch(e.target.value)} placeholder="Search saved fits..." style={{ ...fieldStyle, marginBottom: "14px" }} />
      <>
          <div style={{ display: "flex", gap: "0", marginBottom: "18px", borderBottom: "1px solid #cfc6ba" }}>
            {[['brand', 'By Brand'], ['grid', 'Grid']].map(([mode, label]) => (
              <button key={mode} onClick={() => setClosetMode(mode)} style={{ padding: "6px 11px", border: "none", borderBottom: "1px solid " + (closetMode === mode ? "#967342" : "transparent"), background: "transparent", color: closetMode === mode ? "#302b25" : "#8b8175", cursor: "pointer", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</button>
            ))}
          </div>
          {!filteredSavedFits.length && <div style={{ padding: "30px 0", color: "#81776b", fontSize: "13px" }}>{savedFits.length ? "No saved fits match your search." : "Your saved fit checks will appear here."}</div>}
          {closetMode === "brand" && <div>
            {[...new Set(filteredSavedFits.map((fit) => fit.brand))].map((brand) => (
              <div key={brand} style={{ marginBottom: "18px" }}>
                <h2 style={{ margin: "0 0 7px", fontSize: "16px", fontWeight: "normal", borderBottom: "1px solid #ded6ca", paddingBottom: "6px" }}>{brand}</h2>
                {filteredSavedFits.filter((fit) => fit.brand === brand).map((fit) => (
                  <button key={fit.id} onClick={() => setSelectedFit(fit)} style={{ display: "block", width: "100%", textAlign: "left", border: "1px solid #ded6ca", borderBottom: "none", background: "#fffdfa", padding: "10px 12px", cursor: "pointer", fontFamily: "inherit", color: "#302b25" }}><span>{fit.label}</span><span style={{ float: "right", color: fit.confirmed_fit === "Fits" ? "#71806c" : fit.confirmed_fit === "Doesn't fit" ? "#996c6c" : "#967342", fontSize: "11px" }}>{fit.confirmed_fit || "Not yet confirmed"}</span></button>
                ))}
              </div>
            ))}
          </div>}
          {closetMode === "grid" && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(150px, 100%), 1fr))", gap: "12px" }}>
            {filteredSavedFits.map((fit) => (
              <button key={fit.id} onClick={() => setSelectedFit(fit)} style={{ padding: 0, textAlign: "left", border: "1px solid #ded6ca", background: "#fffdfa", cursor: "pointer", fontFamily: "inherit", color: "#302b25" }}>
                {fit.photo_url ? <img src={fit.photo_url} alt="" style={{ width: "100%", aspectRatio: "1 / 1.15", objectFit: "cover", display: "block" }} /> : <div style={{ width: "100%", aspectRatio: "1 / 1.15", background: "#eee8df", display: "flex", alignItems: "center", justifyContent: "center", color: "#b0a69a", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>No photo</div>}
                <div style={{ padding: "9px 10px" }}><div style={{ fontSize: "13px" }}>{fit.label}</div><div style={{ fontSize: "10px", color: "#81776b", marginTop: "4px" }}>{fit.brand}</div><div style={{ fontSize: "10px", color: fit.confirmed_fit === "Fits" ? "#71806c" : fit.confirmed_fit === "Doesn't fit" ? "#996c6c" : "#967342", marginTop: "4px" }}>{fit.confirmed_fit || "Not yet confirmed"}</div></div>
              </button>
            ))}
          </div>}
        </>
      {savedFitDetailOverlay}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", width: "100%", boxSizing: "border-box", overflowX: "hidden", background: "#f7f3ed", color: "#302b25", fontFamily: "Georgia, serif", padding: "24px 16px 48px", maxWidth: "920px", margin: "0 auto" }}>

      <div style={{ marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "18px", marginBottom: "4px" }}>
          <h1 style={{ margin: 0 }}><button onClick={goHome} aria-label="Go to BQI home" style={{ margin: 0, padding: 0, border: "none", background: "none", color: "#211d17", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "25px", fontWeight: "normal", letterSpacing: "0.12em", textTransform: "uppercase" }}>BQI</button></h1>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => setClosetView(true)} aria-label="Open My Closet" title="My Closet" style={{ width: "22px", height: "22px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid #967342", color: "#967342", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "14px", lineHeight: 1, padding: 0 }}>◇</button>
            <button onClick={() => setProfileView(true)} aria-label="Open profile" title="Profile" style={{ width: "22px", height: "22px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid #967342", borderRadius: "50%", color: "#967342", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: "11px", lineHeight: 1, padding: 0 }}>P</button>
          </div>
        </div>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search brands..."
        style={{ ...fieldStyle, marginBottom: normalizedSearch ? "10px" : "16px" }}
      />

      {normalizedSearch && !existingSearchBrand && (
        <div style={{ marginBottom: "12px" }}>
          {/* Near-matches from the catalog come first — a misspelling should not
              quietly become a duplicate brand. */}
          {similarBrands.length > 0 && (
            <div style={{ padding: "10px 12px", marginBottom: "10px", border: "1px solid #ded6ca", background: "#fffdfa" }}>
              <div style={{ fontSize: "12px", color: "#665d53", marginBottom: "8px" }}>
                Did you mean{similarBrands.length > 1 ? " one of these" : ""}?
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                {similarBrands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => { setSearch(brand.name); openBrandModal(brand.id); }}
                    style={{ ...modalBtnStyle, borderColor: "#967342", color: "#211d17" }}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setDismissedSuggestions((current) => [...current, ...similarBrands.map((b) => b.id)])}
                style={{ padding: 0, border: "none", background: "none", color: "#81776b", cursor: "pointer", fontFamily: "inherit", fontSize: "11px", fontStyle: "italic", textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                No, "{search.trim()}" is a different brand
              </button>
            </div>
          )}

          {similarBrands.length === 0 && !addCategoryOpen && (
            <button
              onClick={() => { setAddCategoryOpen(true); researchNewBrand(search.trim()); }}
              style={btnStyle(true)}
            >
              + Add and rank brand
            </button>
          )}

          {similarBrands.length === 0 && addCategoryOpen && (
            <div style={{ padding: "12px 14px", border: "1px solid #ded6ca", background: "#fffdfa" }}>
              <div style={{ fontSize: "14px", color: "#211d17", marginBottom: "10px" }}>{search.trim()}</div>

              {tierResearching && <div style={{ fontSize: "12px", color: "#81776b", marginBottom: "10px" }}>Researching this brand to suggest a tier...</div>}
              {tierError && <div style={{ fontSize: "12px", color: "#996c6c", marginBottom: "10px" }}>{tierError}</div>}

              {tierSuggestion && (
                <div style={{ padding: "10px 12px", marginBottom: "12px", background: "#f7f3ed", border: "1px solid #ded6ca" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: "#81776b", textTransform: "uppercase", marginBottom: "6px" }}>Suggested tier</div>
                  <div style={{ fontSize: "12px", color: "#665d53", lineHeight: 1.5 }}>{tierSuggestion.reasoning}</div>
                  {tierSuggestion.notes && <div style={{ fontSize: "11px", color: "#81776b", fontStyle: "italic", marginTop: "6px", lineHeight: 1.5 }}>{tierSuggestion.notes}</div>}
                </div>
              )}

              <div style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#81776b", textTransform: "uppercase", marginBottom: "8px" }}>Tier</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                {TIER_CONFIG.map((tier) => {
                  const active = (tierSuggestion?.tier || "F") === tier.label;
                  return (
                    <button
                      key={tier.label}
                      onClick={() => setTierSuggestion((current) => ({ ...(current || { name: search.trim(), reasoning: "", notes: "", categories: newBrandCategories }), tier: tier.label }))}
                      title={tier.desc}
                      style={{ padding: "6px 11px", border: "1px solid " + (active ? tier.color : "#cfc6ba"), background: active ? tier.bg : "#fffdfa", color: active ? tier.color : "#81776b", cursor: "pointer", fontFamily: "inherit", fontSize: "12px", fontWeight: active ? "bold" : "normal" }}
                    >
                      {tier.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#81776b", textTransform: "uppercase", marginBottom: "8px" }}>Categories</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                {["Clothing", "Shoes", "Handbags", "Accessories"].map((category) => (
                  <label key={category} style={{ fontSize: "12px", color: "#514b43", cursor: "pointer" }}>
                    <input type="checkbox" checked={newBrandCategories.includes(category)} onChange={() => setNewBrandCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category])} /> {category}
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  disabled={!newBrandCategories.length || tierResearching}
                  onClick={() => handleAddBrand(search.trim(), newBrandCategories, tierSuggestion?.tier || "F", tierSuggestion?.notes || "")}
                  style={modalBtnStyle}
                >
                  Save brand
                </button>
                <button onClick={() => { setAddCategoryOpen(false); setTierSuggestion(null); setTierError(null); }} style={modalBtnStyle}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {(!normalizedSearch || existingSearchBrand) && (
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "14px", borderBottom: "1px solid #cfc6ba" }}>
          <div style={{ display: "flex", gap: "0", flexShrink: 0 }}>
            {["tier", "ranked"].map((v) => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "6px 11px", border: "none", borderBottom: "1px solid " + (view === v ? "#967342" : "transparent"),
                background: "transparent", color: view === v ? "#302b25" : "#8b8175",
                cursor: "pointer", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
              }}>{v === "tier" ? "Tier View" : "Ranked List"}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0", marginLeft: "auto", flexWrap: "wrap" }}>
            {["All", "Clothing", "Shoes", "Handbags", "Accessories"].map((category) => (
              <button key={category} onClick={() => setCategoryFilter(category)} style={{ padding: "5px 8px", border: "none", borderBottom: "1px solid " + (categoryFilter === category ? "#967342" : "transparent"), background: "transparent", color: categoryFilter === category ? "#302b25" : "#8b8175", cursor: "pointer", fontSize: "9px", letterSpacing: "0.06em" }}>{category}</button>
            ))}
          </div>
        </div>
      )}

      {view === "tier" && (
        <div>
          {normalizedSearch && !rankedSearchMatches ? null : (
            TIER_CONFIG.map((tier) => {
            const tierBrands = ranked.filter((r) => r.tier === tier.label).map((r) => r.id).filter(id => {
              const b = getBrand(id);
              return b && brandMatchesCategory(b) && matchesSearch(b);
            });
            if (normalizedSearch && tierBrands.length === 0) return null;
            const isOver = dragOver === "tier-" + tier.label;
            return (
              <div key={tier.label}
                onDragOver={(e) => { e.preventDefault(); setDragOver("tier-" + tier.label); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDropOnTier(e, tier.label)}
                style={{ display: "flex", marginBottom: "6px", borderRadius: "0", border: "1px solid " + (isOver ? tier.color : "#d9d0c4"), overflow: "hidden", minHeight: "58px", boxShadow: "0 2px 8px rgba(86, 67, 43, 0.035)" }}
              >
                <div style={{ width: "58px", flexShrink: 0, background: tier.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: "1px solid " + tier.color, gap: "2px" }}>
                  <span style={{ fontSize: "22px", fontWeight: "bold", color: tier.color, lineHeight: 1 }}>{tier.label}</span>
                  <span style={{ fontSize: "9px", color: tier.color, opacity: 0.75, letterSpacing: "0.08em", textTransform: "uppercase" }}>{tier.desc}</span>
                </div>
                <div style={{ flex: 1, background: isOver ? "#f0e9df" : "#fbf9f5", padding: "10px", display: "flex", flexWrap: "wrap", alignContent: "flex-start", alignItems: "center" }}>
                  {tierBrands.length === 0 && <span style={{ fontSize: "11px", color: "#b0a69a", fontStyle: "italic" }}>drop here</span>}
                  {tierBrands.map((id) => brandCard(id, "tier-" + tier.label, tier.label))}
                </div>
              </div>
            );
            })
          )}

        </div>
      )}

      {view === "ranked" && (
        <div>
          {TIER_CONFIG.map((tier) => {
            const tierBrands = ranked.filter((r) => r.tier === tier.label).filter(r => {
              if (!search) return true;
              const b = getBrand(r.id);
              return b && brandMatchesCategory(b) && matchesSearch(b);
            }).filter((r) => brandMatchesCategory(getBrand(r.id)));
            if (!tierBrands.length) return null;
            const startRank = rankedSorted.findIndex((r) => r.tier === tier.label) + 1;
            return (
              <div key={tier.label} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", paddingBottom: "5px", borderBottom: "1px solid " + tier.color + "22" }}>
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: tier.color }}>{tier.label}</span>
                  <span style={{ fontSize: "11px", color: tier.color, opacity: 0.7 }}>{tier.desc}</span>
                </div>
                {tierBrands.map((r, i) => {
                  const b = getBrand(r.id);
                  return (
                    <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "9px 12px", borderRadius: "0", background: "#fffdfa", marginBottom: "4px", border: "1px solid #ded6ca", boxShadow: "0 2px 8px rgba(86, 67, 43, 0.035)" }}>
                      <div style={{ paddingTop: "1px" }}><Medal rank={startRank + i} /></div>
                      <div style={{ flex: 1 }}>
                        <div
                          onClick={() => openBrandModal(r.id)}
                          style={{ fontSize: "14px", color: "#302b25", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#b9aa98", textUnderlineOffset: "3px", display: "inline-block" }}
                        >
                          {b ? b.name : ""}
                        </div>
                        {b && b.notes && <div style={{ fontSize: "11px", color: "#81776b", fontStyle: "italic", marginTop: "4px", lineHeight: 1.45 }}>{b.notes}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* ---- Brand Detail Modal ---- */}
      {modalBrand && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(33,29,23,0.42)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 200, padding: "8px", overflowY: "auto", overflowX: "hidden" }} onClick={closeBrandModal}>
          <div style={{ background: "#fffdfa", border: "1px solid #cfc6ba", borderRadius: "0", padding: "18px", width: "100%", boxSizing: "border-box", maxWidth: "560px", margin: "8px 0", boxShadow: "0 16px 48px rgba(49, 39, 28, 0.18)" }} onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "6px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <h2 style={{ margin: 0, fontSize: "22px", color: "#211d17", fontWeight: "normal", overflowWrap: "anywhere" }}>{modalBrand.name}</h2>
                  {modalTierConfig && (
                    <span style={{ fontSize: "11px", fontWeight: "bold", color: modalTierConfig.color, border: "1px solid " + modalTierConfig.color, borderRadius: "0", padding: "3px 7px" }}>
                      {modalTierConfig.label} · {modalTierConfig.desc}
                    </span>
                  )}
                </div>
                {modalBrand.notes && <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#81776b", fontStyle: "italic", maxWidth: "440px", lineHeight: 1.5 }}>{modalBrand.notes}</p>}
              </div>
              <button onClick={closeBrandModal} style={{ background: "none", border: "none", color: "#81776b", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #ded6ca", margin: "22px 0" }} />

            {/* Fit check — skipped entirely for brands that are only handbags,
                since there is nothing to fit. */}
            {!modalBrandIsHandbagsOnly && (
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#81776b", textTransform: "uppercase", marginBottom: "10px" }}>Check Fit</div>
              <div style={{ display: "flex", gap: "7px", marginBottom: "8px" }}>
                <input value={poshmarkUrl} onChange={(e) => setPoshmarkUrl(e.target.value)} placeholder="Paste Poshmark link" style={{ ...fieldStyle, padding: "9px 10px" }} />
                <button onClick={importPoshmarkListing} disabled={poshmarkLoading || !poshmarkUrl.trim()} style={{ ...modalBtnStyle, flexShrink: 0 }}>{poshmarkLoading ? "Importing..." : "Import"}</button>
              </div>
              {poshmarkError && <div style={{ fontSize: "11px", color: "#996c6c", marginBottom: "8px" }}>{poshmarkError}</div>}
              <textarea
                value={fitInput}
                onChange={(e) => setFitInput(e.target.value)}
                placeholder="Paste the whole listing description — size, measurements, material, condition, whatever's there"
                rows={4}
                style={{ ...fieldStyle, resize: "vertical", marginBottom: "8px" }}
              />
              <button onClick={() => runFitCheck(modalBrand.name)} disabled={fitLoading} style={modalBtnStyle}>
                {fitLoading ? "Checking..." : "Check fit"}
              </button>
              {fitError && <div style={{ fontSize: "12px", color: "#996c6c", marginTop: "8px" }}>{fitError}</div>}
              {fitResult && (
                <div style={{ marginTop: "10px", padding: "12px 14px", background: "#f7f3ed", border: "1px solid #ded6ca", borderRadius: "0" }}>
                  <div style={{ fontSize: "13px", fontWeight: "bold", color: fitResult.verdict === "good fit" ? "#71806c" : fitResult.verdict === "unclear" ? "#967342" : "#996c6c", marginBottom: "4px", textTransform: "capitalize" }}>
                    {fitResult.verdict} {fitResult.recommendedSize ? `· Recommend: ${fitResult.recommendedSize}` : ""}
                  </div>
                  <div style={{ fontSize: "12px", color: "#665d53", lineHeight: 1.5 }}>{fitResult.reasoning}</div>
                </div>
              )}
              {fitResult && !saveFitOpen && (
                <button onClick={() => setSaveFitOpen(true)} style={{ ...modalBtnStyle, marginTop: "12px" }}>Save this fit</button>
              )}
              {saveFitConfirmed && <div style={{ marginTop: "10px", color: "#71806c", fontSize: "12px", fontStyle: "italic" }}>Saved ✓</div>}
              {fitResult && saveFitOpen && (
                <div style={{ marginTop: "12px", padding: "12px 14px", border: "1px solid #ded6ca", background: "#fbf9f5" }}>
                  <input value={saveFitLabel} onChange={(e) => setSaveFitLabel(e.target.value)} placeholder="Label, e.g. Black midi dress" style={{ ...fieldStyle, marginBottom: "8px", padding: "9px 10px" }} />
                  {saveFitPhotoPreview && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "9px", padding: "8px", background: "#fffdfa", border: "1px solid #ded6ca" }}>
                      <img src={saveFitPhotoPreview} alt="Photo to be saved with this fit" style={{ width: "52px", height: "62px", objectFit: "cover", background: "#eee8df" }} />
                      <div style={{ flex: 1, fontSize: "11px", color: "#665d53", overflowWrap: "anywhere" }}>
                        Photo attached{saveFitPhoto?.name ? ` — ${saveFitPhoto.name}` : ""}
                      </div>
                      <button onClick={() => attachPhoto(null)} aria-label="Remove attached photo" style={{ ...modalBtnStyle, padding: "4px 8px" }}>Remove</button>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => attachPhoto(e.target.files?.[0] || null)} style={{ width: "100%", marginBottom: "9px", fontFamily: "inherit", fontSize: "11px", color: "#665d53" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button onClick={saveCurrentFit} disabled={saveFitLoading || !saveFitLabel.trim()} style={modalBtnStyle}>{saveFitLoading ? "Saving..." : "Save"}</button>
                    <button onClick={() => setSaveFitOpen(false)} style={modalBtnStyle}>Cancel</button>
                  </div>
                  {saveFitError && <div style={{ fontSize: "11px", color: "#996c6c", marginTop: "8px" }}>{saveFitError}</div>}
                </div>
              )}
              {savedFitsForModalBrand.length > 0 && (
                <div style={{ marginTop: "14px", borderTop: "1px solid #eee8df", paddingTop: "10px" }}>
                  <div style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#81776b", textTransform: "uppercase", marginBottom: "6px" }}>Saved for {modalBrand.name}</div>
                  {savedFitsForModalBrand.map((fit) => (
                    <button key={fit.id} onClick={() => openSavedFit(fit)} style={{ display: "flex", justifyContent: "space-between", gap: "10px", width: "100%", padding: "8px 0", border: "none", borderBottom: "1px solid #eee8df", background: "none", color: "#514b43", cursor: "pointer", fontFamily: "inherit", fontSize: "12px", textAlign: "left" }}>
                      <span>{fit.label}</span><span style={{ color: "#967342", textTransform: "capitalize" }}>{fit.fit_verdict}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            )}

            {!modalBrandIsHandbagsOnly && <hr style={{ border: "none", borderTop: "1px solid #ded6ca", margin: "22px 0" }} />}

            {/* Size chart — fetched on request so opening a brand costs nothing */}
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#81776b", textTransform: "uppercase", marginBottom: "10px" }}>Size Chart</div>
              {sizeChartLoading && <div style={{ fontSize: "12px", color: "#81776b" }}>Looking this up...</div>}
              {!sizeChartLoading && !sizeCharts.length && !sizeChartError && (
                <div>
                  <button onClick={() => fetchSizeChart(modalBrand.name, modalBrand.id, modalBrandCategories)} style={modalBtnStyle}>Get size chart</button>
                  <div style={{ fontSize: "11px", color: "#81776b", marginTop: "6px", fontStyle: "italic" }}>Looks up {modalBrandIsShoesOnly ? "shoe sizing" : "sizing"} for this brand and saves it.</div>
                </div>
              )}
              {sizeChartError && !sizeCharts.length && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                  <button onClick={() => fetchSizeChart(modalBrand.name, modalBrand.id, modalBrandCategories)} aria-label="Retry size chart" title="Retry size chart" style={iconBtnStyle}>↻</button>
                  <div style={{ fontSize: "12px", color: "#996c6c" }}>{sizeChartError}</div>
                </div>
              )}
              {sizeCharts.length > 0 && (() => {
                const chart = sizeCharts[sizeChartIndex];
                return (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#302b25" }}>{chart.label || `Chart ${sizeChartIndex + 1}`}</span>
                      {sizeCharts.length > 1 && <span style={{ fontSize: "11px", color: "#81776b" }}>Swipe or use arrows</span>}
                    </div>
                    <div
                      onTouchStart={(e) => { e.currentTarget.dataset.touchX = e.touches[0].clientX; }}
                      onTouchEnd={(e) => {
                        const start = Number(e.currentTarget.dataset.touchX || 0);
                        const delta = e.changedTouches[0].clientX - start;
                        if (Math.abs(delta) > 40 && sizeCharts.length > 1) setSizeChartIndex((current) => (current + (delta < 0 ? 1 : -1) + sizeCharts.length) % sizeCharts.length);
                      }}
                      style={{ overflowX: "auto" }}
                    >
                      {chart.estimated && <div style={{ fontSize: "11px", color: "#967342", marginBottom: "8px" }}>⚠ Estimated — exact brand data wasn't available</div>}
                      {chart.type === "shoes" ? (
                        <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: "12px" }}>
                          <thead><tr style={{ borderBottom: "1px solid #cfc6ba", color: "#81776b" }}>
                            <th style={{ textAlign: "left", padding: "4px 6px" }}>US</th><th style={{ textAlign: "left", padding: "4px 6px" }}>EU</th><th style={{ textAlign: "left", padding: "4px 6px" }}>UK</th><th style={{ textAlign: "left", padding: "4px 6px" }}>Foot</th>
                          </tr></thead>
                          <tbody>{(chart.sizes || []).map((s, i) => {
                            // Highlight the row matching the saved shoe size.
                            const mine = String(profile.measurements?.shoeSize || "").match(/[\d.]+/)?.[0];
                            const isMine = mine && String(s.us ?? s.size) === mine;
                            return (
                              <tr key={i} style={{ borderBottom: "1px solid #eee8df", background: isMine ? "#f0e7d5" : "transparent" }}>
                                <td style={{ padding: "6px", color: "#302b25" }}>{s.us ?? s.size}{isMine ? " ←" : ""}</td>
                                <td style={{ padding: "6px", color: "#665d53" }}>{s.eu ?? "—"}</td>
                                <td style={{ padding: "6px", color: "#665d53" }}>{s.uk ?? "—"}</td>
                                <td style={{ padding: "6px", color: "#665d53" }}>{s.footLength ? `${s.footLength}${chart.unit || "in"}` : "—"}</td>
                              </tr>
                            );
                          })}</tbody>
                        </table>
                      ) : (
                        <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: "12px" }}>
                          <thead><tr style={{ borderBottom: "1px solid #cfc6ba", color: "#81776b" }}>
                            <th style={{ textAlign: "left", padding: "4px 6px" }}>Size</th><th style={{ textAlign: "left", padding: "4px 6px" }}>Bust</th><th style={{ textAlign: "left", padding: "4px 6px" }}>Waist</th><th style={{ textAlign: "left", padding: "4px 6px" }}>Hips</th>
                          </tr></thead>
                          <tbody>{(chart.sizes || []).map((s, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #eee8df" }}>
                              <td style={{ padding: "6px", color: "#302b25" }}>{s.size}</td><td style={{ padding: "6px", color: "#665d53" }}>{s.bust}{chart.unit}</td><td style={{ padding: "6px", color: "#665d53" }}>{s.waist}{chart.unit}</td><td style={{ padding: "6px", color: "#665d53" }}>{s.hips}{chart.unit}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      )}
                    </div>
                    {chart.note && <div style={{ fontSize: "11px", color: "#81776b", marginTop: "8px", fontStyle: "italic" }}>{chart.note}</div>}
                    {sizeCharts.length > 1 && <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "12px" }}>
                      <button onClick={() => setSizeChartIndex((current) => (current - 1 + sizeCharts.length) % sizeCharts.length)} aria-label="Previous size chart" style={{ ...modalBtnStyle, padding: "4px 9px", fontSize: "15px", lineHeight: 1 }}>‹</button>
                      {sizeCharts.map((_, index) => <button key={index} aria-label={`Show chart ${index + 1}`} onClick={() => setSizeChartIndex(index)} style={{ width: "6px", height: "6px", padding: 0, border: "none", borderRadius: "50%", background: index === sizeChartIndex ? "#967342" : "#cfc6ba", cursor: "pointer" }} />)}
                      <button onClick={() => setSizeChartIndex((current) => (current + 1) % sizeCharts.length)} aria-label="Next size chart" style={{ ...modalBtnStyle, padding: "4px 9px", fontSize: "15px", lineHeight: 1 }}>›</button>
                    </div>}
                    <button onClick={() => fetchSizeChart(modalBrand.name, modalBrand.id, modalBrandCategories)} aria-label="Refresh size chart" title="Refresh size chart" style={{ ...iconBtnStyle, marginTop: "8px" }}>↻</button>
                  </div>
                );
              })()}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #ded6ca", margin: "22px 0" }} />

            {/* Price guide */}
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#81776b", textTransform: "uppercase", marginBottom: "10px" }}>Price Guide</div>
              {priceGuideLoading && <div style={{ fontSize: "12px", color: "#81776b" }}>Looking this up...</div>}
              {!priceGuideLoading && !priceGuide && !priceGuideError && (
                <div>
                  <button onClick={() => fetchPriceGuide(modalBrand.name, modalBrand.id)} style={modalBtnStyle}>Get price guide</button>
                  <div style={{ fontSize: "11px", color: "#81776b", marginTop: "6px", fontStyle: "italic" }}>Looks up retail and resale pricing for this brand and saves it.</div>
                </div>
              )}
              {priceGuideError && !priceGuide && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button onClick={() => fetchPriceGuide(modalBrand.name, modalBrand.id)} aria-label="Retry price guide" title="Retry price guide" style={iconBtnStyle}>↻</button>
                  <div style={{ fontSize: "12px", color: "#996c6c" }}>{priceGuideError}</div>
                </div>
              )}
              {priceGuide && (
                <div style={{ padding: "12px 14px", background: "#f7f3ed", border: "1px solid #ded6ca", borderRadius: "0" }}>
                  <div style={{ fontSize: "13px", color: "#514b43", marginBottom: "6px" }}>
                    Retail usually <strong style={{ color: "#211d17" }}>${priceGuide.retailLow}–${priceGuide.retailHigh}</strong>
                  </div>
                  <div style={{ fontSize: "13px", color: "#514b43", marginBottom: "8px" }}>
                    Resells usually <strong style={{ color: "#211d17" }}>${priceGuide.resaleLow}–${priceGuide.resaleHigh}</strong>
                  </div>
                  <div style={{ fontSize: "13px", color: "#967342", marginBottom: "8px" }}>
                    Good buy under: <strong>${priceGuide.goodBuyUnder}</strong>
                  </div>
                  <div style={{ fontSize: "12px", color: "#665d53", lineHeight: 1.5 }}>{priceGuide.notes}</div>
                  <button onClick={() => fetchPriceGuide(modalBrand.name, modalBrand.id)} aria-label="Refresh price guide" title="Refresh price guide" style={{ ...iconBtnStyle, marginTop: "10px" }}>↻</button>
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid #ded6ca", marginTop: "22px", paddingTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              {confirmRemoveBrand === modalBrand.id ? (
                <div style={{ width: "100%", padding: "10px 12px", border: "1px solid #c9aead", background: "#fbf9f5" }}>
                  <div style={{ fontSize: "12px", color: "#514b43", marginBottom: "9px", lineHeight: 1.5 }}>
                    Remove <strong>{modalBrand.name}</strong> from your list? This deletes its ranking, size chart, and price guide for your account. Saved fits are kept.
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => removeBrand(modalBrand.id)} disabled={deletingBrand === modalBrand.id} style={{ ...modalBtnStyle, color: "#996c6c", borderColor: "#c9aead" }}>
                      {deletingBrand === modalBrand.id ? "Removing..." : "Yes, remove it"}
                    </button>
                    <button onClick={() => setConfirmRemoveBrand(null)} style={modalBtnStyle}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmRemoveBrand(modalBrand.id)} style={{ padding: 0, border: "none", background: "none", color: "#996c6c", textDecoration: "underline", textUnderlineOffset: "3px", cursor: "pointer", fontFamily: "inherit", fontSize: "12px" }}>
                  Remove this brand
                </button>
              )}
              <button onClick={() => { closeBrandModal(); setProfileView(true); }} style={{ padding: 0, border: "none", background: "none", color: "#967342", textDecoration: "underline", textUnderlineOffset: "3px", cursor: "pointer", fontFamily: "inherit", fontSize: "12px", fontStyle: "italic" }}>
              Update my measurements
              </button>
            </div>

          </div>
        </div>
      )}
      {savedFitDetailOverlay}
    </div>
  );
}
