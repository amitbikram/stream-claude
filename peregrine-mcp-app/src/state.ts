// Wizard state shape — mirrors the data-state contract documented in
// stream-blog-claude/instructions.md and the widget's IIFE state.

export interface Proposal {
  mainObjective?: string;
  focusPoints?: string;
  category?: string;
  articleProposal?: string;
}

export interface CustomSkill {
  name: string;
  // body is intentionally absent from round-tripped state — the widget keeps
  // bodies in sessionStorage. Models passing custom skills via this tool
  // should NOT include `content` because URL length limits.
}

export interface PageItem {
  type: 'TEXT' | 'IMG';
  text: string;
}

export interface WizardState {
  currentStep?: number; // -1 = welcome, 0..3 = wizard steps
  proposal?: Proposal;
  skills?: {
    disabled?: string[];
    custom?: CustomSkill[];
  };
  brief?: {
    text?: string;
    status?: 'idle' | 'loading' | 'ready';
  };
  page?: {
    items?: PageItem[];
    url?: string;
    app_url?: string;
    status?: 'idle' | 'streaming' | 'complete';
  };
}
