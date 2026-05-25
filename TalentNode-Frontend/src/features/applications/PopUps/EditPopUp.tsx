import { useState } from "react";

type EditPopUpProps = {
  onClose: () => void;
  commentId: string;
  currentComment: string;
  onSave: (
    commentId: string,
    newComment: string
  ) => void;
};

const EditPopUp = ({
  onClose,
  commentId,
  currentComment,
  onSave,
}: EditPopUpProps) => {
  const [editedComment, setEditedComment] =
    useState(currentComment);

  const handleSave = () => {
    const trimmedComment = editedComment.trim();

    if (!trimmedComment) return;

    onSave(commentId, trimmedComment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">
          Edit Comment
        </h2>

        <textarea
          value={editedComment}
          onChange={(e) =>
            setEditedComment(e.target.value)
          }
          className="mb-4 h-32 w-full rounded border border-gray-300 p-2 outline-none focus:border-gray-900"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPopUp;