import { json } from '@remix-run/node';
import { cors } from 'remix-utils/cors';
import db from '../db.server';

export async function loader({ request }) {
  try {
    const galleries = await db.galleryUpload.findMany({
      where: { status: "approved" },
      include: { images: true },
    });

    return await cors(
      request,
      json({ galleries }),
      {
        // Allow requests from your Shopify store and local development
        origin: [
          "https://netgains28.myshopify.com",
          "http://localhost:*",
          "https://operational-trivia-aluminum-attitudes.trycloudflare.com"
        ],
        methods: ["GET"],
        allowedHeaders: ["Content-Type"],
        maxAge: 600 // Cache CORS preflight for 10 minutes
      }
    );
  } catch (error) {
    console.error("Loader error:", error);
    return await cors(
      request,
      json({ error: "Internal Server Error" }, { status: 500 }),
      {
        origin: "*",
        methods: ["GET"],
        allowedHeaders: ["Content-Type"]
      }
    );
  }
}