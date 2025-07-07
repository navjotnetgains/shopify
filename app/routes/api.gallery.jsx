import { cors } from "remix-utils/cors";
import { json } from "@remix-run/node";
  import { v4 as uuidv4 } from "uuid";
  import path from "path";
  import fs from "fs/promises";
  import db from "../db.server";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const customerId = formData.get("customerId");
  const name = formData.get("name");
  const email = formData.get("email");
  const event = formData.get("event");
  const files = formData.getAll("images");

  // Validate input
  if (!customerId || !email || !event || files.length === 0) {
    return await cors(
      request,
      json({ success: false, error: "Missing required fields or files." }, { status: 400 }),
      {
        origin: "*",
        methods: ["POST"],
        allowedHeaders: ["Content-Type"]
      }
    );
  }

  try {
    // Create gallery record
    const newGallery = await db.galleryUpload.create({
      data: {
        id: uuidv4(),
        customerId,
        name,
        email,
        event,
        status: "pending",
      },
    });

    // Save each uploaded image
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      const imageUrl = `/uploads/${fileName}`;

      await db.image.create({
        data: {
          id: uuidv4(),
          url: imageUrl,
          galleryId: newGallery.id,
        },
      });
    }

    return await cors(
      request,
      json({ success: true, message: "Your gallery upload is in process." }),
      {
        origin: "*",
        methods: ["POST"],
        allowedHeaders: ["Content-Type"]
      }
    );
  } catch (error) {
    console.error("Upload gallery error:", error);
    return await cors(
      request,
      json({ success: false, error: "Server error. Please try again." }, { status: 500 }),
      {
        origin: "*",
        methods: ["POST"],
        allowedHeaders: ["Content-Type"]
      }
    );
  }
};