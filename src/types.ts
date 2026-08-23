export interface Step1Data {
  linkedinUrl: string;
  fullName: string;
  email: string;
}

export const emptyStep1Data: Step1Data = {
  linkedinUrl: "",
  fullName: "",
  email: "",
};

export interface Step2Data {
  primaryRole: string;
  expertiseAreas: string[]; // exactly 3
  hoursPerWeek: string;
  compensationDetails: string;
  primaryIndustries: string[];
}

export const emptyStep2Data: Step2Data = {
  primaryRole: "",
  expertiseAreas: [],
  hoursPerWeek: "",
  compensationDetails: "",
  primaryIndustries: [],
};
