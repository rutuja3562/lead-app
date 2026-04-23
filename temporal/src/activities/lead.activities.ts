import { log } from '@temporalio/activity';

// ─── Activity Input Types ─────────────────────────────────────────────────────

export interface NotifyLeadCreatedInput {
  leadId: string;
  mobileNumber: string;
}

export interface SendWelcomeSmsInput {
  mobileNumber: string;
  leadId: string;
}

export interface AssignLeadInput {
  leadId: string;
}

export interface CibilCheckInput {
  leadId: string;
}

export interface NotifySubmittedInput {
  leadId: string;
}

export interface SendEmailInput {
  leadId: string;
}

export interface EscalateInput {
  leadId: string;
  elapsedDays: number;
  completedTabs: string[];
}

// ─── Activity Interface ───────────────────────────────────────────────────────

export interface LeadActivities {
  notifyLeadCreated(input: NotifyLeadCreatedInput): Promise<void>;
  sendWelcomeSms(input: SendWelcomeSmsInput): Promise<void>;
  assignLeadToOfficer(input: AssignLeadInput): Promise<void>;
  runCibilCheck(input: CibilCheckInput): Promise<void>;
  notifyLeadSubmitted(input: NotifySubmittedInput): Promise<void>;
  sendSubmissionEmail(input: SendEmailInput): Promise<void>;
  escalateIfStale(input: EscalateInput): Promise<void>;
}

// ─── Activity Implementations ─────────────────────────────────────────────────

// Pure helper: build welcome SMS text
const buildWelcomeSmsText = (leadId: string): string =>
  `Welcome! Your loan application (ID: ${leadId.slice(0, 8).toUpperCase()}) has been received. Our officer will contact you shortly.`;

// Pure helper: build escalation message
const buildEscalationMessage = (
  leadId: string,
  elapsedDays: number,
  completedTabs: string[],
): string =>
  `Lead ${leadId} is stale after ${elapsedDays} days. ` +
  `Completed tabs: ${completedTabs.length > 0 ? completedTabs.join(', ') : 'none'}.`;

// Pure helper: simple round-robin officer assignment
const pickOfficer = (leadId: string): string => {
  const officers = ['officer_1', 'officer_2', 'officer_3', 'officer_4'];
  const hash = leadId
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return officers[hash % officers.length];
};

export const createLeadActivities = (): LeadActivities => ({
  async notifyLeadCreated({ leadId, mobileNumber }) {
    log.info('notifyLeadCreated', { leadId, mobileNumber });
    // In production: push notification to CRM / internal dashboard
    // e.g. await crmClient.createLead({ leadId, mobileNumber });
    console.log(`[ACTIVITY] Lead created: ${leadId}`);
  },

  async sendWelcomeSms({ mobileNumber, leadId }) {
    log.info('sendWelcomeSms', { mobileNumber, leadId });
    const text = buildWelcomeSmsText(leadId);
    // In production: call SMS gateway API (MSG91, Fast2SMS, Twilio, etc.)
    console.log(`[ACTIVITY] SMS to ${mobileNumber}: ${text}`);
  },

  async assignLeadToOfficer({ leadId }) {
    log.info('assignLeadToOfficer', { leadId });
    const officer = pickOfficer(leadId);
    // In production: update DB assignment + notify officer via push/email
    console.log(`[ACTIVITY] Lead ${leadId} assigned to ${officer}`);
  },

  async runCibilCheck({ leadId }) {
    log.info('runCibilCheck', { leadId });
    // In production: call CIBIL / CRIF bureau API
    // Simulate a delay for external API call
    await new Promise((res) => setTimeout(res, 500));
    console.log(`[ACTIVITY] CIBIL check initiated for lead ${leadId}`);
  },

  async notifyLeadSubmitted({ leadId }) {
    log.info('notifyLeadSubmitted', { leadId });
    // In production: push to dashboard + notify branch manager
    console.log(`[ACTIVITY] Lead ${leadId} submitted — notifying team`);
  },

  async sendSubmissionEmail({ leadId }) {
    log.info('sendSubmissionEmail', { leadId });
    // In production: send email via SendGrid / AWS SES
    console.log(`[ACTIVITY] Submission confirmation email sent for ${leadId}`);
  },

  async escalateIfStale({ leadId, elapsedDays, completedTabs }) {
    const message = buildEscalationMessage(leadId, elapsedDays, completedTabs);
    log.warn('escalateIfStale', { leadId, elapsedDays, completedTabs });
    // In production: send escalation alert to branch manager / admin
    console.log(`[ACTIVITY] ESCALATION: ${message}`);
  },
});
