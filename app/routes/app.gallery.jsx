import { useNavigate } from '@remix-run/react';
import { useState } from 'react';
import { useEffect } from 'react';
import db from '../db.server'
import { json } from '@remix-run/node'; 
import { useLoaderData } from '@remix-run/react';
import Login from './app.login';

export async function loader() {
  const galleries = await db.galleryUpload.findMany({
    where: { status: "approved" },
    include: { images: true }, 
  });
  console.log("Loaded approved galleries with images:", galleries);
  return json({ galleries });
}
const AppGallery = () => {
      const { galleries } = useLoaderData();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('customertoken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []); 

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
    navigate('/app/upload-gallery');
  };

  const handleUploadClick = () => {
    if (isLoggedIn) {
      navigate('/app/upload-gallery');
    } else {
      setShowLogin(true);
    }
  };

  return (
    <>
      <button onClick={handleUploadClick}>Upload Gallery</button>
      {showLogin && <Login onLoginSuccess={handleLoginSuccess} />}

       <div style={{ marginTop: "2rem" }}>
        <h2>Approved Galleries</h2>

        {galleries.length === 0 ? (
          <p>No approved galleries found.</p>
        ) : (
          galleries.map((gallery) => (
            <div key={gallery.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "20px" }}>
              {/* <p><strong>{gallery.name}</strong> ({gallery.email})</p>
              <p>Event: {gallery.event}</p> */}

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                {gallery.images.map((img) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt={`Uploaded image ${img.id}`}
                    style={{ width: "150px", borderRadius: "8px" }}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default AppGallery;
