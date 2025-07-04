// 

// app/routes/gallery.ts
import { json } from '@remix-run/node';
import db from '../db.server';

export async function loader() {
  const galleries = await db.gallery.findMany({
    include: { images: true },
  });

  return json({ galleries });
}
