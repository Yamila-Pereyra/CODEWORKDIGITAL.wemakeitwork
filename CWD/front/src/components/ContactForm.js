"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import ContactFeedbackPanel from "@/components/contact/ContactFeedbackPanel";
import TurnstileWidget from "@/components/contact/TurnstileWidget";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CONTACT_FIELD_LIMITS,
  CONTACT_SUBMISSION_SOURCE,
  CONTACT_TURNSTILE_ACTION,
  buildContactSubmissionPayload,
  getContactSubmissionFingerprint,
  validateContactFormData,
} from "@/lib/contact/contactSubmissionContract";
import {
  getPublicContactApiBaseUrl,
  getPublicTurnstileSiteKey,
  submitContactSubmission,
} from "@/lib/contact/contactSubmissionClient";
import { translations } from "@/translations";

const INITIAL_FORM = Object.freeze({
  nombre: "",
  email: "",
  whatsapp: "",
  empresaProyecto: "",
  mensaje: "",
});

const FIELD_IDS = Object.freeze({
  nombre: "contacto-nombre",
  email: "contacto-email",
  whatsapp: "contacto-whatsapp",
  empresaProyecto: "contacto-empresa-proyecto",
  mensaje: "contacto-mensaje",
});

const FIELD_NAMES = Object.keys(FIELD_IDS);

const STATUS_VARIANTS = Object.freeze({
  IDLE: "idle",
  SUCCESS: "success",
  ERROR: "error",
});

const STATUS_REASONS = Object.freeze({
  CONFIGURATION: "configuration",
  INTERNAL_ERROR: "internal_error",
  INVALID_DATA: "invalid_data",
  NETWORK: "network",
  REQUEST_TOO_LARGE: "request_too_large",
  RETRY_CONFLICT: "retry_conflict",
  SERVICE_UNAVAILABLE: "service_unavailable",
  SUCCESS: "success",
  VERIFICATION_EXPIRED: "verification_expired",
  VERIFICATION_FAILED: "verification_failed",
  VERIFICATION_REQUIRED: "verification_required",
  VERIFICATION_UNAVAILABLE: "verification_unavailable",
});

function mapErrorMessages(errorKeys, errorCopy) {
  return Object.entries(errorKeys).reduce((messages, [fieldName, errorKey]) => {
    if (errorCopy?.[errorKey]) {
      messages[fieldName] = errorCopy[errorKey];
    }

    return messages;
  }, {});
}

function getProblemReason(result) {
  if (result.kind === "configuration") {
    return STATUS_REASONS.CONFIGURATION;
  }

  if (result.kind === "network") {
    return STATUS_REASONS.NETWORK;
  }

  if (result.kind === "invalid_success") {
    return STATUS_REASONS.SERVICE_UNAVAILABLE;
  }

  switch (result.code) {
    case "validation_failed":
    case "invalid_request":
      return STATUS_REASONS.INVALID_DATA;
    case "human_verification_failed":
      return STATUS_REASONS.VERIFICATION_FAILED;
    case "missing_idempotency_key":
    case "invalid_idempotency_key":
    case "unsupported_media_type":
      return STATUS_REASONS.INTERNAL_ERROR;
    case "idempotency_conflict":
      return STATUS_REASONS.RETRY_CONFLICT;
    case "request_too_large":
      return STATUS_REASONS.REQUEST_TOO_LARGE;
    case "human_verification_unavailable":
      return STATUS_REASONS.VERIFICATION_UNAVAILABLE;
    default:
      break;
  }

  switch (result.status) {
    case 400:
      return STATUS_REASONS.INVALID_DATA;
    case 409:
      return STATUS_REASONS.RETRY_CONFLICT;
    case 413:
      return STATUS_REASONS.REQUEST_TOO_LARGE;
    case 503:
      return STATUS_REASONS.VERIFICATION_UNAVAILABLE;
    default:
      break;
  }

  if (result.status >= 500) {
    return STATUS_REASONS.SERVICE_UNAVAILABLE;
  }

  return STATUS_REASONS.INTERNAL_ERROR;
}

