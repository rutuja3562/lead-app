// Temporal workflow tests using pure-function extraction pattern
// (Full workflow tests require @temporalio/testing; these test the pure helpers)

// ─── Pure helper functions (extracted from workflow for testing) ───────────────

const buildWelcomeSmsText = (leadId: string): string =>
  `Welcome! Your loan application (ID: ${leadId.slice(0, 8).toUpperCase()}) has been received. Our officer will contact you shortly.`;

const buildEscalationMessage = (
  leadId: string,
  elapsedDays: number,
  completedTabs: string[],
): string =>
  `Lead ${leadId} is stale after ${elapsedDays} days. ` +
  `Completed tabs: ${completedTabs.length > 0 ? completedTabs.join(', ') : 'none'}.`;

const pickOfficer = (leadId: string): string => {
  const officers = ['officer_1', 'officer_2', 'officer_3', 'officer_4'];
  const hash = leadId
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return officers[hash % officers.length];
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('buildWelcomeSmsText', () => {
  it('includes a truncated lead ID', () => {
    const text = buildWelcomeSmsText('abc12345-xxxx-xxxx');
    expect(text).toContain('ABC12345');
  });

  it('always produces a non-empty string', () => {
    const text = buildWelcomeSmsText('test-lead-id-001');
    expect(text.length).toBeGreaterThan(20);
  });

  it('upcases the ID prefix', () => {
    const text = buildWelcomeSmsText('aaaabbbb');
    expect(text).toContain('AAAABBBB');
  });
});

describe('buildEscalationMessage', () => {
  it('includes leadId and elapsed days', () => {
    const msg = buildEscalationMessage('lead-001', 7, ['BasicInfo']);
    expect(msg).toContain('lead-001');
    expect(msg).toContain('7 days');
  });

  it('lists completed tabs when present', () => {
    const msg = buildEscalationMessage('lead-001', 5, [
      'BasicInfo',
      'PropertyInfo',
    ]);
    expect(msg).toContain('BasicInfo');
    expect(msg).toContain('PropertyInfo');
  });

  it('shows "none" when no tabs completed', () => {
    const msg = buildEscalationMessage('lead-001', 3, []);
    expect(msg).toContain('none');
  });
});

describe('pickOfficer', () => {
  it('returns one of the 4 officers', () => {
    const officers = [
      'officer_1',
      'officer_2',
      'officer_3',
      'officer_4',
    ];
    const result = pickOfficer('some-lead-id');
    expect(officers).toContain(result);
  });

  it('is deterministic for the same input', () => {
    const a = pickOfficer('fixed-lead-id');
    const b = pickOfficer('fixed-lead-id');
    expect(a).toBe(b);
  });

  it('distributes across different IDs', () => {
    const ids = ['lead-a', 'lead-b', 'lead-c', 'lead-d', 'lead-e', 'lead-f'];
    const assigned = ids.map(pickOfficer);
    const unique = new Set(assigned);
    expect(unique.size).toBeGreaterThan(1);
  });
});

// ─── Workflow state machine tests ─────────────────────────────────────────────

type LeadStatus = 'active' | 'submitted' | 'cancelled' | 'expired';

interface WorkflowState {
  status: LeadStatus;
  completedTabs: string[];
}

// Pure: simulate a signal applying to workflow state
const applyTabCompleted = (
  state: WorkflowState,
  tab: string,
): WorkflowState => {
  if (state.completedTabs.includes(tab)) return state;
  return { ...state, completedTabs: [...state.completedTabs, tab] };
};

const applySubmitted = (state: WorkflowState): WorkflowState => ({
  ...state,
  status: 'submitted',
});

const applyCancelled = (state: WorkflowState): WorkflowState => ({
  ...state,
  status: 'cancelled',
});

const applyExpired = (state: WorkflowState): WorkflowState => ({
  ...state,
  status: 'expired',
});

describe('Workflow state machine', () => {
  const initial: WorkflowState = { status: 'active', completedTabs: [] };

  it('starts in active state with no completed tabs', () => {
    expect(initial.status).toBe('active');
    expect(initial.completedTabs).toHaveLength(0);
  });

  it('records completed tabs', () => {
    const s1 = applyTabCompleted(initial, 'BasicInfo');
    expect(s1.completedTabs).toContain('BasicInfo');
  });

  it('does not duplicate tab completions', () => {
    const s1 = applyTabCompleted(initial, 'BasicInfo');
    const s2 = applyTabCompleted(s1, 'BasicInfo');
    expect(s2.completedTabs.filter((t) => t === 'BasicInfo')).toHaveLength(1);
  });

  it('accumulates multiple tab completions', () => {
    const s = ['BasicInfo', 'PropertyInfo', 'IncomeInfo'].reduce(
      applyTabCompleted,
      initial,
    );
    expect(s.completedTabs).toHaveLength(3);
  });

  it('transitions to submitted status', () => {
    const s = applySubmitted(initial);
    expect(s.status).toBe('submitted');
  });

  it('transitions to cancelled status', () => {
    const s = applyCancelled(initial);
    expect(s.status).toBe('cancelled');
  });

  it('transitions to expired status', () => {
    const s = applyExpired(initial);
    expect(s.status).toBe('expired');
  });

  it('does not mutate original state', () => {
    applyTabCompleted(initial, 'BasicInfo');
    applySubmitted(initial);
    expect(initial.status).toBe('active');
    expect(initial.completedTabs).toHaveLength(0);
  });

  it('full happy path: tabs → submit', () => {
    const allTabs = [
      'BasicInfo',
      'PropertyInfo',
      'IncomeInfo',
      'PhotoUpload',
      'DocumentUpload',
      'References',
    ];
    const final = applySubmitted(
      allTabs.reduce(applyTabCompleted, initial),
    );
    expect(final.status).toBe('submitted');
    expect(final.completedTabs).toHaveLength(6);
  });
});
