import {
  proxyActivities,
  defineSignal,
  defineQuery,
  setHandler,
  condition,
  sleep,
  log,
} from '@temporalio/workflow';
import type { LeadActivities } from '../activities/lead.activities';

// ─── Activities proxy ─────────────────────────────────────────────────────────

const {
  notifyLeadCreated,
  sendWelcomeSms,
  assignLeadToOfficer,
  runCibilCheck,
  notifyLeadSubmitted,
  sendSubmissionEmail,
  escalateIfStale,
} = proxyActivities<LeadActivities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 3,
    initialInterval: '1 second',
    backoffCoefficient: 2,
  },
});

// ─── Signals ──────────────────────────────────────────────────────────────────

export const leadSubmittedSignal = defineSignal<[{ leadId: string }]>(
  'leadSubmitted',
);

export const tabCompletedSignal = defineSignal<
  [{ leadId: string; tab: string }]
>('tabCompleted');

export const cancelLeadSignal = defineSignal<[{ reason: string }]>(
  'cancelLead',
);

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getLeadStatusQuery = defineQuery<string>('getLeadStatus');

// ─── Workflow input/output types ──────────────────────────────────────────────

export interface LeadWorkflowInput {
  leadId: string;
  mobileNumber: string;
}

export interface LeadWorkflowResult {
  leadId: string;
  status: 'submitted' | 'cancelled' | 'expired';
  completedTabs: string[];
}

// ─── Lead Onboarding Workflow ─────────────────────────────────────────────────

export async function leadOnboardingWorkflow(
  input: LeadWorkflowInput,
): Promise<LeadWorkflowResult> {
  const { leadId, mobileNumber } = input;

  let status: string = 'active';
  let cancelReason = '';
  const completedTabs: string[] = [];

  // ── Setup signal handlers ──────────────────────────────────────────────────

  setHandler(leadSubmittedSignal, ({ leadId: id }) => {
    log.info('Lead submitted signal received', { leadId: id });
    status = 'submitted';
  });

  setHandler(tabCompletedSignal, ({ tab }) => {
    log.info('Tab completed', { leadId, tab });
    if (!completedTabs.includes(tab)) {
      completedTabs.push(tab);
    }
  });

  setHandler(cancelLeadSignal, ({ reason }) => {
    log.warn('Lead cancelled', { leadId, reason });
    status = 'cancelled';
    cancelReason = reason;
  });

  setHandler(getLeadStatusQuery, () => status);

  // ── Step 1: Notify lead created ────────────────────────────────────────────
  await notifyLeadCreated({ leadId, mobileNumber });
  await sendWelcomeSms({ mobileNumber, leadId });

  log.info('Lead onboarding started', { leadId });

  // ── Step 2: Assign to loan officer ────────────────────────────────────────
  await assignLeadToOfficer({ leadId });

  // ── Step 3: Wait for completion or timeout (30 days) ──────────────────────
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const START_TIME = Date.now();

  // Stale escalation: escalate every 3 days if incomplete
  const escalationCheckEvery = 3 * 24 * 60 * 60 * 1000; // 3 days

  while (status === 'active') {
    // Wait for submission, cancellation, or 3-day check interval
    const resolved = await condition(
      () => status !== 'active',
      escalationCheckEvery,
    );

    if (!resolved && status === 'active') {
      // 3-day interval fired without submission — escalate
      const elapsedDays = Math.floor(
        (Date.now() - START_TIME) / (24 * 60 * 60 * 1000),
      );
      log.warn('Lead stale — escalating', { leadId, elapsedDays });
      await escalateIfStale({ leadId, elapsedDays, completedTabs });

      // Check overall timeout
      if (Date.now() - START_TIME >= THIRTY_DAYS_MS) {
        status = 'expired';
        log.warn('Lead expired after 30 days', { leadId });
      }
    }
  }

  // ── Step 4: Handle final state ─────────────────────────────────────────────
  if (status === 'submitted') {
    await notifyLeadSubmitted({ leadId });
    await sendSubmissionEmail({ leadId });
    await runCibilCheck({ leadId });
    log.info('Lead onboarding complete', { leadId });
  }

  return {
    leadId,
    status: status as LeadWorkflowResult['status'],
    completedTabs,
  };
}
