"use client";

import useAnimatedSuccessDetail from "@/components/contact/useAnimatedSuccessDetail";

export default function ContactFeedbackPanel({
  tone = "success",
  title,
  detail = "",
  animationKey,
}) {
  const visibleDetail = useAnimatedSuccessDetail({
    tone,
    detail,
    animationKey,
  });

  return (
    <div
      className={`contacto-feedback-panel contacto-feedback-panel--${tone}`}
      aria-hidden="true"
    >
      <p className="contacto-feedback-title">{title}</p>
      {detail ? (
        <p className="contacto-feedback-detail">
          {visibleDetail}
        </p>
      ) : null}
    </div>
  );
}