function getFeedbackContent(formCopy, statusVariant, statusReason) {
  if (statusVariant === STATUS_VARIANTS.SUCCESS) {
    const title = formCopy.successTitle;
    const detail = formCopy.successDetail;

    return {
      tone: "success",
      title,
      detail,
      liveMessage: [title, detail].filter(Boolean).join(" "),
    };
  }

  if (statusVariant !== STATUS_VARIANTS.ERROR || !statusReason) {
    return null;
  }

  const errorMessageMap = {
    [STATUS_REASONS.CONFIGURATION]: formCopy.messages.configuration,
    [STATUS_REASONS.INTERNAL_ERROR]: formCopy.messages.internalError,
    [STATUS_REASONS.INVALID_DATA]: formCopy.messages.invalidData,
    [STATUS_REASONS.NETWORK]: formCopy.messages.network,
    [STATUS_REASONS.REQUEST_TOO_LARGE]: formCopy.messages.requestTooLarge,
    [STATUS_REASONS.RETRY_CONFLICT]: formCopy.messages.retryConflict,
    [STATUS_REASONS.SERVICE_UNAVAILABLE]: formCopy.messages.serviceUnavailable,
    [STATUS_REASONS.VERIFICATION_EXPIRED]: formCopy.messages.verificationExpired,
    [STATUS_REASONS.VERIFICATION_FAILED]: formCopy.messages.verificationFailed,
    [STATUS_REASONS.VERIFICATION_REQUIRED]: formCopy.messages.verificationRequired,
    [STATUS_REASONS.VERIFICATION_UNAVAILABLE]:
      formCopy.messages.verificationUnavailable,
  };

  const title = errorMessageMap[statusReason] || formCopy.messages.internalError;

  return {
    tone:
      statusReason === STATUS_REASONS.VERIFICATION_EXPIRED ? "expired" : "error",
    title,
    detail: "",
    liveMessage: title,
  };
}

