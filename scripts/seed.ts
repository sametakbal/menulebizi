/**
 * Seed script for development — populates Firebase with demo data.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Make sure environment variables for Firebase Admin are set in .env.local
 * (the script loads them via dotenv).
 */

import { config } from "dotenv";
config({ path: ".env" });

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const app =
    getApps().length === 0
        ? initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            }),
        })
        : getApps()[0];

const db = getFirestore(app);
const auth = getAuth(app);

async function seed() {
    console.log("🌱 Seeding database...");

    // Create demo restaurant
    const restaurantRef = await db.collection("restaurants").add({
        name: "Demo Restoran",
        slug: "demo",
        phone: "0555 123 45 67",
        createdAt: new Date().toISOString(),
    });

    console.log(`  ✅ Restaurant: ${restaurantRef.id}`);

    // Create demo user in Firebase Auth (email: demo@menulebizi.com, password: demo123)
    let firebaseUser;
    try {
        firebaseUser = await auth.getUserByEmail("demo@menulebizi.com");
    } catch {
        firebaseUser = await auth.createUser({
            email: "demo@menulebizi.com",
            password: "demo123",
            displayName: "Demo Kullanıcı",
        });
    }

    const userRef = await db.collection("users").add({
        uid: firebaseUser.uid,
        name: "Demo Kullanıcı",
        email: "demo@menulebizi.com",
        restaurantId: restaurantRef.id,
        createdAt: new Date().toISOString(),
    });

    console.log(`  ✅ User: ${userRef.id}`);

    // Categories and items
    const categories = [
        {
            name: "Başlangıçlar",
            items: [
                { name: "Mercimek Çorbası", description: "Geleneksel tarif", price: 45 },
                { name: "Humus", description: "Tahin ve nohut ezmesi", price: 55 },
                { name: "Sigara Böreği", description: "El açması, 4 adet", price: 60 },
            ],
        },
        {
            name: "Ana Yemekler",
            items: [
                { name: "Adana Kebap", description: "Acılı kıyma kebap, lavaş ile", price: 180 },
                { name: "Tavuk Şiş", description: "Marine edilmiş tavuk", price: 150 },
                { name: "Karışık Izgara", description: "Adana, tavuk, pirzola", price: 250 },
                { name: "Pide (Kıymalı)", description: "Fırın taze", price: 120 },
            ],
        },
        {
            name: "Salatalar",
            items: [
                { name: "Çoban Salata", description: "Domates, salatalık, biber", price: 50 },
                { name: "Mevsim Salata", description: "Yeşillikler", price: 45 },
            ],
        },
        {
            name: "İçecekler",
            items: [
                { name: "Ayran", description: "", price: 20 },
                { name: "Kola", description: "330ml", price: 30 },
                { name: "Türk Çayı", description: "Bardak", price: 15 },
                { name: "Su", description: "500ml", price: 10 },
            ],
        },
        {
            name: "Tatlılar",
            items: [
                { name: "Künefe", description: "Hatay usulü", price: 90 },
                { name: "Sütlaç", description: "Fırın sütlaç", price: 55 },
                { name: "Baklava", description: "4 dilim, fıstıklı", price: 80 },
            ],
        },
    ];

    for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        const catRef = await db.collection("categories").add({
            name: cat.name,
            order: i,
            restaurantId: restaurantRef.id,
            createdAt: new Date().toISOString(),
        });

        console.log(`  ✅ Category: ${cat.name}`);

        for (let j = 0; j < cat.items.length; j++) {
            const item = cat.items[j];
            await db.collection("items").add({
                name: item.name,
                description: item.description,
                price: item.price,
                categoryId: catRef.id,
                restaurantId: restaurantRef.id,
                isAvailable: true,
                order: j,
                createdAt: new Date().toISOString(),
            });
        }
    }

    console.log("\n🎉 Seed complete!");
    console.log("   Login: demo@menulebizi.com / demo123");
    console.log("   Menu:  http://localhost:3000/r/demo");
}

seed().catch(console.error);
