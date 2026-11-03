import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

const studios = [
  {
    title: "The Creative Loft",
    category: "Photo Studios",
    hourlyRate: 800,
    securityDeposit: 1000,
    maxCapacity: 10,
    location: "Dhanmondi, Dhaka",
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
    amenities: ["Lighting", "Wi-Fi", "Air Conditioning"],
    details: "A modern photography studio with professional lighting and a comfortable creative environment.",
  },
  {
    title: "Echo Sound Studio",
    category: "Sound Stages",
    hourlyRate: 1200,
    securityDeposit: 1500,
    maxCapacity: 8,
    location: "Uttara, Dhaka",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04",
    amenities: ["Soundproofing", "Microphones", "Audio Equipment"],
    details: "A sound-treated studio for recording music, voiceovers and creative audio projects.",
  },
  {
    title: "The Podcast Corner",
    category: "Podcast Rooms",
    hourlyRate: 600,
    securityDeposit: 500,
    maxCapacity: 5,
    location: "Mirpur, Dhaka",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc",
    amenities: ["Microphones", "Recording Equipment", "Wi-Fi"],
    details: "A comfortable podcast space for interviews, conversations and content creation.",
  },
  {
    title: "Rhythm Music Suite",
    category: "Music Suites",
    hourlyRate: 1000,
    securityDeposit: 1000,
    maxCapacity: 6,
    location: "Banani, Dhaka",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81",
    amenities: ["Instruments", "Speakers", "Soundproofing"],
    details: "A dedicated music space for rehearsals, songwriting and recording sessions.",
  },
  {
    title: "Art & Soul Workshop",
    category: "Art Workshops",
    hourlyRate: 500,
    securityDeposit: 500,
    maxCapacity: 12,
    location: "Mohammadpur, Dhaka",
    imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b",
    amenities: ["Work Tables", "Natural Light", "Storage"],
    details: "An inspiring workshop for artists, designers and creative workshops.",
  },
];

async function seedStudios() {
  try {
    await client.connect();

    const db = client.db(process.env.DB_NAME || "studiospace");

    const collection = db.collection("studios");

    await collection.deleteMany({ isDemo: true });

    const now = new Date();

    const demoStudios = studios.map((studio) => ({
      ...studio,
      isDemo: true,
      ownerId: "studiospace-demo-host",
      ownerEmail: "demo@studiospace.com",
      hostName: "StudioSpace Demo Host",
      createdAt: now,
      updatedAt: now,
    }));

    await collection.insertMany(demoStudios);

    console.log("Successfully added 5 sample studios!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await client.close();
  }
}

seedStudios();