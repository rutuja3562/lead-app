import { Worker, NativeConnection } from '@temporalio/worker';
import { createLeadActivities } from '../activities/lead.activities';

async function run() {
  const address = process.env.TEMPORAL_ADDRESS ?? 'localhost:7233';
  console.log(`[Worker] Connecting to Temporal at ${address}`);

  const connection = await NativeConnection.connect({ address });

  const worker = await Worker.create({
    connection,
    namespace: 'default',
    taskQueue: 'lead-onboarding',
    // Path to compiled workflow bundle or source
    workflowsPath: require.resolve('../workflows/leadOnboarding.workflow'),
    activities: createLeadActivities(),
  });

  console.log('[Worker] Lead onboarding worker started');
  await worker.run();
}

run().catch((err) => {
  console.error('[Worker] Fatal error:', err);
  process.exit(1);
});
