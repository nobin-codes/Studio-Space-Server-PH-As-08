import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
const DEMO_TAG = "studiospace-demo-v1";

const demos = [
  {
    title: "The Frame Lab (Demo)",
    category: "Photo Studios",
    hourlyRate: 45,
    securityDeposit: 100,
    maxCapacity: 8,
    location: "Gulshan, Dhaka (Demo Location)",
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    overview: "A sample photography studio with a clean interior and flexible space for portraits, fashion shoots, and creative projects.",
    amenities: ["Professional Lighting", "Camera Equipment", "Air Conditioning", "Wi-Fi", "Makeup Room"],
  },
  {
    title: "CineSpace Studio (Demo)",
    category: "Film Stages",
    hourlyRate: 85,
    securityDeposit: 200,
    maxCapacity: 20,
    location: "Banani, Dhaka (Demo Location)",
    imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    overview: "A sample production space for short films, commercials, interviews, and video content.",
    amenities: ["Professional Lighting", "Camera Equipment", "Air Conditioning", "Wi-Fi", "Parking"],
  },
  {
    title: "PodNest Recording Room (Demo)",
    category: "Podcast Rooms",
    hourlyRate: 35,
    securityDeposit: 80,
    maxCapacity: 5,
    location: "Dhanmondi, Dhaka (Demo Location)",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
    overview: "A sample sound-treated podcast room for interviews, discussions, and audio recording sessions.",
    amenities: ["Soundproofing", "Air Conditioning", "Wi-Fi", "Waiting Area"],
  },
  {
    title: "SoundWave Music Suite (Demo)",
    category: "Music Suites",
    hourlyRate: 55,
    securityDeposit: 120,
    maxCapacity: 6,
    location: "Uttara, Dhaka (Demo Location)",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
    overview: "A sample music production room for recording, composing, mixing, and creative collaboration.",
    amenities: ["Soundproofing", "Air Conditioning", "Wi-Fi", "Waiting Area"],
  },
  {
    title: "Canvas Creative Workshop (Demo)",
    category: "Art Workshops",
    hourlyRate: 25,
    securityDeposit: 50,
    maxCapacity: 12,
    location: "Saidpur, Nilphamari (Demo Location)",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
    overview: "A sample creative workshop space for painting sessions, art classes, and small creative gatherings.",
    amenities: ["Air Conditioning", "Wi-Fi", "Restroom", "Waiting Area", "Parking"],
  },
  {
    title: "Studio Motion (Demo)",
    category: "Film Stages",
    hourlyRate: 70,
    securityDeposit: 150,
    maxCapacity: 15,
    location: "Mirpur, Dhaka (Demo Location)",
    imageUrl: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1200&q=80",
    overview: "A sample video production space for content creators, product videos, and small commercial shoots.",
    amenities: ["Professional Lighting", "Camera Equipment", "Changing Room", "Wi-Fi"],
  },
  {
    title: "Pixel Product Studio (Demo)",
    category: "Photo Studios",
    hourlyRate: 40,
    securityDeposit: 90,
    maxCapacity: 6,
    location: "Mohammadpur, Dhaka (Demo Location)",
    imageUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80",
    overview: "A sample product photography setup for ecommerce images, catalogues, and brand campaigns.",
    amenities: ["Professional Lighting", "Camera Equipment", "Air Conditioning", "Parking"],
  },
  {
    title: "The Creator Hub (Demo)",
    category: "Podcast Rooms",
    hourlyRate: 50,
    securityDeposit: 100,
    maxCapacity: 8,
    location: "Saidpur, Nilphamari (Demo Location)",
    imageUrl: "https://images.unsplash.com/photo-1593078166031-9b3a1b0b6b1e?auto=format&fit=crop&w=1200&q=80",
    overview: "A sample content creation room for podcasts, livestreams, voiceovers, and online content.",
    amenities: ["Soundproofing", "Professional Lighting", "Air Conditioning", "Wi-Fi"],
  },
];

try {
  await client.connect();
  const db = client.db(process.env.DB_NAME || "studiospace");
  const collection = db.collection("studios");

  const user = await db.collection("user").findOne({
    email: "kashifakhternobin02@gmail.com",
  });

  if (!user) {
    throw new Error("Your account was not found. No studios were added.");
  }

  const existing = await collection.countDocuments({ demoSeed: DEMO_TAG });

  if (existing > 0) {
    console.log(`Demo listings already exist (${existing}). No duplicates added.`);
  } else {
    const now = new Date();

    const documents = demos.map((studio) => ({
      ...studio,
      demoSeed: DEMO_TAG,
      ownerId: user._id.toString(),
      ownerEmail: user.email,
      hostName: user.name,
      createdAt: now,
      updatedAt: now,
    }));

    const result = await collection.insertMany(documents);

    console.log(`Successfully added ${result.insertedCount} demo studios.`);
    console.log("Owner:", user.name);
  }

  console.log("Total studios:", await collection.countDocuments());
} finally {
  await client.close();
}
