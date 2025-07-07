import { useLoaderData, Form } from '@remix-run/react';
import { json } from '@remix-run/node';
import { Page, DataTable, Thumbnail, Button } from '@shopify/polaris';
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

  if (!id || !status) {
    return json({ success: false, error: "Missing id or status" }, { status: 400 });
  }

  await db.galleryUpload.update({
    where: { id },
    data: { status },
  });

  return json({ success: true });
}

export default function AdminImages() {
  const { galleries } = useLoaderData();

  const rows = galleries.map((gallery) => [
    gallery.customerId.split('/').pop(),
    gallery.event,
    gallery.status,
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {gallery.images.map((image) => (
        <Thumbnail
          key={image.id}
          source={image.url}
          alt="uploaded"
          size="small"
        />
      ))}
    </div>,
    <div style={{ display: 'flex', gap: '8px' }}>
      <Form method="POST">
        <input type="hidden" name="id" value={gallery.id} />
        <input type="hidden" name="status" value="approved" />
        <Button submit primary>
          Approve
        </Button>
      </Form>
      <Form method="POST">
        <input type="hidden" name="id" value={gallery.id} />
        <input type="hidden" name="status" value="declined" />
        <Button submit destructive>
          Decline
        </Button>
      </Form>
    </div>,
  ]);

  return (
    <Page title="Admin Gallery Approvals">
      <DataTable
        columnContentTypes={[
          'text',
          'text',
          'text',
          'text',
          'text',
          'text',
          'text',
        ]}
        headings={[
          'Customer ID',
          'Event',
          'Status',
          'Images',
          'Actions',
        ]}
        rows={rows}
      />
    </Page>
  );
}
