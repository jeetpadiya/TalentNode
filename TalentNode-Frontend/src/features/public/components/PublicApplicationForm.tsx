import { useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";
import type { PublicJobDetailResponse } from "../services/publicPortalApi";

type FieldVisibility = "Hidden" | "Optional" | "Required";
type AnswerValue = string | boolean | string[];
type ErrorsMap = Record<string, string>;

type Props = {
  jobDetail: PublicJobDetailResponse;
  onSubmit: (payload: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    resume?: File | null;
    links?: Array<{ key: string; value: string }>;
    customQuestionAnswers?: Array<{ key: string; answer: AnswerValue }>;
  }) => Promise<void>;
};

export default function PublicApplicationForm({
  jobDetail,
  onSubmit,
}: Props) {
  const applicationForm = jobDetail.applicationForm;
  const basicInfo = applicationForm?.basicInfo ?? {};
  const customQuestions = applicationForm?.customQuestions ?? [];
  const linksConfig = applicationForm?.links ?? [];
  const fileUploadsConfig = applicationForm?.fileUploads ?? [];

  type CustomQuestion = {
    key: string;
    question: string;
    required: boolean;
    fieldType?: "text" | "textarea" | "select" | "checkbox" | "radio";
    options?: string[];
  };
  type LinkConfig = { key: string; visibility?: FieldVisibility; label?: string };

  const typedCustomQuestions = customQuestions as CustomQuestion[];
  const typedLinksConfig = linksConfig as LinkConfig[];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [resume, setResume] = useState<File | null>(null);

  const [linkValues, setLinkValues] = useState<Record<string, string>>({});
  const [customAnswers, setCustomAnswers] = useState<Record<string, AnswerValue>>({});

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ErrorsMap>({});
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const isVisible = (v: FieldVisibility | undefined) => v && v !== "Hidden";
  const isRequired = (v: FieldVisibility | undefined) => v === "Required";

  const getCustomQuestionError = (questionIndex: number, questionKey: string) => {
    const idxPrefix = `customQuestionAnswers.${questionIndex}.`;
    const directCandidates = [
      errors[`${idxPrefix}answer`] ?? "",
      errors[`${idxPrefix}key`] ?? "",
      errors[`${idxPrefix}value`] ?? "",
      errors[`customQuestionAnswers.${questionIndex}`] ?? "",
    ];

    const direct = directCandidates.find(Boolean) ?? "";
    if (direct) return direct;

    const idxMatch = Object.entries(errors).find(
      ([k]) => k.startsWith(idxPrefix) || k === `customQuestionAnswers.${questionIndex}`
    );
    if (idxMatch?.[1]) return idxMatch[1];

    const keyMatch = Object.entries(errors).find(
      ([k]) =>
        k.includes(`customQuestionAnswers.${questionKey}`) ||
        k.endsWith(`customQuestionAnswers.${questionKey}.answer`)
    );

    return keyMatch?.[1] ?? "";
  };

  const phoneVisibility = (basicInfo?.phone ?? "Hidden") as FieldVisibility;
  const locationVisibility = (basicInfo?.location ?? "Hidden") as FieldVisibility;
  const resumeVisibility = (fileUploadsConfig.find((field) => field.key === "resume")?.visibility ?? "Hidden") as FieldVisibility;

  const formLinks = useMemo(() => {
    return typedLinksConfig
      .filter((l) => (l.visibility ?? "Hidden") !== "Hidden")
      .map((l) => ({ key: l.key, value: linkValues[l.key] ?? "" }));
  }, [typedLinksConfig, linkValues]);

  const formCustomQuestions = useMemo(() => {
    return typedCustomQuestions.map((q) => ({
      key: q.key,
      answer: customAnswers[q.key] ?? "",
    }));
  }, [typedCustomQuestions, customAnswers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitMessage(null);

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: isVisible(phoneVisibility) ? phone.trim() : undefined,
        location: isVisible(locationVisibility) ? location.trim() : undefined,
        resume,
        links: formLinks.length ? formLinks : undefined,
        customQuestionAnswers: formCustomQuestions.length
          ? formCustomQuestions
          : undefined,
      });

      setSubmitMessage(
        "Application submitted successfully! We will review it shortly."
      );
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setResume(null);
      setLinkValues({});
      setCustomAnswers({});
    } catch (err) {
      const anyErr = err as any;
      const apiErrors = anyErr?.cause?.errors;

      if (Array.isArray(apiErrors)) {
        const map: ErrorsMap = {};
        for (const item of apiErrors) {
          if (item?.field && item?.message) map[item.field] = item.message;
        }
        setErrors(map);
      } else {
        setErrors({ root: anyErr?.message ?? "Failed to submit" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldError = (key: string) => errors[key] ?? "";

  const updateCustomAnswer = (key: string, value: AnswerValue) => {
    setCustomAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleCheckboxAnswer = (key: string, option: string) => {
    const current = Array.isArray(customAnswers[key])
      ? (customAnswers[key] as string[])
      : [];

    updateCustomAnswer(
      key,
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  };

  const inputClasses = "mt-2 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400";
  const labelClasses = "text-sm font-semibold text-gray-700";
  const sectionTitleClasses = "text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2";

  if (submitMessage) {
    return (
      <div className="rounded-3xl border border-green-200 bg-gradient-to-b from-green-50 to-white p-8 text-center shadow-lg shadow-green-100/50">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Application Received</h2>
        <p className="text-gray-600">{submitMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-200/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Send className="w-48 h-48 -mr-10 -mt-10" />
      </div>
      
      <div className="relative">
        <h2 className="text-2xl font-bold text-gray-900">Submit Application</h2>
        <p className="mt-2 text-sm text-gray-500">
          Ready to join? Fill out the details below.
        </p>

        {errors.root && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{errors.root}</p>
          </div>
        )}

        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="space-y-5">
            <h3 className={sectionTitleClasses}>Personal Details</h3>
            
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClasses}>
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  className={inputClasses}
                  placeholder="Jane Doe"
                />
                {getFieldError("name") && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{getFieldError("name")}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClasses}>
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className={inputClasses}
                  placeholder="jane@example.com"
                />
                {getFieldError("email") && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{getFieldError("email")}</p>
                )}
              </div>

              {isVisible(phoneVisibility) && (
                <div className="sm:col-span-2">
                  <label className={labelClasses}>
                    Phone {isRequired(phoneVisibility) ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal ml-1">(optional)</span>}
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    className={inputClasses}
                    placeholder="+1 (555) 000-0000"
                  />
                  {getFieldError("phone") && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{getFieldError("phone")}</p>
                  )}
                </div>
              )}

              {isVisible(locationVisibility) && (
                <div className="sm:col-span-2">
                  <label className={labelClasses}>
                    Location {isRequired(locationVisibility) ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal ml-1">(optional)</span>}
                  </label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    type="text"
                    className={inputClasses}
                    placeholder="City, Country"
                  />
                  {getFieldError("location") && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{getFieldError("location")}</p>
                  )}
                </div>
              )}

              {isVisible(resumeVisibility) && (
                <div className="sm:col-span-2">
                  <label className={labelClasses}>
                    Resume (PDF/Docx) {isRequired(resumeVisibility) ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal ml-1">(optional)</span>}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                    className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                    required={isRequired(resumeVisibility)}
                  />
                  {getFieldError("resume") && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{getFieldError("resume")}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          {linksConfig?.some(l => l.visibility !== "Hidden") && (
            <div className="space-y-5">
              <h3 className={sectionTitleClasses}>Online Profiles</h3>
              <div className="space-y-4">
                {linksConfig
                  .filter((l) => (l.visibility ?? "Hidden") !== "Hidden")
                  .map((l) => (
                    <div key={l.key}>
                      <label className={labelClasses}>
                        {l.label ?? l.key} {isRequired(l.visibility) ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal ml-1">(optional)</span>}
                      </label>
                      <input
                        value={linkValues[l.key] ?? ""}
                        onChange={(e) =>
                          setLinkValues((prev) => ({
                            ...prev,
                            [l.key]: e.target.value,
                          }))
                        }
                        type="url"
                        className={inputClasses}
                        placeholder="https://"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Custom Questions */}
          {customQuestions?.length > 0 && (
            <div className="space-y-5">
              <h3 className={sectionTitleClasses}>Additional Questions</h3>
              <div className="space-y-6">
                {customQuestions.map((q, idx) => {
                  const questionError = getCustomQuestionError(idx, q.key);
                  const fieldType = q.fieldType ?? "text";
                  const options = q.options ?? [];

                  return (
                    <div key={q.key}>
                      <label className={labelClasses}>
                        {q.question}{" "}
                        {q.required ? (
                          <span className="text-red-500">*</span>
                        ) : (
                          <span className="text-gray-400 font-normal ml-1">(optional)</span>
                        )}
                      </label>

                      {fieldType === "textarea" ? (
                        <textarea
                          value={typeof customAnswers[q.key] === "string" ? (customAnswers[q.key] as string) : ""}
                          onChange={(e) => updateCustomAnswer(q.key, e.target.value)}
                          rows={3}
                          className={`${inputClasses} resize-none`}
                          placeholder="Type your answer here..."
                        />
                      ) : fieldType === "select" ? (
                        <select
                          value={typeof customAnswers[q.key] === "string" ? (customAnswers[q.key] as string) : ""}
                          onChange={(e) => updateCustomAnswer(q.key, e.target.value)}
                          className={inputClasses}
                        >
                          <option value="">Select an option</option>
                          {options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : fieldType === "radio" ? (
                        <div className="mt-3 space-y-2">
                          {options.map((option) => (
                            <label key={option} className="flex items-center gap-3 text-sm text-gray-700">
                              <input
                                type="radio"
                                name={q.key}
                                value={option}
                                checked={customAnswers[q.key] === option}
                                onChange={() => updateCustomAnswer(q.key, option)}
                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      ) : fieldType === "checkbox" ? (
                        <div className="mt-3 space-y-2">
                          {options.map((option) => {
                            const selected = Array.isArray(customAnswers[q.key])
                              ? (customAnswers[q.key] as string[])
                              : [];

                            return (
                              <label key={option} className="flex items-center gap-3 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  value={option}
                                  checked={selected.includes(option)}
                                  onChange={() => toggleCheckboxAnswer(q.key, option)}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                {option}
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <input
                          value={typeof customAnswers[q.key] === "string" ? (customAnswers[q.key] as string) : ""}
                          onChange={(e) => updateCustomAnswer(q.key, e.target.value)}
                          type="text"
                          className={inputClasses}
                          placeholder="Type your answer here..."
                        />
                      )}

                      {questionError && (
                        <p className="mt-1.5 text-xs font-medium text-red-600">{questionError}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  Submitting Application...
                </>
              ) : (
                <>
                  Submit Application
                  <Send className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </>
              )}
            </button>
            <p className="mt-4 text-center text-xs text-gray-400">
              By submitting this application, you agree to our privacy policy and terms of service.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
