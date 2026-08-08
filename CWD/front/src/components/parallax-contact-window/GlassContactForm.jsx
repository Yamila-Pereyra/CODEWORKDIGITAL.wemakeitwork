"use client";

import { useMemo } from "react";

import useAnimatedSuccessDetail from "@/components/contact/useAnimatedSuccessDetail";
import TurnstileWidget from "@/components/contact/TurnstileWidget";
import {
  useContactSubmissionForm,
} from "@/components/contact/useContactSubmissionForm";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CONTACT_FIELD_LIMITS,
  CONTACT_FORM_FIELD_MAPS,
  CONTACT_SUBMISSION_SOURCE,
  CONTACT_TURNSTILE_ACTION,
} from "@/lib/contact/contactSubmissionContract";
import { translations } from "@/translations";

import styles from "./GlassContactForm.module.css";

const PARALLAX_CONTACT_FIELDS = [
  {
    id: "name",
    name: "name",
    labelKey: "name",
    type: "text",
    autoComplete: "name",
    maxLength: CONTACT_FIELD_LIMITS.name,
    required: true,
  },
  {
    id: "email",
    name: "email",
    labelKey: "email",
    type: "email",
    autoComplete: "email",
    maxLength: CONTACT_FIELD_LIMITS.email,
    required: true,
  },
  {
    id: "whatsapp",
    name: "whatsapp",
    labelKey: "whatsapp",
    type: "tel",
    autoComplete: "tel",
    maxLength: CONTACT_FIELD_LIMITS.phone,
    required: false,
  },
  {
    id: "company-project",
    name: "companyProject",
    labelKey: "companyProject",
    type: "text",
    autoComplete: "organization",
    maxLength: CONTACT_FIELD_LIMITS.companyOrProject,
    required: false,
  },
];

const FIELD_ORDER = [
  "name",
  "email",
  "whatsapp",
  "companyProject",
  "message",
];

const INITIAL_FORM = Object.freeze({
  name: "",
  email: "",
  whatsapp: "",
  companyProject: "",
  message: "",
});

function getFeedbackToneClass(tone) {
  return tone === "success" ? styles.feedbackPanelSuccess : styles.feedbackPanelError;
}

export default function GlassContactForm({ copy, idPrefix = "parallax-contact" }) {
  const { language } = useLanguage();
  const sharedCopy = (translations[language] || translations.es).contactPage.form;
  const formCopy = useMemo(() => {
    return {
      ...sharedCopy,
      ...copy,
    };
  }, [copy, sharedCopy]);
  const {
    feedbackContent,
    formData,
    handleChange,
    handleFieldBlur,
    handleSubmit,
    handleTurnstileError,
    handleTurnstileExpire,
    handleTurnstileReadyChange,
    handleTurnstileToken,
    hasFeedbackPanel,
    hasTerminalState,
    isSuccessTerminal,
    registerFieldRef,
    sending,
    siteKey,
    submitDisabled,
    turnstileResetSignal,
    visibleErrors,
  } = useContactSubmissionForm({
    formCopy,
    locale: language,
    source: CONTACT_SUBMISSION_SOURCE.HOME,
    initialFormData: INITIAL_FORM,
    fieldOrder: FIELD_ORDER,
    fieldMap: CONTACT_FORM_FIELD_MAPS.HOME,
  });
  const feedbackAnimationKey = feedbackContent
    ? `${feedbackContent.tone}:${language}:${feedbackContent.title}`
    : `${language}:idle`;
  const visibleFeedbackDetail = useAnimatedSuccessDetail({
    tone: feedbackContent?.tone ?? "error",
    detail: feedbackContent?.detail ?? "",
    animationKey: feedbackAnimationKey,
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-busy={sending}>
      <div
        className={`${styles.fieldsGrid}${
          isSuccessTerminal ? ` ${styles.formSuccessTerminal}` : ""
        }`}
      >
        {PARALLAX_CONTACT_FIELDS.map((field) => {
          const fieldId = `${idPrefix}-${field.id}`;
          const errorMessage = visibleErrors[field.name];

          return (
            <div
              className={`${styles.field}${
                errorMessage ? ` ${styles.fieldError}` : ""
              }`}
              key={field.id}
            >
              <label className={styles.label} htmlFor={fieldId}>
                {formCopy[field.labelKey]}
              </label>
              <input
                ref={registerFieldRef(field.name)}
                className={styles.control}
                id={fieldId}
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                maxLength={field.maxLength}
                required={field.required}
                disabled={hasTerminalState}
                value={formData[field.name]}
                onBlur={() => handleFieldBlur(field.name)}
                onChange={handleChange}
                aria-invalid={errorMessage ? "true" : "false"}
                aria-describedby={errorMessage ? `${fieldId}-error` : undefined}
              />
              {errorMessage ? (
                <p className={styles.fieldErrorText} id={`${fieldId}-error`}>
                  {errorMessage}
                </p>
              ) : null}
            </div>
          );
        })}

        <div
          className={`${styles.field} ${styles.messageField}${
            visibleErrors.message ? ` ${styles.fieldError}` : ""
          }`}
        >
          <label className={styles.label} htmlFor={`${idPrefix}-message`}>
            {formCopy.message}
          </label>
          <textarea
            ref={registerFieldRef("message")}
            className={`${styles.control} ${styles.textarea}`}
            id={`${idPrefix}-message`}
            name="message"
            maxLength={CONTACT_FIELD_LIMITS.message}
            required
            disabled={hasTerminalState}
            value={formData.message}
            onBlur={() => handleFieldBlur("message")}
            onChange={handleChange}
            aria-invalid={visibleErrors.message ? "true" : "false"}
            aria-describedby={
              visibleErrors.message ? `${idPrefix}-message-error` : undefined
            }
          />
          {visibleErrors.message ? (
            <p className={styles.fieldErrorText} id={`${idPrefix}-message-error`}>
              {visibleErrors.message}
            </p>
          ) : null}
        </div>

        <div
          className={styles.statusLive}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {feedbackContent?.liveMessage || ""}
        </div>

        {!hasTerminalState ? (
          <div className={styles.submitRow}>
            <button className={styles.submitButton} type="submit" disabled={submitDisabled}>
              {sending ? formCopy.sending : formCopy.submit}
            </button>
          </div>
        ) : null}

        {hasFeedbackPanel ? (
          <div className={styles.feedbackRow}>
            <div
              className={`${styles.feedbackPanel} ${getFeedbackToneClass(feedbackContent.tone)}`}
              aria-hidden="true"
            >
              <p className={styles.feedbackTitle}>{feedbackContent.title}</p>
              {feedbackContent.detail ? (
                <p className={styles.feedbackDetail}>{visibleFeedbackDetail}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {!hasTerminalState ? (
          <div className={styles.turnstileRow}>
            <TurnstileWidget
              siteKey={siteKey}
              action={CONTACT_TURNSTILE_ACTION.HOME}
              resetSignal={turnstileResetSignal}
              disabled={sending}
              className={`${styles.turnstileShell}${
                sending ? ` ${styles.turnstileShellDisabled}` : ""
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
  );
}
