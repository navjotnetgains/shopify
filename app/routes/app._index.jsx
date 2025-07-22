// app/routes/app._index.jsx
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { Page, Card, Button, Text, Layout, Badge, Icon } from '@shopify/polaris';
import { PersonIcon, ImageIcon, ThumbsUpIcon, ThumbsDownIcon } from '@shopify/polaris-icons';
import { ClientOnly } from 'remix-utils/client-only';
import db from '../db.server';

function ThemeEditorButton() {
  const handleOpenThemeEditor = () => {
    try {
      // Get the shop origin from the URL
      const url = new URL(window.location.href);
      const shop = url.searchParams.get('shop');
      const host = url.searchParams.get('host');
      
      if (host) {
        // For embedded apps - use window.top to break out of iframe
        window.top.location.href = `https://${shop}/admin/themes/current/editor?context=apps`;
      } else {
        // For non-embedded apps
        window.location.href = `https://${shop}/admin/themes/current/editor?context=apps`;
      }
    } catch (error) {
      console.error('Error opening theme editor:', error);
      // Final fallback - will prompt user to login if needed
      const shop = new URL(window.location.href).searchParams.get('shop');
      window.open(`https://${shop}/admin/themes/current/editor?context=apps`, '_blank');
    }
  };

  return (
    <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(to bottom, #3d3c3c, #111111)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }} onClick={handleOpenThemeEditor} primary>
      Activate extensions
    </button>
  );
}

export const loader = async ({ request }) => {
  const uniqueCustomers = await db.galleryUpload.findMany({
    distinct: ['email'],
    select: { email: true },
  });

  const submittedImages = await db.image.count();
  const approvedImages = await db.image.count({ where: { status: 'approved' } });
  const declinedImages = await db.image.count({ where: { status: 'declined' } });

  const setting = await db.setting.findUnique({ where: { id: 'global-setting' } });

  return json({
    numberOfCustomers: uniqueCustomers.length,
    numberOfImagesApproved: approvedImages,
    numberOfImagesDeclined: declinedImages,
    numberOfSubmittedImages: submittedImages,
    expiryEnabled: setting?.addEventEnabled ?? false,
  });
};

export default function Dashboard() {
  const {
    numberOfCustomers,
    numberOfImagesApproved,
    numberOfImagesDeclined,
    numberOfSubmittedImages,
    expiryEnabled,
  } = useLoaderData();

  return (
    <Page>
      <Layout>

        {/* App Setup Steps */}
        <Layout.Section>
          <Card>
            <div style={{ padding: '20px' }}>
              <Text variant="headingMd">App Setup Steps</Text>
              <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
                <li>
                  <Text as="span" variant="headingMd" fontSize='20px' fontWeight="bold">Enable the app</Text>
                  <p >Go to Theme Customizer, App Embeds, and enable the Upload and Show Gallery Blocks.</p>
               <ClientOnly fallback={<Button loading>Loading...</Button>}>
              {() => <ThemeEditorButton />}
            </ClientOnly>
                </li>
                <li style={{ marginTop: '10px' }}>
                  <Text as="span" fontWeight="bold">Approve Gallery</Text>
                  <p>Approve or decline uploaded images from the Approval page.</p>
                   <Link to="/app/customer" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(to bottom, #3d3c3c, #111111)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}>
                    Go to Approvals
                  </button>
                </Link>
                </li>
                <li style={{ marginTop: '10px' }}>
                  <Text as="span" fontWeight="bold">Configure Gallery Settings</Text>
                  <p>Enable expiry if you want to show only expiry products for upload, or disable to show all products.</p>
               <Link to="/app/AddEvent" style={{ textDecoration: 'none' }}>
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(to bottom, #3d3c3c, #111111)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}>
                      Configure
                    </button>
                  </Link>
                </li>
              </ol>
            </div>
          </Card>
        </Layout.Section>

        {/* Create campaign section */}
        <Layout.Section>
          <Card sectioned title="Create campaign">
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', width: '100%' }}>
              
              {/* Approvals */}
              <div style={{
                flex: '1',
                border: '1px solid #e1e3e5',
                borderRadius: '8px',
                padding: '20px',
                background: 'white',
              }}>
                <Text variant="headingSm">Approvals</Text>
                <p style={{ margin: '10px 0' }}>Approve or decline uploaded items from customers</p>
                <Link to="/app/customer" style={{ textDecoration: 'none' }}>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(to bottom, #3d3c3c, #111111)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}>
                    Go to Approvals
                  </button>
                </Link>
              </div>

              {/* Settings */}
              <div style={{
                flex: '1',
                border: '1px solid #e1e3e5',
                borderRadius: '8px',
                padding: '20px',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <Text variant="headingSm">Settings</Text>
                <p style={{ margin: '10px 0' }}>Manage app settings including expiry options</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Link to="/app/AddEvent" style={{ textDecoration: 'none' }}>
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(to bottom, #3d3c3c, #111111)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}>
                      Configure
                    </button>
                  </Link>
                  <Badge tone={expiryEnabled ? 'success' : 'critical'}>
                    {expiryEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>

            </div>
          </Card>
        </Layout.Section>

        {/* Metrics section */}
        <Layout.Section>
          <div style={{
            display: 'flex',
            gap: '20px',
            marginTop: '20px',
            flexWrap: 'wrap',
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e1e3e5',
          }}>
            {[
              { title: 'Number of Customers', value: numberOfCustomers, icon: PersonIcon },
              { title: 'Images Approved', value: numberOfImagesApproved, icon: ThumbsUpIcon },
              { title: 'Images Declined', value: numberOfImagesDeclined, icon: ThumbsDownIcon },
              { title: 'Submitted Images', value: numberOfSubmittedImages, icon: ImageIcon },
            ].map((metric, idx) => (
              <div key={idx} style={{
                flex: '1 1 200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                background: '#f9fafb',
                border: '1px solid #e1e3e5',
                borderRadius: '8px',
                padding: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon source={metric.icon} color="base" />
                  <p style={{ fontSize: '13px', margin: '5px 0' }}>{metric.title}</p>
                </div>
                <p style={{ fontSize: '23px', fontWeight: 'bold', margin: '5px 0' }}>{metric.value}</p>
              </div>
            ))}
          </div>
        </Layout.Section>

        {/* Extension Suggestion */}
     <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd">Enable customer upload and gallery display</Text>
            <p style={{ margin: '10px 0' }}>
              To allow customers to upload images and display them in the gallery, you need to enable both blocks in your theme editor.
            </p>
            <ClientOnly fallback={<Button loading>Loading...</Button>}>
              {() => <ThemeEditorButton />}
            </ClientOnly>
          </Card>
        </Layout.Section>
        {/* Review Section */}
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd">How would you rate your experience</Text>
            <p style={{ margin: '10px 0' }}>We hope you're enjoying our app! If you have a moment, please leave us a review.</p>
            <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(to bottom, #3d3c3c, #111111)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }} primary>Leave a review</button>
          </Card>
        </Layout.Section>

      </Layout>
    </Page>
  );
}