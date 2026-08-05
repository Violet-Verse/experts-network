export interface ApplicationFormData {
  // Part 1 — Tell Us About Your Expertise
  primaryRole: string;
  expertiseAreas: string[]; // exactly 3
  bio: string;
  portfolioLinks: string;

  // Part 1 — Network Fit
  preferredProjectTypes: string[];
  primaryIndustries: string[];
  hoursPerWeek: string;
  preferredContractLength: string;
  compensationType: string;
  compensationDetails: string;
  futureOpportunities: string;

  // Part 2 — Experience
  companiesWorkedWith: string;
  aiExperience: string;
  technicalSkills: string;
  languages: string;
  researchMethods: string;

  // Part 3 — Specializations
  specializations: string[];

  // Part 4 — Matching
  excitingProjects: string;
  deepIndustries: string;
  longTermInterest: string;
  remoteOnly: string;
  timeZone: string;
  earliestAvailability: string;

  // Contact (needed to actually match someone to opportunities)
  fullName: string;
  email: string;
}

export const emptyFormData: ApplicationFormData = {
  primaryRole: "",
  expertiseAreas: [],
  bio: "",
  portfolioLinks: "",

  preferredProjectTypes: [],
  primaryIndustries: [],
  hoursPerWeek: "",
  preferredContractLength: "",
  compensationType: "",
  compensationDetails: "",
  futureOpportunities: "",

  companiesWorkedWith: "",
  aiExperience: "",
  technicalSkills: "",
  languages: "",
  researchMethods: "",

  specializations: [],

  excitingProjects: "",
  deepIndustries: "",
  longTermInterest: "",
  remoteOnly: "",
  timeZone: "",
  earliestAvailability: "",

  fullName: "",
  email: "",
};
