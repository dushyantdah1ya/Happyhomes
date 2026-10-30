import assert from 'node:assert';
import { getTrustedOrigin, normalizeCanonicalPath, toAbsoluteCanonicalUrl, PRE_LAUNCH_ROBOTS } from '../src/utils/seoConfig.js';
import { getRouteMetadata } from '../src/utils/routeMetadata.js';
import { safeJsonSerialize } from '../src/utils/safeJson.js';
import { generateSitemapXml, ENABLED_STATIC_PUBLIC_ROUTES } from '../src/server/sitemapService.js';
import { render } from '../src/entry.server.js';

async function runS18Tests() {
  console.log('=== S18 Technical SEO and Link Previews Test Suite ===\n');

  // TEST 1: Origin Resolution & Canonical Path Normalization
  console.log('1. Checking Origin Resolution & Path Normalization:');
  assert.strictEqual(normalizeCanonicalPath('/'), '/');
  assert.strictEqual(normalizeCanonicalPath(''), '/');
  assert.strictEqual(normalizeCanonicalPath('/developments?locality=Jagatpura&category=villas'), '/developments');
  assert.strictEqual(normalizeCanonicalPath('/contact?intent=visit#enquiry'), '/contact');
  assert.strictEqual(normalizeCanonicalPath('/contact?intent=video#enquiry'), '/contact');
  assert.strictEqual(normalizeCanonicalPath('/residential-plots'), '/plots');
  assert.strictEqual(normalizeCanonicalPath('/completed'), '/completed-projects');
  assert.strictEqual(normalizeCanonicalPath('/completed-developments'), '/completed-projects');
  assert.strictEqual(normalizeCanonicalPath('/about/'), '/about');

  const testOrigin = 'https://preview.example.com';
  assert.strictEqual(toAbsoluteCanonicalUrl('/developments', testOrigin), 'https://preview.example.com/developments');
  assert.strictEqual(toAbsoluteCanonicalUrl('/', testOrigin), 'https://preview.example.com');
  assert.strictEqual(toAbsoluteCanonicalUrl('/about', null), null, 'Must return null when origin is omitted');
  console.log('  ✓ Canonical path normalization and absolute URL building pass');

  // TEST 2: Hostile String Escaping & Safe JSON Serialization
  console.log('\n2. Checking Safe JSON Serializer:');
  const hostilePayload = {
    tag: '</script><script>alert("xss")</script>',
    quote: '"quoted text"',
    ampersand: 'A & B',
    lineTerminator: 'line\u2028terminator\u2029test',
  };
  const serialized = safeJsonSerialize(hostilePayload);
  assert.ok(!serialized.includes('</script>'), 'Must not contain unescaped closing script tags');
  assert.ok(serialized.includes('\\u003c/script\\u003e'), 'Must escape < and >');
  assert.ok(!serialized.includes('\u2028'), 'Must escape \\u2028');
  assert.ok(!serialized.includes('\u2029'), 'Must escape \\u2029');
  console.log('  ✓ Safe JSON serialization prevents script-injection and unicode anomalies');

  // TEST 3: Pre-Launch Route Metadata for All Enabled Routes
  console.log('\n3. Checking Route Metadata across Enabled Routes:');
  const testRoutes = [
    { path: '/', titlePart: 'Happy Homes' },
    { path: '/developments', titlePart: 'Developments Portfolio' },
    { path: '/villas', titlePart: 'Villas' },
    { path: '/independent-floors', titlePart: 'Independent Floors' },
    { path: '/plots', titlePart: 'Residential Plots' },
    { path: '/completed-projects', titlePart: 'Completed Developments' },
    { path: '/about', titlePart: 'About Happy Homes' },
    { path: '/construction-quality', titlePart: 'Construction Quality' },
    { path: '/jaipur-localities', titlePart: 'Jaipur Localities' },
    { path: '/jaipur-localities/jagatpura', titlePart: 'Jagatpura Locality Guide' },
    { path: '/buying-process', titlePart: 'Buying a Home' },
    { path: '/nri-buyers', titlePart: 'Remote & NRI Buyers' },
    { path: '/faqs', titlePart: 'Frequently Asked Questions' },
    { path: '/contact', titlePart: 'Contact Project Desk' },
  ];

  for (const r of testRoutes) {
    const meta = getRouteMetadata(r.path, { explicitOrigin: testOrigin });
    assert.strictEqual(meta.statusCode, 200, `${r.path} must return 200`);
    assert.strictEqual(meta.robots, PRE_LAUNCH_ROBOTS, `${r.path} must enforce pre-launch noindex, nofollow`);
    assert.ok(meta.title.includes(r.titlePart), `${r.path} title must include "${r.titlePart}"`);
    assert.ok(meta.description.length >= 50, `${r.path} description must be substantial`);
    assert.ok(meta.canonicalPath, `${r.path} must have canonicalPath`);
    assert.ok(meta.jsonLd, `${r.path} must provide structured data`);
  }
  console.log('  ✓ All 14 enabled public routes have valid metadata, canonical paths, and schema');

  // TEST 4: Unknown and Redirect Route Protections
  console.log('\n4. Checking Unknown and Withheld Route Protections:');
  const unknownMeta = getRouteMetadata('/developments/non-existent-or-draft-slug');
  assert.strictEqual(unknownMeta.statusCode, 404);
  assert.strictEqual(unknownMeta.canonicalPath, undefined, 'Unknown slug must NEVER be canonicalized to Home or another property');

  const kusumMeta = getRouteMetadata('/jaipur-localities/kusum-vihar');
  assert.strictEqual(kusumMeta.statusCode, 302);
  assert.strictEqual(kusumMeta.canonicalPath, undefined, 'Redirect routes must not emit canonicalPath');
  console.log('  ✓ Unknown slugs return 404 without canonical; Kusum Vihar redirects with 302');

  // TEST 5: Isolated Populated Development Fixture
  console.log('\n5. Checking Development Detail Metadata with Populated Fixture:');
  const fixtureDev = {
    id: 'fixture-villa-01',
    slug: 'villa-astitva',
    name: 'Villa Astitva',
    type: 'Turnkey Luxury Villa',
    status: 'published' as const,
    availability: 'Available',
    shortDescription: 'Signature 4-BHK turnkey luxury villa in Jagatpura, Jaipur.',
    priceAmount: 18500000,
    locality: 'Jagatpura',
    location: { address: 'Plot 45, Near Bombay Hospital, Jagatpura, Jaipur' },
    photos: [{ secureUrl: 'https://images.example.com/astitva-cover.jpg' }],
    // Private draft/audit fields that must NOT leak into metadata
    auditNote: 'CONFIDENTIAL OWNER COST ANALYSIS',
    internalDraftState: 'PRIVATE_NOTES',
  };

  const devMeta = getRouteMetadata('/developments/villa-astitva', {
    currentDevelopment: fixtureDev,
    explicitOrigin: testOrigin,
  });
  assert.strictEqual(devMeta.statusCode, 200);
  assert.strictEqual(devMeta.title, 'Villa Astitva | Happy Homes Jaipur');
  assert.strictEqual(devMeta.canonicalPath, '/developments/villa-astitva');
  assert.strictEqual(devMeta.ogImage, 'https://images.example.com/astitva-cover.jpg');
  assert.ok(devMeta.ogImageAlt?.includes('Villa Astitva'));
  assert.ok(devMeta.jsonLd, 'Must generate RealEstateListing schema');
  const schemaStr = JSON.stringify(devMeta.jsonLd);
  assert.ok(!schemaStr.includes('CONFIDENTIAL'), 'Must never leak internal audit fields into schema');
  assert.ok(schemaStr.includes('18500000'), 'Must include price in schema');
  assert.ok(schemaStr.includes('https://schema.org/InStock'), 'Available development marked InStock');

  // Sold status check
  const soldDev = { ...fixtureDev, availability: 'Sold' };
  const soldMeta = getRouteMetadata('/developments/villa-astitva', {
    currentDevelopment: soldDev,
    explicitOrigin: testOrigin,
  });
  const soldSchemaStr = JSON.stringify(soldMeta.jsonLd);
  assert.ok(soldSchemaStr.includes('https://schema.org/SoldOut'), 'Sold development marked SoldOut');
  console.log('  ✓ Published development fixture generates valid metadata, cover image, and schema without leaking private fields');

  // TEST 6: Isolated Sitemap Generator
  console.log('\n6. Checking Sitemap Generator with Isolated Launch Fixture:');
  const mockDevelopments = [
    {
      slug: 'villa-astitva',
      status: 'published' as const,
      availability: 'available',
      updatedAt: '2026-09-15T10:00:00.000Z',
    },
    {
      slug: 'manor-sold',
      status: 'published' as const,
      availability: 'sold', // Legitimate published sold property must be included
      updatedAt: '2026-08-10T10:00:00.000Z',
    },
    {
      slug: 'private-draft-villa',
      status: 'draft' as const, // Must be excluded
      updatedAt: '2026-10-01T10:00:00.000Z',
    },
    {
      slug: 'archived-plot',
      status: 'archived' as const, // Must be excluded
      updatedAt: '2026-07-01T10:00:00.000Z',
    },
  ];

  const xml = generateSitemapXml({
    origin: testOrigin,
    publicDevelopments: mockDevelopments,
  });

  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'Valid XML header');
  assert.ok(xml.includes('<loc>https://preview.example.com</loc>'), 'Home included');
  assert.ok(xml.includes('<loc>https://preview.example.com/developments</loc>'), 'Developments included');
  assert.ok(xml.includes('<loc>https://preview.example.com/developments/villa-astitva</loc>'), 'Published dev included');
  assert.ok(xml.includes('<loc>https://preview.example.com/developments/manor-sold</loc>'), 'Published sold dev included');
  assert.ok(xml.includes('<lastmod>2026-09-15</lastmod>'), 'Valid historical lastmod included');

  // Verify exclusions
  assert.ok(!xml.includes('private-draft-villa'), 'Private draft must be excluded');
  assert.ok(!xml.includes('archived-plot'), 'Archived record must be excluded');
  assert.ok(!xml.includes('/admin'), 'Admin routes must be excluded');
  assert.ok(!xml.includes('/api'), 'API routes must be excluded');
  assert.ok(!xml.includes('/kusum-vihar'), 'Withheld Kusum Vihar must be excluded');
  assert.ok(!xml.includes('/completed<'), 'Redirect aliases must be excluded');

  // Error handling
  assert.throws(() => {
    generateSitemapXml({ origin: '', publicDevelopments: [] });
  }, /origin/);
  console.log('  ✓ Sitemap generator produces valid XML, correct exclusions, and historical lastmod formatting');

  // TEST 7: SSR Rendering and Headers
  console.log('\n7. Checking SSR Render Output:');
  const homeRender = render('/', { explicitOrigin: testOrigin });
  assert.strictEqual(homeRender.statusCode, 200);
  assert.strictEqual(homeRender.meta.robots, 'noindex, nofollow');
  assert.ok(homeRender.html.includes('Jaipur,'), 'Home rendered');

  const qualityRender = render('/construction-quality', { explicitOrigin: testOrigin });
  assert.strictEqual(qualityRender.statusCode, 200);
  assert.ok(qualityRender.html.includes('Construction Quality'), 'Construction quality rendered');

  console.log('\n=== All S18 Tests Passed Successfully ===');
}

runS18Tests().catch((err) => {
  console.error('\n❌ Test Failure:', err);
  process.exit(1);
});