export default function ContactForm() {
  const { language } = useLanguage();
  const formCopy =
    (translations[language] || translations.es).contactPage.form;
  const apiBaseUrl = useMemo(() => getPublicContactApiBaseUrl(), []);
  const siteKey = useMemo(() => getPublicTurnstileSiteKey(), []);
  const fieldRefs = useRef({});
  const retrySubmissionRef = useRef(null);
  const submissionCompletedRef = useRef(false);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [touchedFields, setTouchedFields] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusVariant, setStatusVariant] = useState(STATUS_VARIANTS.IDLE);
  const [statusReason, setStatusReason] = useState(null);
  const [submissionCompleted, setSubmissionCompleted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);

  const validationResult = useMemo(
    () => validateContactFormData(formData),
    [formData]
  );
  const translatedErrors = useMemo(
    () => mapErrorMessages(validationResult.errors, formCopy.errors),
    [formCopy.errors, validationResult.errors]
  );
  const visibleErrors = useMemo(() => {
    return FIELD_NAMES.reduce((messages, fieldName) => {
      if (
        translatedErrors[fieldName] &&
        (submitAttempted || touchedFields[fieldName])
      ) {
        messages[fieldName] = translatedErrors[fieldName];
      }

      return messages;
    }, {});
  }, [submitAttempted, touchedFields, translatedErrors]);
  const formHasValidationErrors =
    Object.keys(validationResult.errors).length > 0;
  const submitDisabled =
    submissionCompleted ||
    sending ||
    formHasValidationErrors ||
    !apiBaseUrl ||
    !siteKey ||
    !turnstileReady ||
    !turnstileToken;
  const feedbackContent = useMemo(() => {
    return getFeedbackContent(formCopy, statusVariant, statusReason);
  }, [formCopy, statusReason, statusVariant]);
  const hasFeedbackPanel = Boolean(feedbackContent);

  useEffect(() => {
    if (apiBaseUrl && siteKey) {
      return;
    }

    setStatusVariant(STATUS_VARIANTS.ERROR);
    setStatusReason(STATUS_REASONS.CONFIGURATION);
  }, [apiBaseUrl, siteKey]);

  const focusFirstInvalidField = () => {
    const firstInvalidField = FIELD_NAMES.find(
      (fieldName) => validationResult.errors[fieldName]
    );

    if (!firstInvalidField) {
      return;
    }

    fieldRefs.current[firstInvalidField]?.focus();
  };

  const clearRetrySubmission = () => {
    retrySubmissionRef.current = null;
  };

  const clearFeedback = () => {
    setStatusVariant(STATUS_VARIANTS.IDLE);
    setStatusReason(null);
  };

  const markSubmissionCompleted = () => {
    submissionCompletedRef.current = true;
    setSubmissionCompleted(true);
    setTurnstileToken("");
    setTurnstileReady(false);
  };

  const beginNewSubmissionSession = () => {
    if (!submissionCompletedRef.current) {
      return false;
    }

    submissionCompletedRef.current = false;
    setSubmissionCompleted(false);
    setSubmitAttempted(false);
    setTouchedFields({});
    clearFeedback();
    setTurnstileToken("");
    setTurnstileReady(false);
    clearRetrySubmission();

    return true;
  };

  const handleFieldBlur = (fieldName) => {
    setTouchedFields((currentTouchedFields) => {
      if (currentTouchedFields[fieldName]) {
        return currentTouchedFields;
      }

      return {
        ...currentTouchedFields,
        [fieldName]: true,
      };
    });
  };

  const handleChange = ({ target: { name, value } }) => {
    const restartedAfterSuccess = beginNewSubmissionSession();

    clearRetrySubmission();

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    if (
      !restartedAfterSuccess &&
      statusVariant !== STATUS_VARIANTS.IDLE &&
      statusReason !== STATUS_REASONS.CONFIGURATION
    ) {
      clearFeedback();
    }
  };

  const handleTurnstileReadyChange = (isReady) => {
    if (submissionCompletedRef.current && isReady) {
      return;
    }

    setTurnstileReady(isReady);
  };

  const handleTurnstileToken = (token) => {
    if (submissionCompletedRef.current) {
      return;
    }

    setTurnstileToken(token);

    if (
      token &&
      statusVariant === STATUS_VARIANTS.ERROR &&
      statusReason !== STATUS_REASONS.CONFIGURATION
    ) {
      clearFeedback();
    }
  };

  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileResetSignal((currentSignal) => currentSignal + 1);
  };

  const handleTurnstileExpire = () => {
    if (submissionCompletedRef.current) {
      return;
    }

    resetTurnstile();
    setStatusVariant(STATUS_VARIANTS.ERROR);
    setStatusReason(STATUS_REASONS.VERIFICATION_EXPIRED);
  };

  const handleTurnstileError = (code) => {
    if (submissionCompletedRef.current) {
      return;
    }

    if (code === "script_load_failed" || code === "turnstile_reset_failed") {
      setTurnstileToken("");
      setTurnstileReady(false);
    } else {
      resetTurnstile();
    }

    setStatusVariant(STATUS_VARIANTS.ERROR);
    setStatusReason(
      code === "script_load_failed"
        ? STATUS_REASONS.VERIFICATION_UNAVAILABLE
        : STATUS_REASONS.VERIFICATION_FAILED
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (!apiBaseUrl || !siteKey) {
      setStatusVariant(STATUS_VARIANTS.ERROR);
      setStatusReason(STATUS_REASONS.CONFIGURATION);
      return;
    }

    if (!turnstileReady) {
      setStatusVariant(STATUS_VARIANTS.ERROR);
      setStatusReason(STATUS_REASONS.VERIFICATION_UNAVAILABLE);
      return;
    }

    if (formHasValidationErrors) {
      focusFirstInvalidField();
      return;
    }

    const payloadResult = buildContactSubmissionPayload({
      formData,
      locale: language,
      source: CONTACT_SUBMISSION_SOURCE.CONTACT_PAGE,
      turnstileToken,
    });

    if (!payloadResult.ok) {
      setStatusVariant(STATUS_VARIANTS.ERROR);
      setStatusReason(
        payloadResult.reason === "missing_turnstile_token"
          ? STATUS_REASONS.VERIFICATION_REQUIRED
          : STATUS_REASONS.INVALID_DATA
      );
      return;
    }

    const idempotencyKey =
      retrySubmissionRef.current?.fingerprint ===
      getContactSubmissionFingerprint(payloadResult.payload)
        ? retrySubmissionRef.current.key
        : globalThis.crypto?.randomUUID?.();

    if (!idempotencyKey) {
      setStatusVariant(STATUS_VARIANTS.ERROR);
      setStatusReason(STATUS_REASONS.INTERNAL_ERROR);
      return;
    }

    setSending(true);
    clearFeedback();

    const result = await submitContactSubmission({
      payload: payloadResult.payload,
      idempotencyKey,
      baseUrl: apiBaseUrl,
    });

    if (result.ok) {
      clearRetrySubmission();
      markSubmissionCompleted();
      setFormData(INITIAL_FORM);
      setTouchedFields({});
      setSubmitAttempted(false);
      setStatusVariant(STATUS_VARIANTS.SUCCESS);
      setStatusReason(STATUS_REASONS.SUCCESS);
      setSending(false);
      return;
    }

    if (result.kind === "network") {
      retrySubmissionRef.current = {
        key: idempotencyKey,
        fingerprint: getContactSubmissionFingerprint(payloadResult.payload),
      };
    } else {
      clearRetrySubmission();
    }

    setStatusVariant(STATUS_VARIANTS.ERROR);
    setStatusReason(getProblemReason(result));
    resetTurnstile();
    setSending(false);
  };

  return (
    <div className="contacto-form-wrapper">
      <h3 className="contacto-form-title">{formCopy.title}</h3>

      <form className="contacto-form" onSubmit={handleSubmit} noValidate aria-busy={sending}>
        <div className="contacto-form-grid">
          <div
            className={`contacto-form-field${visibleErrors.nombre ? " is-error" : ""}`}
          >
            <label className="contacto-form-label" htmlFor={FIELD_IDS.nombre}>
              {formCopy.name}
            </label>
            <input
              ref={(element) => {
                fieldRefs.current.nombre = element;
              }}
              className="contacto-form-control"
              id={FIELD_IDS.nombre}
              name="nombre"
              type="text"
              autoComplete="name"
              maxLength={CONTACT_FIELD_LIMITS.name}
              required
              value={formData.nombre}
              onBlur={() => handleFieldBlur("nombre")}
              onChange={handleChange}
              aria-invalid={visibleErrors.nombre ? "true" : "false"}
              aria-describedby={
                visibleErrors.nombre ? `${FIELD_IDS.nombre}-error` : undefined
              }
            />
            {visibleErrors.nombre ? (
              <p className="contacto-form-field-error" id={`${FIELD_IDS.nombre}-error`}>
                {visibleErrors.nombre}
              </p>
            ) : null}
          </div>

          <div
            className={`contacto-form-field${visibleErrors.email ? " is-error" : ""}`}
          >
            <label className="contacto-form-label" htmlFor={FIELD_IDS.email}>
              {formCopy.email}
            </label>
            <input
              ref={(element) => {
                fieldRefs.current.email = element;
              }}
              className="contacto-form-control"
              id={FIELD_IDS.email}
              name="email"
              type="email"
              autoComplete="email"
              maxLength={CONTACT_FIELD_LIMITS.email}
              required
              value={formData.email}
              onBlur={() => handleFieldBlur("email")}
              onChange={handleChange}
              aria-invalid={visibleErrors.email ? "true" : "false"}
              aria-describedby={
                visibleErrors.email ? `${FIELD_IDS.email}-error` : undefined
              }
            />
            {visibleErrors.email ? (
              <p className="contacto-form-field-error" id={`${FIELD_IDS.email}-error`}>
                {visibleErrors.email}
              </p>
            ) : null}
          </div>

          <div
            className={`contacto-form-field${visibleErrors.whatsapp ? " is-error" : ""}`}
          >
            <label className="contacto-form-label" htmlFor={FIELD_IDS.whatsapp}>
              {formCopy.whatsapp}{" "}
              <span className="contacto-form-optional">({formCopy.optional})</span>
            </label>
            <input
              ref={(element) => {
                fieldRefs.current.whatsapp = element;
              }}
              className="contacto-form-control"
              id={FIELD_IDS.whatsapp}
              name="whatsapp"
              type="tel"
              autoComplete="tel"
              maxLength={CONTACT_FIELD_LIMITS.phone}
              value={formData.whatsapp}
              onBlur={() => handleFieldBlur("whatsapp")}
              onChange={handleChange}
              aria-invalid={visibleErrors.whatsapp ? "true" : "false"}
              aria-describedby={
                visibleErrors.whatsapp ? `${FIELD_IDS.whatsapp}-error` : undefined
              }
            />
            {visibleErrors.whatsapp ? (
              <p
                className="contacto-form-field-error"
                id={`${FIELD_IDS.whatsapp}-error`}
              >
                {visibleErrors.whatsapp}
              </p>
            ) : null}
          </div>

          <div
            className={`contacto-form-field${
              visibleErrors.empresaProyecto ? " is-error" : ""
            }`}
          >
            <label
              className="contacto-form-label"
              htmlFor={FIELD_IDS.empresaProyecto}
            >
              {formCopy.companyProject}{" "}
              <span className="contacto-form-optional">({formCopy.optional})</span>
            </label>
            <input
              ref={(element) => {
                fieldRefs.current.empresaProyecto = element;
              }}
              className="contacto-form-control"
              id={FIELD_IDS.empresaProyecto}
              name="empresaProyecto"
              type="text"
              autoComplete="organization"
              maxLength={CONTACT_FIELD_LIMITS.companyOrProject}
              value={formData.empresaProyecto}
              onBlur={() => handleFieldBlur("empresaProyecto")}
              onChange={handleChange}
              aria-invalid={visibleErrors.empresaProyecto ? "true" : "false"}
              aria-describedby={
                visibleErrors.empresaProyecto
                  ? `${FIELD_IDS.empresaProyecto}-error`
                  : undefined
              }
            />
            {visibleErrors.empresaProyecto ? (
              <p
                className="contacto-form-field-error"
                id={`${FIELD_IDS.empresaProyecto}-error`}
              >
                {visibleErrors.empresaProyecto}
              </p>
            ) : null}
          </div>

          <div
            className={`contacto-form-field contacto-form-field-full${
              visibleErrors.mensaje ? " is-error" : ""
            }`}
          >
            <label className="contacto-form-label" htmlFor={FIELD_IDS.mensaje}>
              {formCopy.message}
            </label>
            <textarea
              ref={(element) => {
                fieldRefs.current.mensaje = element;
              }}
              className="contacto-form-control contacto-form-textarea"
              id={FIELD_IDS.mensaje}
              name="mensaje"
              maxLength={CONTACT_FIELD_LIMITS.message}
              required
              value={formData.mensaje}
              onBlur={() => handleFieldBlur("mensaje")}
              onChange={handleChange}
              aria-invalid={visibleErrors.mensaje ? "true" : "false"}
              aria-describedby={
                visibleErrors.mensaje ? `${FIELD_IDS.mensaje}-error` : undefined
              }
            />
            {visibleErrors.mensaje ? (
              <p className="contacto-form-field-error" id={`${FIELD_IDS.mensaje}-error`}>
                {visibleErrors.mensaje}
              </p>
            ) : null}
          </div>

          <div
            className={`contacto-form-action-region${
              hasFeedbackPanel ? " has-feedback" : ""
            }`}
          >
            <div
              className="contacto-form-status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {feedbackContent?.liveMessage || ""}
            </div>

            <div
              className={`contacto-form-submit-row${
                hasFeedbackPanel ? " is-hidden" : ""
              }`}
            >
              <button className="btn-primary form-btn" type="submit" disabled={submitDisabled}>
                {sending ? formCopy.sending : formCopy.submit}
              </button>
            </div>

            <div
              className={`contacto-form-feedback-row${
                hasFeedbackPanel ? " is-visible" : ""
              }`}
            >
              {feedbackContent ? (
                <ContactFeedbackPanel
                  tone={feedbackContent.tone}
                  title={feedbackContent.title}
                  detail={feedbackContent.detail}
                  animationKey={`${statusVariant}:${statusReason ?? "none"}:${language}`}
                />
              ) : null}
            </div>
          </div>


          {!submissionCompleted ? (
            <div className="contacto-form-turnstile-row">
              <TurnstileWidget
                siteKey={siteKey}
                action={CONTACT_TURNSTILE_ACTION.CONTACT_PAGE}
                resetSignal={turnstileResetSignal}
                disabled={sending}
                className={`contacto-form-turnstile-shell${
                  sending ? " is-disabled" : ""
                }`}
                onReadyChange={handleTurnstileReadyChange}
                onToken={handleTurnstileToken}
                onExpire={handleTurnstileExpire}
                onError={handleTurnstileError}
              />
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
