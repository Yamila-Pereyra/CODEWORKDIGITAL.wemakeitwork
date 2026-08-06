"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

function mapErrorMessages(errorKeys, errorCopy) {
  return Object.entries(errorKeys).reduce((messages, [fieldName, errorKey]) => {
    if (errorCopy?.[errorKey]) {
      messages[fieldName] = errorCopy[errorKey];
    }

    return messages;
  }, {});
}

function getProblemMessage(result, formCopy) {
  if (result.kind === "configuration") {
    return formCopy.messages.configuration;
  }

  if (result.kind === "network") {
    return formCopy.messages.network;
  }

  if (result.kind === "invalid_success") {
    return formCopy.messages.serviceUnavailable;
  }

  switch (result.code) {
    case "validation_failed":
    case "invalid_request":
      return formCopy.messages.invalidData;
    case "human_verification_failed":
      return formCopy.messages.verificationFailed;
    case "missing_idempotency_key":
    case "invalid_idempotency_key":
    case "unsupported_media_type":
      return formCopy.messages.internalError;
    case "idempotency_conflict":
      return formCopy.messages.retryConflict;
    case "request_too_large":
      return formCopy.messages.requestTooLarge;
    case "human_verification_unavailable":
      return formCopy.messages.verificationUnavailable;
    default:
      break;
  }

  switch (result.status) {
    case 400:
      return formCopy.messages.invalidData;
    case 409:
      return formCopy.messages.retryConflict;
    case 413:
      return formCopy.messages.requestTooLarge;
    case 503:
      return formCopy.messages.verificationUnavailable;
    default:
      break;
  }

  if (result.status >= 500) {
    return formCopy.messages.serviceUnavailable;
  }

  return formCopy.messages.internalError;
}

export default function ContactForm() {
  const { language } = useLanguage();
  const formCopy =
    (translations[language] || translations.es).contactPage.form;
  const apiBaseUrl = useMemo(() => getPublicContactApiBaseUrl(), []);
  const siteKey = useMemo(() => getPublicTurnstileSiteKey(), []);
  const fieldRefs = useRef({});
  const retrySubmissionRef = useRef(null);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [touchedFields, setTouchedFields] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusVariant, setStatusVariant] = useState("idle");
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
    sending ||
    formHasValidationErrors ||
    !apiBaseUrl ||
    !siteKey ||
    !turnstileReady ||
    !turnstileToken;

  useEffect(() => {
    if (apiBaseUrl && siteKey) {
      return;
    }

    setStatusVariant("error");
    setStatusMessage(formCopy.messages.configuration);
  }, [apiBaseUrl, formCopy.messages.configuration, siteKey]);

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
    clearRetrySubmission();

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    if (statusVariant !== "idle") {
      setStatusVariant("idle");
      setStatusMessage("");
    }
  };

  const handleTurnstileToken = (token) => {
    setTurnstileToken(token);
  };

  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileResetSignal((currentSignal) => currentSignal + 1);
  };

  const handleTurnstileExpire = () => {
    resetTurnstile();
    setStatusVariant("error");
    setStatusMessage(formCopy.messages.verificationExpired);
  };

  const handleTurnstileError = (code) => {
    if (code === "script_load_failed" || code === "turnstile_reset_failed") {
      setTurnstileToken("");
      setTurnstileReady(false);
    } else {
      resetTurnstile();
    }

    setStatusVariant("error");
    setStatusMessage(
      code === "script_load_failed"
        ? formCopy.messages.verificationUnavailable
        : formCopy.messages.verificationFailed
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (!apiBaseUrl || !siteKey) {
      setStatusVariant("error");
      setStatusMessage(formCopy.messages.configuration);
      return;
    }

    if (!turnstileReady) {
      setStatusVariant("error");
      setStatusMessage(formCopy.messages.verificationUnavailable);
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
      setStatusVariant("error");
      setStatusMessage(
        payloadResult.reason === "missing_turnstile_token"
          ? formCopy.messages.verificationRequired
          : formCopy.messages.invalidData
      );
      return;
    }

    const idempotencyKey =
      retrySubmissionRef.current?.fingerprint ===
      getContactSubmissionFingerprint(payloadResult.payload)
        ? retrySubmissionRef.current.key
        : globalThis.crypto?.randomUUID?.();

    if (!idempotencyKey) {
      setStatusVariant("error");
      setStatusMessage(formCopy.messages.internalError);
      return;
    }

    setSending(true);
    setStatusVariant("idle");
    setStatusMessage("");

    const result = await submitContactSubmission({
      payload: payloadResult.payload,
      idempotencyKey,
      baseUrl: apiBaseUrl,
    });

    if (result.ok) {
      clearRetrySubmission();
      setFormData(INITIAL_FORM);
      setTouchedFields({});
      setSubmitAttempted(false);
      setStatusVariant("success");
      setStatusMessage(formCopy.success);
      resetTurnstile();
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

    setStatusVariant("error");
    setStatusMessage(getProblemMessage(result, formCopy));
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

          <div className="contacto-form-turnstile-row">
            <TurnstileWidget
              siteKey={siteKey}
              action={CONTACT_TURNSTILE_ACTION.CONTACT_PAGE}
              resetSignal={turnstileResetSignal}
              disabled={sending}
              className={`contacto-form-turnstile-shell${
                sending ? " is-disabled" : ""
              }`}
              onReadyChange={setTurnstileReady}
              onToken={handleTurnstileToken}
              onExpire={handleTurnstileExpire}
              onError={handleTurnstileError}
            />
          </div>

          <div className="contacto-form-submit-row">
            <button className="btn-primary form-btn" type="submit" disabled={submitDisabled}>
              {sending ? formCopy.sending : formCopy.submit}
            </button>
          </div>
        </div>

        <div
          className="contacto-form-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {statusMessage ? (
            <p className={`form-msg${statusVariant === "error" ? " error" : ""}`}>
              {statusMessage}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
