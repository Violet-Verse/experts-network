import type { Step1Data, Step2Data } from "../types";

export function wordCount(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

export type Step1Errors = Partial<Record<keyof Step1Data, string>>;
export type Step2Errors = Partial<Record<keyof Step2Data, string>>;

export function validateStep1(data: Step1Data): Step1Errors {
  const errors: Step1Errors = {};
  if (!data.linkedinUrl.trim()) {
    errors.linkedinUrl = "Please share your LinkedIn URL.";
  } else if (!/^https?:\/\/.+/i.test(data.linkedinUrl.trim())) {
    errors.linkedinUrl = "Please enter a valid URL (starting with http:// or https://).";
  }
  if (!data.fullName.trim()) errors.fullName = "Please enter your full name.";
  if (!data.email.trim() || !data.email.includes("@")) {
    errors.email = "Please enter a valid email address.";
  }
  return errors;
}

export function validateStep2(data: Step2Data): Step2Errors {
  const errors: Step2Errors = {};
  if (!data.primaryRole) errors.primaryRole = "Please select a primary role.";
  if (data.expertiseAreas.length !== 3) {
    errors.expertiseAreas = "Please choose exactly 3 areas of expertise.";
  }
  const bioWords = wordCount(data.bio);
  if (bioWords < 100 || bioWords > 150) {
    errors.bio = "Your bio should be 100–150 words.";
  }
  if (!data.hoursPerWeek) errors.hoursPerWeek = "Please select your availability.";
  if (!data.compensationDetails) errors.compensationDetails = "Please select a rate band.";
  if (data.primaryIndustries.length === 0) {
    errors.primaryIndustries = "Please select at least one primary industry.";
  }
  return errors;
}
