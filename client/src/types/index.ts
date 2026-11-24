export interface DocumentationData {
  featureName: string;
  featureDescription: string;
  assumptions: string[];
  dependencies: string[];
  risks: string[];
  userBenefits: string[];
  conditionsOfSatisfaction: string[];
  successMetrics: string[];
  openQuestions: string[];
  completenessScore: number;
  missingInformation: string[];
  keyDecisions: string[];
}

export interface MockupData {
  tsxCode: string;
  cssCode?: string;
}
