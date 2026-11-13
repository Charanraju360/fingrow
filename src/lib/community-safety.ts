/**
 * FinGrow Community Safety & Privacy Protection Utilities
 * Ensures private student data (emails, phone numbers, account numbers)
 * is never inadvertently leaked into public feeds.
 */

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const SSN_OR_ACCOUNT_REGEX = /\b(?:\d{3}-\d{2}-\d{4}|\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4})\b/;

export interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
}

/**
 * Validates text against personal privacy and sensitive student data leaks.
 */
export function checkCommunityContentSafety(text: string): SafetyCheckResult {
  if (!text) return { isSafe: true };

  if (EMAIL_REGEX.test(text)) {
    return {
      isSafe: false,
      reason: "Detected email address. To protect student privacy, please do not share personal contact emails in public discussions.",
    };
  }

  if (PHONE_REGEX.test(text)) {
    return {
      isSafe: false,
      reason: "Detected phone number. To protect student privacy, please do not share direct telephone numbers in public discussions.",
    };
  }

  if (SSN_OR_ACCOUNT_REGEX.test(text)) {
    return {
      isSafe: false,
      reason: "Detected potential account or ID number. Never share private identification or financial account numbers.",
    };
  }

  return { isSafe: true };
}

/**
 * Sanitizes author display to ensure no confidential student fields are exposed.
 */
export function sanitizePublicAuthor(author: {
  userId: string;
  name: string;
  role: string;
  email?: string;
}) {
  return {
    userId: author.userId,
    name: author.name,
    role: author.role,
  };
}
