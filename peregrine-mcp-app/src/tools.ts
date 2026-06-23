import { z } from 'zod';
import { buildWizardResource } from './ui-resource.js';
import type { WizardState } from './state.js';

// ----- Tool input schema -----

const ProposalSchema = z.object({
  mainObjective: z.string().optional(),
  focusPoints: z.string().optional(),
  category: z.string().optional(),
  articleProposal: z.string().optional(),
}).optional();

const SkillsSchema = z.object({
  disabled: z.array(z.string()).optional(),
  custom: z.array(z.object({ name: z.string() })).optional(),
}).optional();

const BriefSchema = z.object({
  text: z.string().optional(),
  status: z.enum(['idle', 'loading', 'ready']).optional(),
}).optional();

const PageSchema = z.object({
  items: z.array(z.object({
    type: z.enum(['TEXT', 'IMG']),
    text: z.string(),
  })).optional(),
  url: z.string().optional(),
  app_url: z.string().optional(),
  status: z.enum(['idle', 'streaming', 'complete']).optional(),
}).optional();

export const ShowBlogWizardSchema = z.object({
  currentStep: z.number().int().optional(),
  proposal: ProposalSchema,
  skills: SkillsSchema,
  brief: BriefSchema,
  page: PageSchema,
});

// ----- Tool handler -----

export async function handleShowBlogWizard(args: z.infer<typeof ShowBlogWizardSchema>) {
  const state: WizardState = args ?? {};
  const resource = buildWizardResource(state);

  // Lead text varies a little by step so the chat thread reads sensibly even
  // for hosts that don't render UI resources.
  const text = pickLeadText(state);

  return {
    content: [
      { type: 'text', text } as const,
      resource,
    ],
  };
}

function pickLeadText(state: WizardState): string {
  if (state.page?.status === 'complete' && state.page.url) {
    return `Page is live: ${state.page.url}`;
  }
  if (state.brief?.status === 'ready' && state.brief.text) {
    return 'Brief generated. Review it in the wizard and proceed to create the page when ready.';
  }
  if (state.currentStep == null || state.currentStep < 0) {
    return 'Opening the blog wizard. Fill in the article proposal to begin.';
  }
  return 'Updating the blog wizard.';
}
