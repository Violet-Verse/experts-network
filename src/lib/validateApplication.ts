import type { ApplicationFormData } from "../types";

export function wordCount(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

export type ValidationErrors = Partial<Record<keyof ApplicationFormData, string>>;

export function validateApplication(data: ApplicationFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.primaryRole) errors.primaryRole = "Please select a primary role.";
  if (data.expertiseAreas.length !== 3) {
    errors.expertiseAreas = "Please choose exactly 3 areas of expertise.";
  }
  const bioWords = wordCount(data.bio);
  if (bioWords < 100 || bioWords > 150) {
    errors.bio = "Your bio should be 100–150 words.";
  }
  if (!data.portfolioLinks.trim()) {
    errors.portfolioLinks = "Please share at least one portfolio link.";
  }
  if (data.preferredProjectTypes.length === 0) {
    errors.preferredProjectTypes = "Please select at least one preferred project type.";
  }
  if (data.primaryIndustries.length === 0) {
    errors.primaryIndustries = "Please select at least one primary industry.";
  }
  if (!data.fullName.trim()) errors.fullName = "Please enter your full name.";
  if (!data.email.trim() || !data.email.includes("@")) {
    errors.email = "Please enter a valid email address.";
  }

  return errors;
}
