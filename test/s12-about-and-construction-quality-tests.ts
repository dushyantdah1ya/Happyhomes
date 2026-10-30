import assert from 'node:assert';
import { getRouteMetadata } from '../src/utils/routeMetadata.js';
import { NAVIGATION_REGISTRY } from '../src/config/navigation.js';
import { render } from '../src/entry.server.js';

async function runS12Tests() {
  console.log('=== S12 Correct Navigation & Content Test Suite ===\n');

  // TEST 1: Navigation Registry Structure
  console.log('1. Checking Navigation Registry Disclosures:');
  
  // 1a. About Us Disclosure
  const aboutUsGroup = NAVIGATION_REGISTRY.aboutUs;
  assert.strictEqual(aboutUsGroup.label, 'About Us');
  assert.strictEqual(aboutUsGroup.id, 'aboutUs');
  assert.strictEqual(aboutUsGroup.items.length, 2);
  
  const aboutItem = aboutUsGroup.items.find((i) => i.href === '/about');
  assert.ok(aboutItem, 'About Us group must include /about');
  assert.strictEqual(aboutItem?.label, 'About Happy Homes');

  const qualityItem = aboutUsGroup.items.find((i) => i.href === '/construction-quality');
  assert.ok(qualityItem, 'About Us group must include /construction-quality');
  assert.strictEqual(qualityItem?.label, 'Construction Quality');

  assert.strictEqual(NAVIGATION_REGISTRY.ourApproach.href, '/our-approach');
  assert.strictEqual(NAVIGATION_REGISTRY.ourApproach.label, 'Our Approach');
  console.log('  ✓ NAVIGATION_REGISTRY.aboutUs has About Happy Homes and Construction Quality, with Our Approach exposed directly');

  // 1b. Buyer Guide Group
  const buyerGuide = NAVIGATION_REGISTRY.buyerGuide;
  assert.strictEqual(buyerGuide.label, 'Buyer Guide');
  const contactItem = buyerGuide.items.find((i) => i.href === '/contact');
  assert.ok(contactItem, 'buyerGuide retains Contact the Builder (/contact)');
  console.log('  ✓ NAVIGATION_REGISTRY.buyerGuide retains Contact the Builder');

  // TEST 2: Route Metadata
  console.log('\n2. Checking Route Metadata:');
  const aboutMeta = getRouteMetadata('/about');
  assert.strictEqual(aboutMeta.statusCode, 200);
  assert.ok(aboutMeta.title.includes('About Happy Homes'));
  assert.strictEqual(aboutMeta.robots, 'noindex, nofollow');
  console.log('  ✓ /about route metadata returns 200, title, and robots policy');

  const qualityMeta = getRouteMetadata('/construction-quality');
  assert.strictEqual(qualityMeta.statusCode, 200);
  assert.ok(qualityMeta.title.includes('Construction Quality'));
  assert.strictEqual(qualityMeta.robots, 'noindex, nofollow');
  console.log('  ✓ /construction-quality route metadata returns 200, title, and robots policy');

  // TEST 3: SSR Markup Rendering
  console.log('\n3. Checking Server-Side Rendering (SSR) Content:');
  const aboutRender = render('/about');
  assert.strictEqual(aboutRender.statusCode, 200);
  assert.ok(aboutRender.html.includes('Residential builder'), 'SSR html should contain positive headline');
  assert.ok(!aboutRender.html.includes('Not ordinary listing brokers'), 'Must NOT contain contrastive broker slurs');
  assert.ok(!aboutRender.html.includes('1,200+ Homes Delivered'), 'Must NOT invent unconfirmed delivery volume counter');
  console.log('  ✓ SSR renders /about with positive introduction and without contrastive claims');

  const qualityRender = render('/construction-quality');
  assert.strictEqual(qualityRender.statusCode, 200);
  assert.ok(qualityRender.html.includes('What structural documentation is available'), 'SSR html must contain Question 1');
  assert.ok(qualityRender.html.includes('Which materials and finishes are included'), 'SSR html must contain Question 2');
  assert.ok(qualityRender.html.includes('What waterproofing and services-testing records'), 'SSR html must contain Question 3');
  assert.ok(qualityRender.html.includes('What inspection or handover documentation is available'), 'SSR html must contain Question 4');
  assert.ok(!qualityRender.html.includes('IS 456'), 'Must NOT contain prescriptive IS 456 reference');
  assert.ok(!qualityRender.html.includes('Fe-500D'), 'Must NOT contain prescriptive steel grade reference');
  assert.ok(!qualityRender.html.includes('48-hour standing water'), 'Must NOT contain prescriptive ponding test duration');
  assert.ok(!qualityRender.html.includes('30-year unbroken'), 'Must NOT contain prescriptive legal duration claim');
  console.log('  ✓ SSR renders /construction-quality with 4 non-prescriptive questions and without technical codes');

  console.log('\n=== All S12 Correction Tests Passed Successfully ===');
}

runS12Tests().catch((err) => {
  console.error('\n❌ Test failure:', err);
  process.exit(1);
});
