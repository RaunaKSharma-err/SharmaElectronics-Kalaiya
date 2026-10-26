import type { Category } from "@/types/product";
import fridge from "@/assets/cat-fridge.jpg";
import washer from "@/assets/cat-washer.jpg";
import tv from "@/assets/cat-tv.jpg";
import ac from "@/assets/cat-ac.jpg";
import phone from "@/assets/cat-phone.jpg";
import laptop from "@/assets/cat-laptop.jpg";
import kitchen from "@/assets/cat-kitchen.jpg";
import fan from "@/assets/cat-fan.jpg";
import audio from "@/assets/cat-audio.jpg";
import speaker from "@/assets/cat-speaker.jpg";
import small from "@/assets/cat-small.jpg";
import accessories from "@/assets/cat-accessories.jpg";
import other from "@/assets/cat-other.jpg";

export const categories: Category[] = [
  { slug: "refrigerators", name: "Refrigerators", shortName: "Refrigerators", image: fridge,
    description: "Single-door, double-door and frost-free refrigerators for every family size. Compare capacities and prices, then ask us on WhatsApp.",
    seoDescription: "Refrigerator prices in Kalaiya, Bara. Browse single and double-door fridges at Sharma Electronics and order on WhatsApp." },
  { slug: "washing-machines", name: "Washing Machines", shortName: "Washers", image: washer,
    description: "Front-load, top-load and semi-automatic washing machines. See capacities, programs and listed prices.",
    seoDescription: "Washing machine prices in Bara, Nepal. Front-load and top-load washers at Sharma Electronics, Kalaiya." },
  { slug: "televisions", name: "Televisions", shortName: "TVs", image: tv,
    description: "Smart and LED televisions in popular screen sizes for living rooms and bedrooms.",
    seoDescription: "Television shop in Kalaiya. Smart LED TVs with prices at Sharma Electronics, Bara." },
  { slug: "air-conditioners", name: "Air Conditioners", shortName: "ACs", image: ac,
    description: "Split and inverter air conditioners for hot Terai summers. Compare tonnage and prices.",
    seoDescription: "Air conditioner prices in Kalaiya, Bara. Inverter split ACs at Sharma Electronics." },
  { slug: "smartphones", name: "Smartphones", shortName: "Phones", image: phone,
    description: "Smartphones across budgets, with storage, camera and battery details listed.",
    seoDescription: "Smartphones in Kalaiya with listed prices at Sharma Electronics. Order on WhatsApp." },
  { slug: "laptops-computers", name: "Laptops & Computers", shortName: "Laptops", image: laptop,
    description: "Laptops for study, office work and everyday use.",
    seoDescription: "Laptop and computer prices in Kalaiya, Bara at Sharma Electronics." },
  { slug: "kitchen-appliances", name: "Kitchen Appliances", shortName: "Kitchen", image: kitchen,
    description: "Mixer grinders, microwave ovens, rice cookers and other kitchen helpers.",
    seoDescription: "Kitchen appliances in Kalaiya: mixers, microwaves and rice cookers at Sharma Electronics." },
  { slug: "fans-cooling", name: "Fans & Cooling", shortName: "Fans", image: fan,
    description: "Ceiling, pedestal and table fans plus air coolers.",
    seoDescription: "Fans and air coolers in Kalaiya, Bara at Sharma Electronics." },
  { slug: "earbuds-headphones", name: "Earbuds & Headphones", shortName: "Earbuds", image: audio,
    description: "Wireless earbuds, neckbands and over-ear headphones.",
    seoDescription: "Earbuds and headphones with prices at Sharma Electronics, Kalaiya." },
  { slug: "speakers-audio", name: "Speakers & Audio", shortName: "Speakers", image: speaker,
    description: "Bluetooth speakers, soundbars and home audio.",
    seoDescription: "Bluetooth speakers and soundbars in Kalaiya, Bara at Sharma Electronics." },
  { slug: "small-home-appliances", name: "Small Home Appliances", shortName: "Small appliances", image: small,
    description: "Irons, kettles and everyday household appliances.",
    seoDescription: "Irons, kettles and small home appliances in Kalaiya at Sharma Electronics." },
  { slug: "electrical-accessories", name: "Electrical Accessories", shortName: "Accessories", image: accessories,
    description: "Extension boards, LED bulbs, chargers and cables.",
    seoDescription: "Electrical accessories in Kalaiya: extension boards, LED bulbs and chargers." },
  { slug: "other-electronics", name: "Other Electronics", shortName: "Other", image: other,
    description: "Inverters, monitors and other electronics for home and work.",
    seoDescription: "Inverters, monitors and other electronics in Kalaiya, Bara at Sharma Electronics." },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
