import { useLoaderData, useFetcher } from '@remix-run/react';
import { json } from '@remix-run/node';
import { Page, DataTable, Thumbnail, Button, Badge, Modal, TextContainer } from '@shopify/polaris';
import { useState } from 'react';
import db from '../db.server';
import { LegacyStack } from '@shopify/polaris';

export async function loader() {
  const galleries = await db.galleryUpload.findMany({
    include: {
      images: true,
      event: true,
    },
  });
  return json({ galleries });
}

export async function action({ request }) {
  const formData = await request.formData();
  const id = formData.get("id");
  const status = formData.get("status");
  const type = formData.get("type");
  const actionType = formData.get("actionType");

  if (actionType === "delete" && id) {
    await db.image.deleteMany({ where: { galleryId: id } });
    await db.galleryUpload.delete({ where: { id } });
    return json({ success: true });
  }

  if (!id || !status || !type) {
    return json({ success: false, error: "Missing id, status, or type" }, { status: 400 });
  }

  if (type === "gallery") {
    await db.galleryUpload.update({
      where: { id },
      data: { status },
    });
  } else if (type === "image") {
    await db.image.update({
      where: { id },
      data: { status },
    });
  }

  return json({ success: true });
}

export default function AdminImages() {
  const { galleries } = useLoaderData();
  const [activeGallery, setActiveGallery] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const fetcher = useFetcher();

  const openModal = (gallery, index) => {
    setActiveGallery(gallery);
    setActiveImageIndex(index);
  };

  const rows = galleries.map((gallery) => {
    const firstTwoImages = gallery.images.slice(0, 2);
    const remainingCount = gallery.images.length - 2;

    return [
      gallery.customerId.split('/').pop(),
      gallery.event ? gallery.event.name : "N/A",
      <Badge status={
        gallery.status === "approved" ? "success"
        : gallery.status === "declined" ? "critical"
        : "attention"
      }>
        {gallery.status}
      </Badge>,
      <LegacyStack spacing="tight" wrap>
        {firstTwoImages.map((img, index) => (
          <div key={img.id} style={{ textAlign: 'center' }}>
            <Thumbnail source={img.url} alt="uploaded" size="small" />
            <div style={{ marginTop: '4px' }}>
              <Button size="slim" onClick={() => openModal(gallery, index)}>View</Button>
            </div>
          </div>
        ))}
        {remainingCount > 0 && (
          <Button onClick={() => openModal(gallery, 2)}>
            +{remainingCount} more...
          </Button>
        )}
      </LegacyStack>,
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <fetcher.Form method="POST">
          <input type="hidden" name="type" value="gallery" />
          <input type="hidden" name="id" value={gallery.id} />
          <input type="hidden" name="status" value="approved" />
          <Button submit primary>Approve</Button>
        </fetcher.Form>
        <fetcher.Form method="POST">
          <input type="hidden" name="type" value="gallery" />
          <input type="hidden" name="id" value={gallery.id} />
          <input type="hidden" name="status" value="declined" />
          <Button submit destructive>Decline</Button>
        </fetcher.Form>
        <fetcher.Form method="POST">
          <input type="hidden" name="actionType" value="delete" />
          <input type="hidden" name="id" value={gallery.id} />
          <Button submit destructive>Delete</Button>
        </fetcher.Form>
      </div>,
    ];
  });

  const handleApproveImage = (imageId) => {
    fetcher.submit(
      { type: 'image', id: imageId, status: 'approved' },
      { method: 'POST' }
    );
  };

  const handleDeclineImage = (imageId) => {
    fetcher.submit(
      { type: 'image', id: imageId, status: 'declined' },
      { method: 'POST' }
    );
  };

  const nextImage = () => {
    if (activeGallery && activeImageIndex < activeGallery.images.length - 1) {
      setActiveImageIndex(activeImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (activeGallery && activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };

  const currentImage = activeGallery?.images[activeImageIndex];

  return (
    <Page title="Admin Gallery Approvals">
      <DataTable
        columnContentTypes={['text', 'text', 'text', 'text', 'text']}
        headings={['Customer ID', 'Event', 'Gallery Status', 'Images', 'Actions']}
        rows={rows}
      />

      {currentImage && (
        <Modal
          open
          onClose={() => setActiveGallery(null)}
          title="Image Details"
          primaryAction={{
            content: 'Approve',
            onAction: () => handleApproveImage(currentImage.id),
          }}
          secondaryActions={[
            {
              content: 'Decline',
              destructive: true,
              onAction: () => handleDeclineImage(currentImage.id),
            },
          ]}
        >
          <Modal.Section>
            <TextContainer>
              <div style={{ textAlign: 'center' }}>
                <img
                  src={currentImage.url}
                  alt="Full size"
                  style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
                />
                <div style={{ marginTop: '12px' }}>
                  <Badge status={
                    currentImage.status === "approved" ? "success"
                    : currentImage.status === "declined" ? "critical"
                    : "attention"
                  }>
                    {currentImage.status}
                  </Badge>
                </div>

                {activeGallery.images.length > 1 && (
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={prevImage} disabled={activeImageIndex === 0}>Previous</Button>
                    <Button onClick={nextImage} disabled={activeImageIndex === activeGallery.images.length - 1}>Next</Button>
                  </div>
                )}
              </div>
            </TextContainer>
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}
