import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { CustomQuestion } from "../services/ApplicationFormServices";

type FieldType = "text" | "textarea" | "select" | "checkbox" | "radio";

type CustomQuestionPopUpProps = {
  isOpen: boolean;
  isClose: () => void;
  onCreate: (question: Omit<CustomQuestion, "options"> & { options: string[] }) => void | Promise<void>;
  initialKey?: string;
};

const normalizeKey = (s: string) => {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
};

const CustomQuestionPopUp = ({
  isOpen,
  isClose,
  onCreate,
  initialKey,
}: CustomQuestionPopUpProps) => {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<FieldType>("text");
  const [questionRequirement, setQuestionRequirement] = useState("Required");
  const [answerVisibility, setAnswerVisibility] = useState("Entire hiring team");

  const [optionsText, setOptionsText] = useState("");
  const isOptionsRequired = useMemo(
    () => ["select", "checkbox", "radio"].includes(questionType),
    [questionType],
  );

  const derivedKey = useMemo(() => {
    const fromText = normalizeKey(questionText);
    return (initialKey ?? fromText) || "custom_question";
  }, [initialKey, questionText]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    const question = questionText.trim();
    if (!question) {
      alert("Question text is required");
      return;
    }

    const key = derivedKey;
    const required = questionRequirement === "Required";

    const options = isOptionsRequired
      ? optionsText
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean)
      : [];

    if (isOptionsRequired && options.length === 0) {
      alert("Options are required for the selected question type");
      return;
    }

    // NOTE: backend schema currently does not persist answerVisibility.
    // We keep the field in UI but do not store it.
    await onCreate({
      key,
      question,
      fieldType: questionType,
      required,
      options,
    });

    // Reset after create
    setQuestionText("");
    setQuestionType("text");
    setQuestionRequirement("Required");
    setAnswerVisibility("Entire hiring team");
    setOptionsText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              New custom question
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Configure the question text, question type, and answer settings.
            </p>
          </div>

          <button
            onClick={isClose}
            className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 px-6 py-6">
          {/* Question Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Question text
            </label>

            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. Why do you want to join us?"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />

            <p className="text-xs text-gray-500">
              Auto key: <span className="font-mono">{derivedKey}</span>
            </p>
          </div>

          {/* Question Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Question type
            </label>

            <select
              value={questionType}
              onChange={(e) =>
                setQuestionType(e.target.value as FieldType)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            >
              <option value="text">Short answer</option>
              <option value="textarea">Long answer</option>
              <option value="radio">Multiple choice (single select)</option>
              <option value="checkbox">Multiple choice (multi select)</option>
              <option value="select">Multiple choice (single select)</option>
              <option value="file">File upload</option>
            </select>
          </div>

          {/* Options */}
          {isOptionsRequired && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Options
              </label>
              <p className="text-xs text-gray-500">
                Enter one option per line.
              </p>
              <textarea
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder="Option 1\nOption 2\nOption 3"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              />
            </div>
          )}

          {/* Requirement */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Question requirement
            </label>

            <select
              value={questionRequirement}
              onChange={(e) => setQuestionRequirement(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            >
              <option value="Required">Required</option>
              <option value="Optional">Optional</option>
            </select>
          </div>

          {/* Answer Visibility (UI only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Answer visibility
            </label>

            <p className="text-xs text-gray-500">
              Decide who can access the candidate’s answer.
            </p>

            <select
              value={answerVisibility}
              onChange={(e) => setAnswerVisibility(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
            >
              <option value="Entire hiring team">Entire hiring team</option>
              <option value="Admin only">Admin only</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={isClose}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Create question
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomQuestionPopUp;

