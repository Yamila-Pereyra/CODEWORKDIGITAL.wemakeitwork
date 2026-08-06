export const CONTACT_SUBMISSION_SOURCE = Object.freeze({
  HOME: "HOME",
  CONTACT_PAGE: "CONTACT_PAGE",
});

export const CONTACT_TURNSTILE_ACTION = Object.freeze({
  HOME: "contact_home",
  CONTACT_PAGE: "contact_page",
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

export function normalizeContactFormData(formData) {
  return {
    name: trimToNull(formData?.nombre) ?? "",
    email: trimToNull(formData?.email) ?? "",
    phone: trimToNull(formData?.whatsapp),
    companyOrProject: trimToNull(formData?.empresaProyecto),
    message: trimToNull(formData?.mensaje) ?? "",
  };
}

export function validateContactFormData(formData) {
  const normalized = normalizeContactFormData(formData);
  const errors = {};

  if (!normalized.name) {
    errors.nombre = "requiredName";
  } else if (normalized.name.length > CONTACT_FIELD_LIMITS.name) {
    errors.nombre = "nameTooLong";
  }

  if (!normalized.email) {
    errors.email = "requiredEmail";
  } else if (normalized.email.length > CONTACT_FIELD_LIMITS.email) {
    errors.email = "emailTooLong";
  } else if (!EMAIL_PATTERN.test(normalized.email)) {
    errors.email = "invalidEmail";
  }

  if (normalized.phone) {
    if (normalized.phone.length > CONTACT_FIELD_LIMITS.phone) {
      errors.whatsapp = "phoneTooLong";
    } else {
      const digits = normalized.phone.replace(/\D/g, "");
      const invalidDigitsCount =
        digits.length < MIN_PHONE_DIGITS || digits.length > MAX_PHONE_DIGITS;

      if (!WHATSAPP_PATTERN.test(normalized.phone) || invalidDigitsCount) {
        errors.whatsapp = "invalidWhatsApp";
      }
    }
  }

  if (
    normalized.companyOrProject &&
    normalized.companyOrProject.length > CONTACT_FIELD_LIMITS.companyOrProject
  ) {
    errors.empresaProyecto = "companyProjectTooLong";
  }

  if (!normalized.message) {
    errors.mensaje = "requiredMessage";
  } else if (normalized.message.length > CONTACT_FIELD_LIMITS.message) {
    errors.mensaje = "messageTooLong";
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
}) {
  const { normalized, errors } = validateContactFormData(formData);

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
