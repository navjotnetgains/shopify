import React, { useState, useEffect, useRef } from 'react';
import { Form, useActionData, json } from "@remix-run/react";
import { useNavigate } from '@remix-run/react';
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import db from "../db.server";
import { FormLayout, Button, DropZone } from "@shopify/polaris";


export const action = async ({ request }) => {
  const formData = await request.formData();
  const customerId = formData.get("customerId");
  const name = formData.get("name");
  const email = formData.get("email");
  const event = formData.get("event");
  const files = formData.getAll("images");

  if (!files || files.length === 0) {
    return json({ error: "No files uploaded" }, { status: 400 });
  }


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

  return json({ success: true, message: "Your request is in process." });
};

export default function AppUploadGallery() {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [form, setForm] = useState({ event: "" });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const actionData = useActionData();

  const token = localStorage.getItem("customertoken");
  const navigate = useNavigate();


  useEffect(() => {
  if (actionData?.success) {
    navigate('/app/gallery'); e
  }
}, [actionData, navigate]);

  const fetchCustomerDetails = async (token) => {
    const query = `
      {
        customer(customerAccessToken: "${token}") {
          id
          firstName
          lastName
          email
        }
      }
    `;

    const res = await fetch('https://netgains28.myshopify.com/api/2025-04/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': 'e667bc10b211d8bc9d30c62d919ba267',
      },
      body: JSON.stringify({ query }),
    });

    const json = await res.json();
    const customer = json.data.customer;

    if (customer) {
      setCustomerName(`${customer.firstName} ${customer.lastName}`);
      setCustomerEmail(customer.email);
      setCustomerId(customer.id);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCustomerDetails(token);
    }
  }, [token]);

  const handleDropZoneDrop = (_dropFiles, acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      console.log("Rejected files:", rejectedFiles);
    }
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      acceptedFiles.forEach((file) => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  return (
    <Form method="POST" encType="multipart/form-data">
      <FormLayout>
        <p>Hello {customerName}</p>

        <input type="hidden" name="customerId" value={customerId} />
        <input type="hidden" name="name" value={customerName} />
        <input type="hidden" name="email" value={customerEmail} />

        <select
          name="event"
          value={form.event}
          onChange={(e) => setForm((prev) => ({ ...prev, event: e.target.value }))}
          required
        >
          <option value="">Select Event</option>
          <option value="wedding">Wedding</option>
          <option value="birthday">Birthday</option>
          <option value="corporate">Corporate</option>
        </select>

        <DropZone
          accept="image/*"
          onDrop={handleDropZoneDrop}
          allowMultiple
          label="Add images or drop files to upload"
        >
          {selectedFiles.length > 0 ? (
            <div>
              {selectedFiles.map((file, index) => (
                <p key={index}>{file.name}</p>
              ))}
            </div>
          ) : (
            <DropZone.FileUpload actionTitle="Add files" />
          )}
        </DropZone>

        <input
          type="file"
          name="images"
          multiple
          ref={fileInputRef}
          style={{ display: "none" }}
        />

        <Button submit primary>
          Submit
        </Button>

        {actionData?.message && <p>{actionData.message}</p>}
      </FormLayout>
    </Form>
  );
}
