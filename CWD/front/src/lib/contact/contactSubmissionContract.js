export const CONTACT_SUBMISSION_SOURCE = Object.freeze({
  HOME: "HOME",
  CONTACT_PAGE: "CONTACT_PAGE",
});

export const CONTACT_TURNSTILE_ACTION = Object.freeze({
  HOME: "contact_home",
  CONTACT_PAGE: "contact_page",
});

export const CONTACT_FORM_FIELD_MAPS = Object.freeze({
  CONTACT_PAGE: Object.freeze({
    name: "nombre",
    email: "email",
    phone: "whatsapp",
    companyOrProject: "empresaProyecto",
    message: "mensaje",
  }),
  HOME: Object.freeze({
    name: "name",
    email: "email",
    phone: "whatsapp",
    companyOrProject: "companyProject",
    message: "message",
  }),
});

export const CONTACT_FIELD_LIMITS = Object.freeze({
  name: 120,
  email: 254,
  phone: 40,
  companyOrProject: 160,
  message: 4000,
  turnstileToken: 2048,
});

const SUPPORTED_LOCALES = new Set(["es", "en", "it"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_PATTERN = /^[+()\d\s.-]+$/;
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

export function trimToNull(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue === "" ? null : trimmedValue;
}

function getFieldName(fieldMap, canonicalFieldName) {
  return fieldMap?.[canonicalFieldName] || CONTACT_FORM_FIELD_MAPS.CONTACT_PAGE[canonicalFieldName];
}

export function normalizeContactFormData(
  formData,
  fieldMap = CONTACT_FORM_FIELD_MAPS.CONTACT_PAGE
) {
  return {
    name: trimToNull(formData?.[getFieldName(fieldMap, "name")]) ?? "",
    email: trimToNull(formData?.[getFieldName(fieldMap, "email")]) ?? "",
    phone: trimToNull(formData?.[getFieldName(fieldMap, "phone")]),
    companyOrProject: trimToNull(formData?.[getFieldName(fieldMap, "companyOrProject")]),
    message: trimToNull(formData?.[getFieldName(fieldMap, "message")]) ?? "",
  };
}

export function validateContactFormData(
  formData,
  fieldMap = CONTACT_FORM_FIELD_MAPS.CONTACT_PAGE
) {
  const normalized = normalizeContactFormData(formData, fieldMap);
  const errors = {};
  const nameField = getFieldName(fieldMap, "name");
  const emailField = getFieldName(fieldMap, "email");
  const phoneField = getFieldName(fieldMap, "phone");
  const companyProjectField = getFieldName(fieldMap, "companyOrProject");
  const messageField = getFieldName(fieldMap, "message");

  if (!normalized.name) {
    errors[nameField] = "requiredName";
  } else if (normalized.name.length > CONTACT_FIELD_LIMITS.name) {
    errors[nameField] = "nameTooLong";
  }

  if (!normalized.email) {
    errors[emailField] = "requiredEmail";
  } else if (normalized.email.length > CONTACT_FIELD_LIMITS.email) {
    errors[emailField] = "emailTooLong";
  } else if (!EMAIL_PATTERN.test(normalized.email)) {
    errors[emailField] = "invalidEmail";
  }

  if (normalized.phone) {
    if (normalized.phone.length > CONTACT_FIELD_LIMITS.phone) {
      errors[phoneField] = "phoneTooLong";
    } else {
      const digits = normalized.phone.replace(/\D/g, "");
      const invalidDigitsCount =
        digits.length < MIN_PHONE_DIGITS || digits.length > MAX_PHONE_DIGITS;

      if (!WHATSAPP_PATTERN.test(normalized.phone) || invalidDigitsCount) {
        errors[phoneField] = "invalidWhatsApp";
      }
    }
  }

  if (
    normalized.companyOrProject &&
    normalized.companyOrProject.length > CONTACT_FIELD_LIMITS.companyOrProject
  ) {
    errors[companyProjectField] = "companyProjectTooLong";
  }

  if (!normalized.message) {
    errors[messageField] = "requiredMessage";
  } else if (normalized.message.length > CONTACT_FIELD_LIMITS.message) {
    errors[messageField] = "messageTooLong";
  }

  return {
    normalized,
    errors,
  };
}

export function buildContactSubmissionPayload({
  formData,
  locale,
  source,
  turnstileToken,
  fieldMap = CONTACT_FORM_FIELD_MAPS.CONTACT_PAGE,
}) {
  const { normalized, errors } = validateContactFormData(formData, fieldMap);

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      reason: "invalid_form_data",
      errors,
    };
  }

  const normalizedTurnstileToken = trimToNull(turnstileToken);

  if (!normalizedTurnstileToken) {
    return {
      ok: false,
      reason: "missing_turnstile_token",
    };
  }

  if (normalizedTurnstileToken.length > CONTACT_FIELD_LIMITS.turnstileToken) {
    return {
      ok: false,
      reason: "invalid_turnstile_token",
    };
  }

  return {
    ok: true,
    payload: {
      source,
      locale: SUPPORTED_LOCALES.has(locale) ? locale : "es",
      name: normalized.name,
      email: normalized.email,
      phone: normalized.phone,
      companyOrProject: normalized.companyOrProject,
      message: normalized.message,
      turnstileToken: normalizedTurnstileToken,
    },
  };
}

export function getContactSubmissionFingerprint(payload) {
  return JSON.stringify({
    source: payload.source,
    locale: payload.locale,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    companyOrProject: payload.companyOrProject,
    message: payload.message,
  });
}
