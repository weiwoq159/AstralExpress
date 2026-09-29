export const moduleRoadmapNames = [
  "Tribios",
  "Aglaea",
  "Cifera",
  "Cerydra",
  "Helektra",
  "Hyacinthia",
  "Castorice",
  "Cyrene",
  "Evernight",
  "Permansor",
] as const;

export type ModuleRoadmapName = (typeof moduleRoadmapNames)[number];

export type ModuleDefinition = {
  name: string;
  title: string;
  path: string;
  purpose: string;
  tags: readonly string[];
  tagline: string;
  summary: string;
  description: string;
  slogan: string;
  cover: string;
  order: number;
};
