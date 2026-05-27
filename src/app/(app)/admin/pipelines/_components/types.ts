interface SkillUsage {
  plugin: { id: string; name: string; category: string };
}

export interface Skill {
  id: string;
  name: string;
  description?: string | null;
  model: string;
  maxTokens: number;
  outputSchema: Record<string, unknown> | null;
  promptKey: string;
  promptTemplate?: string | null;
  defaultInstructions?: string | null;
  isActive: boolean;
  pluginSkills?: SkillUsage[];
}

// Shape returned by GET /admin/plugins/:id/skills
interface PluginSkill {
  id: string;
  pluginId: string;
  skillId: string;
  order: number;
  skill: Skill;
}

type PluginCategory = "management" | "deal" | "opportunity" | "wealthos" | "technicals";

export interface Plugin {
  id: string;
  name: string;
  category: PluginCategory;
  description: string;
}

export interface NewSkillForm {
  name: string;
  description: string;
  model: string;
  maxTokens: number;
  promptKey: string;
  promptTemplate: string;
  defaultInstructions: string;
  outputSchema: string;
  isActive: boolean;
}

export const DEFAULT_NEW_SKILL: NewSkillForm = {
  name: "",
  description: "",
  model: "anthropic/claude-sonnet-4-6",
  maxTokens: 16000,
  promptKey: "",
  promptTemplate: "",
  defaultInstructions: "",
  outputSchema: "",
  isActive: true,
};

export const CATEGORY_LABELS: Record<PluginCategory, string> = {
  management: "Management",
  deal: "Deal",
  opportunity: "Opportunity",
  wealthos: "WealthOS",
  technicals: "Technicals",
};
