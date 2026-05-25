import {
  addApplicationComment,
  editApplicationComment,
  getApplicationComments,
  deleteApplicationComment
} from "../services/ApplicationServices"
import { useState, useEffect } from "react"
import { useAuthStore } from "../../../app/store/AuthStore"
import { useSearchParams } from "react-router"
import { MdEditSquare } from "react-icons/md";
import EditPopUp from "../PopUps/EditPopUp";
import { MdDelete } from "react-icons/md";



const CandidateCommentsTab = ({ applicationId }: { applicationId: string }) => {

  const { accessToken } = useAuthStore()
  const [searchParams] = useSearchParams()

  const selectedJobId = searchParams.get('job')?.trim() ?? ''

  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<
    {
      id: string
      applicationId: string
      comment: string
      createdAt: string
      createdBy?: { username?: string | null } | string
    }[]
  >([])
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')



  const fetchComments = async () => {
  try {

    if(!accessToken || !selectedJobId || !applicationId) {
      return console.log("No access token")
    }

    const response = await getApplicationComments(
      selectedJobId,
      accessToken,
      applicationId,
    );

    if (response.success) {
const formattedComments = response.comments.map(
  (comment: any) => ({
    id: comment._id,
    applicationId,
    comment: comment.text,
    createdAt: comment.createdAt,
    createdBy: comment.createdBy,
  })
);

      setComments(formattedComments);
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    setComments([]);
  }
};

useEffect(() => {
  fetchComments();
}, [accessToken, selectedJobId, applicationId]);


  const handleAddComment = async () => {
    try {

      if(!accessToken || !selectedJobId || !applicationId) {
      return console.log("No access token")
    }
      const response = await addApplicationComment(
        {
          jobId: selectedJobId,
          applicationId,
          comment: comment,
          accessToken: accessToken,
        }
      );

      if (response.success) {
        setComment('');
        await fetchComments();
      }

    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (commentId: string, newComment: string) => {
    try {

         if(!accessToken || !selectedJobId || !applicationId) {
      return console.log("No access token")
    }
     
      const response  = await editApplicationComment({
        jobId: selectedJobId,
        applicationId,
        commentId: commentId,
        newComment: newComment,
        accessToken: accessToken
      });
      if (response.success) {
        await fetchComments();
      }
    }
    catch (error){
      console.error('Error editing comment:', error);
    }
  }

  const handleDeleteComment = async (
  commentId: string
) => {
  try {

    if (!accessToken) {
      return console.log(
        "No access token"
      );
    }

    const response =
      await deleteApplicationComment({
        jobId: selectedJobId,

        applicationId: applicationId,

        commentId,

        accessToken,
      });

    if (response.success) {

      // Optimistic UI update
      setComments((prev) =>
        prev.filter(
          (comment) =>
            comment.id !== commentId
        )
      );

      // OR alternatively:
      // await fetchComments();
    }

  } catch (error) {
    console.error(
      "Error deleting comment:",
      error
    );
  }
};
  return (
    <div className="space-y-3">
     {comments.map((c) => (
  <div
    key={c.id}
    className="relative rounded-lg border border-gray-300 px-3 py-2"
  >
    <p className="text-sm text-gray-700">
      {c.comment}
    </p>

    <p className="text-xs text-gray-500">
      {typeof c.createdBy === 'string'
        ? c.createdBy
        : c.createdBy?.username ?? 'Unknown'}
    </p>

    <p className="text-xs text-gray-500">
      {new Date(c.createdAt).toLocaleString()}
    </p>

    <MdEditSquare
      className="absolute right-2 top-2 cursor-pointer text-lg text-gray-600 hover:text-gray-900"
      onClick={() => {
        setEditingCommentId(c.id);
        setEditingCommentText(c.comment);
      }}
    />
    <MdDelete onClick={()=>handleDeleteComment(c.id)} />
  </div>
))}
{editingCommentId && (
  <EditPopUp
    onClose={() => {
      setEditingCommentId(null);
      setEditingCommentText('');
    }}
    commentId={editingCommentId}
    currentComment={editingCommentText}
    onSave={handleEditComment}/>
)}
      <textarea
        placeholder="Add a team comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-28 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
      />
      <button
        type="button"
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        onClick={handleAddComment}
      >
        Post comment
      </button>
    </div>
  )
}

export default CandidateCommentsTab
