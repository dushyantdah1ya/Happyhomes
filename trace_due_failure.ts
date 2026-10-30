import { listEnquiries } from './src/server/enquiryService.ts';

async function traceDueFailure() {
  console.log('--- Tracing Due Follow-up Failure ---');
  try {
    const result = await listEnquiries({ followUp: 'due' });
    console.log('SUCCESS: Due query returned', result.enquiries.length, 'records.');
  } catch (err: any) {
    console.error('FAILURE: Due query failed:');
    console.error('Code:', err.code);
    console.error('Message:', err.message);
  }

  console.log('\n--- Tracing Overdue Failure (for comparison) ---');
  try {
    const result = await listEnquiries({ followUp: 'overdue' });
    console.log('SUCCESS: Overdue query returned', result.enquiries.length, 'records.');
  } catch (err: any) {
    console.error('FAILURE: Overdue query failed:');
    console.error('Code:', err.code);
    console.error('Message:', err.message);
  }
}

traceDueFailure();
