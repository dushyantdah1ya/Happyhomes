import assert from 'node:assert';
import { getRouteMetadata } from '../src/utils/routeMetadata.js';
import { NAVIGATION_REGISTRY } from '../src/config/navigation.js';
import { render } from '../src/entry.server.js';
import { JAIPUR_LOCALITIES } from '../src/data/jaipurLocalities.js';

async function runS13Tests() {
  console.log('=== S13 Jaipur Locality Hub and Locality Guides Test Suite ===\n');

  // TEST 1: Navigation Registry Disclosures
  console.log('1. Checking Navigation Registry Disclosures:');
  const locGroup = (NAVIGATION_REGISTRY as any).locations;
  assert.ok(locGroup, 'NAVIGATION_REGISTRY.locations must exist');
  assert.strictEqual(locGroup.label, 'Locations');
  assert.strictEqual(locGroup.items.length, 2);
  assert.strictEqual(locGroup.items[0].href, '/jaipur-localities');
  assert.strictEqual(locGroup.items[1].href, '/jaipur-localities/jagatpura');
  console.log('  ✓ NAVIGATION_REGISTRY.locations has hub and active Jagatpura guide (Kusum Vihar withheld)');

  // TEST 2: Route Metadata
  console.log('\n2. Checking Route Metadata:');
  const hubMeta = getRouteMetadata('/jaipur-localities');
  assert.strictEqual(hubMeta.statusCode, 200);
  assert.ok(hubMeta.title.includes('Jaipur Localities'));
  assert.strictEqual(hubMeta.robots, 'noindex, nofollow');
  console.log('  ✓ /jaipur-localities route metadata returns 200, title, and robots policy');

  const jagatpuraMeta = getRouteMetadata('/jaipur-localities/jagatpura');
  assert.strictEqual(jagatpuraMeta.statusCode, 200);
  assert.ok(jagatpuraMeta.title.includes('Jagatpura'));
  console.log('  ✓ /jaipur-localities/jagatpura route metadata returns 200 and title');

  const kusumMeta = getRouteMetadata('/jaipur-localities/kusum-vihar');
  assert.strictEqual(kusumMeta.statusCode, 302);
  console.log('  ✓ /jaipur-localities/kusum-vihar route metadata returns 302 redirect (withheld)');

  // TEST 3: Locality Data & Nuances
  console.log('\n3. Checking Locality Data:');
  assert.ok(JAIPUR_LOCALITIES['jagatpura'], 'Jagatpura data exists');
  assert.ok(JAIPUR_LOCALITIES['kusum-vihar'], 'Kusum Vihar data exists');
  assert.strictEqual(JAIPUR_LOCALITIES['jagatpura'].filterUrl, '/developments?locality=Jagatpura');
  assert.strictEqual(JAIPUR_LOCALITIES['kusum-vihar'].filterUrl, '/developments?locality=Kusum+Vihar');
  console.log('  ✓ Filter URLs correctly route to catalogue with locality parameters');

  // TEST 4: SSR Rendering Checks
  console.log('\n4. Checking Server-Side Rendering (SSR) Content:');
  
  // Hub page
  const hubRender = render('/jaipur-localities', { developments: [] });
  assert.strictEqual(hubRender.statusCode, 200);
  assert.ok(hubRender.html.includes('Jaipur residential'), 'Hub contains main heading');
  assert.ok(hubRender.html.includes('Jagatpura'), 'Hub mentions Jagatpura');
  assert.ok(hubRender.html.includes('Kusum Vihar'), 'Hub mentions Kusum Vihar');
  assert.ok(hubRender.html.includes('Property-Specific Due Diligence'), 'Hub contains due diligence advisory');
  console.log('  ✓ SSR renders /jaipur-localities with advisory and locality cards');

  // Jagatpura guide page
  const jagatpuraRender = render('/jaipur-localities/jagatpura', { developments: [] });
  assert.strictEqual(jagatpuraRender.statusCode, 200);
  assert.ok(jagatpuraRender.html.includes('Jagatpura, Jaipur'), 'Jagatpura guide contains heading');
  assert.ok(jagatpuraRender.html.includes('Mahal Road'), 'Jagatpura mentions Mahal Road');
  assert.ok(
    jagatpuraRender.html.includes('No developments currently published in') &&
    jagatpuraRender.html.includes('Jagatpura'),
    'Honest empty state displayed when catalogue empty'
  );
  console.log('  ✓ SSR renders /jaipur-localities/jagatpura with honest empty state');

  // Kusum Vihar guide page (withheld redirect)
  const kusumRender = render('/jaipur-localities/kusum-vihar', { developments: [] });
  assert.strictEqual(kusumRender.statusCode, 302);
  console.log('  ✓ SSR handles withheld /jaipur-localities/kusum-vihar with 302 redirect');

  // TEST 5: Preservation Checks
  console.log('\n5. Checking Preservation of Restored Home & Existing Registry:');
  const homeRender = render('/', { developments: [] });
  assert.ok(homeRender.html.includes('Jaipur,<br class="hidden sm:inline" />Undisputed.') || homeRender.html.includes('Jaipur,'), 'Home hero intact');
  assert.ok(homeRender.html.includes('Explore Our Developments'), 'Home hero CTA button intact');
  console.log('  ✓ Home hero and core branding remain intact');

  console.log('\n=== All S13 Tests Passed Successfully ===');
}

runS13Tests().catch((err) => {
  console.error('\n❌ Test Failure:', err);
  process.exit(1);
});
