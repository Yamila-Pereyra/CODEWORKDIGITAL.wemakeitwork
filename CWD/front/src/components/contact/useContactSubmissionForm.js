"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildContactSubmissionPayload,
  getContactSubmissionFingerprint,
  validateContactFormData,
} from "@/lib/contact/contactSubmissionContract";
import {
  getPublicContactApiBaseUrl,
  getPublicTurnstileSiteKey,
  submitContactSubmission,
} from "@/lib/contact/contactSubmissionClient";

export const STATUS_VARIANTS = Object.freeze({
  IDLE: "idle",
  SUCCESS: "success",
  ERROR: "error",
});

export const STATUS_REASONS = Object.freeze({
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

export const TERMINAL_STATES = Object.freeze({
  NONE: "none",
  SUCCESS: "success",
  VERIFICATION_EXPIRED: "verification_expired",
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
    tone: statusReason === STATUS_REASONS.VERIFICATION_EXPIRED ? "expired" : "error",
    title,
    detail: "",
    liveMessage: title,
  };
}

export function useContactSubmissionForm({
  formCopy,
  locale,
  source,
  initialFormData,
  fieldOrder,
  fieldMap,
}) {
  const apiBaseUrl = useMemo(() => getPublicContactApiBaseUrl(), []);
  const siteKey = useMemo(() => getPublicTurnstileSiteKey(), []);
  const initialFormRef = useRef(initialFormData);
  const fieldRefs = useRef({});
  const retrySubmissionRef = useRef(null);
  const terminalStateRef = useRef(TERMINAL_STATES.NONE);

  const [formData, setFormData] = useState(initialFormRef.current);
  const [touchedFields, setTouchedFields] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusVariant, setStatusVariant] = useState(STATUS_VARIANTS.IDLE);
  const [statusReason, setStatusReason] = useState(null);
  const [terminalState, setTerminalState] = useState(TERMINAL_STATES.NONE);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);

  const validationResult = useMemo(
    () => validateContactFormData(formData, fieldMap),
    [fieldMap, formData]
  );
  const translatedErrors = useMemo(
    () => mapErrorMessages(validationResult.errors, formCopy.errors),
    [formCopy.errors, validationResult.errors]
  );
  const visibleErrors = useMemo(() => {
    return fieldOrder.reduce((messages, fieldName) => {
      if (
        translatedErrors[fieldName] &&
        (submitAttempted || touchedFields[fieldName])
      ) {
        messages[fieldName] = translatedErrors[fieldName];
      }

      return messages;
    }, {});
  }, [fieldOrder, submitAttempted, touchedFields, translatedErrors]);
  const formHasValidationErrors = Object.keys(validationResult.errors).length > 0;
  const isSuccessTerminal = terminalState === TERMINAL_STATES.SUCCESS;
  const hasTerminalState = terminalState !== TERMINAL_STATES.NONE;
  const submitDisabled =
    hasTerminalState ||
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
    const firstInvalidField = fieldOrder.find(
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

  const enterTerminalState = (nextTerminalState) => {
    terminalStateRef.current = nextTerminalState;
    setTerminalState(nextTerminalState);
    setTurnstileToken("");
    setTurnstileReady(false);
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
    if (terminalStateRef.current !== TERMINAL_STATES.NONE) {
      return;
    }

    clearRetrySubmission();

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    if (
      terminalStateRef.current === TERMINAL_STATES.NONE &&
      statusVariant !== STATUS_VARIANTS.IDLE &&
      statusReason !== STATUS_REASONS.CONFIGURATION
    ) {
      clearFeedback();
    }
  };

  const handleTurnstileReadyChange = (isReady) => {
    if (terminalStateRef.current !== TERMINAL_STATES.NONE) {
      return;
    }

    setTurnstileReady(isReady);
  };

  const handleTurnstileToken = (token) => {
    if (terminalStateRef.current !== TERMINAL_STATES.NONE) {
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
    if (terminalStateRef.current !== TERMINAL_STATES.NONE) {
      return;
    }

    clearRetrySubmission();
    enterTerminalState(TERMINAL_STATES.VERIFICATION_EXPIRED);
    setStatusVariant(STATUS_VARIANTS.ERROR);
    setStatusReason(STATUS_REASONS.VERIFICATION_EXPIRED);
  };

  const handleTurnstileError = (code) => {
    if (terminalStateRef.current !== TERMINAL_STATES.NONE) {
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
      locale,
      source,
      turnstileToken,
      fieldMap,
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
      enterTerminalState(TERMINAL_STATES.SUCCESS);
      setFormData(initialFormRef.current);
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

  const registerFieldRef = (fieldName) => (element) => {
    fieldRefs.current[fieldName] = element;
  };

  return {
    apiBaseUrl,
    siteKey,
    formData,
    visibleErrors,
    sending,
    feedbackContent,
    hasFeedbackPanel,
    statusVariant,
    statusReason,
    terminalState,
    isSuccessTerminal,
    hasTerminalState,
    submitDisabled,
    turnstileResetSignal,
    handleFieldBlur,
    handleChange,
    handleSubmit,
    handleTurnstileReadyChange,
    handleTurnstileToken,
    handleTurnstileExpire,
    handleTurnstileError,
    registerFieldRef,
  };
}
