import { useLoaderData, Form } from '@remix-run/react';
import { json } from '@remix-run/node';
import db from '../db.server';

export async function loader() {
  const galleries = await db.galleryUpload.findMany({
    include: { images: true },
  });
  return json({ galleries });
}

export async function action({ request }) {
  const formData = await request.formData();
  const id = formData.get("id");
  const status = formData.get("status");

  await db.galleryUpload.update({
    where: { id },
    data: { status },
  });

  return json({ success: true });
}

export default function AdminImages() {
  const { galleries } = useLoaderData();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Gallery Approvals</h1>

      {galleries.map((gallery) => (
        <div key={gallery.id} className="border p-4 mb-6 rounded-xl shadow">
          <p><strong>Customer ID:</strong> {gallery.customerId}</p>
          <p><strong>Name:</strong> {gallery.name}</p>
          <p><strong>Email:</strong> {gallery.email}</p>
          <p><strong>Event:</strong> {gallery.event}</p>
          <p><strong>Status:</strong> {gallery.status}</p>

          <div className="grid grid-cols-3 gap-4 mt-4">
            {gallery.images.map((image) => (
              <div key={image.id} className="border p-2 rounded">
                <img src={image.url} alt="uploaded" width="100" className="mb-2"/>
              </div>
            ))}
          </div>

          <Form method="POST" className="mt-4">
            <input type="hidden" name="id" value={gallery.id} />
            <button
              type="submit"
              name="status"
              value="approved"
              className="bg-green-600 text-white px-3 py-1 rounded mr-2"
            >
              Approve Gallery
            </button>
            <button
              type="submit"
              name="status"
              value="declined"
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Decline Gallery
            </button>
          </Form>
        </div>
      ))}
    </div>
  );
}
