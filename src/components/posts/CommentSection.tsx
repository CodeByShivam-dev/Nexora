import { CornerDownRight, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNexora } from '../../context/NexoraContext';
import { PostComment } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';
import { Avatar } from '../common/Avatar';

interface CommentSectionProps {
  postId: string;
  comments: PostComment[];
}

export function CommentSection({ postId, comments }: CommentSectionProps) {
  const { currentUser, getUserById, addComment, deleteComment, addReplyToComment } =
    useNexora();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(postId, commentText);
    setCommentText('');
  };

  const handleSubmitReply = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addReplyToComment(postId, commentId, replyText);
    setReplyText('');
    setReplyingToId(null);
  };

  return (
    <div className="pt-4 mt-3 border-t border-slate-200 dark:border-[#252D3A] space-y-4">
      {currentUser && (
        <form onSubmit={handleSubmitComment} className="flex items-center gap-2.5">
          <Avatar src={currentUser.avatar} name={currentUser.fullName} size="xs" />
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a thoughtful comment..."
            className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3.5 py-2 text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#8B5CF6]"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="min-h-[38px] min-w-[38px] inline-flex items-center justify-center rounded-xl bg-[#8B5CF6] text-white disabled:opacity-40 hover:bg-[#7C3AED] transition-colors shrink-0"
            aria-label="Post comment"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}

      {comments.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-[#64748B] py-1">
          No comments yet. Start the conversation.
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const author = getUserById(comment.authorId);
            const isOwn = currentUser?.id === comment.authorId;
            return (
              <div key={comment.id} className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <Avatar
                    src={author?.avatar}
                    name={author?.fullName || 'User'}
                    size="xs"
                    onClick={() => author && navigate(`/profile/${author.username}`)}
                  />
                  <div className="flex-1 min-w-0 rounded-xl bg-slate-50 dark:bg-[#0E121A] border border-slate-200/80 dark:border-[#252D3A] px-3.5 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 text-xs">
                        <button
                          type="button"
                          onClick={() => author && navigate(`/profile/${author.username}`)}
                          className="font-semibold text-slate-900 dark:text-[#F8FAFC] hover:underline truncate"
                        >
                          {author?.fullName || 'Creator'}
                        </button>
                        <span className="text-slate-400 dark:text-[#64748B]">·</span>
                        <span className="text-slate-500 dark:text-[#64748B] whitespace-nowrap">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {currentUser && (
                          <button
                            type="button"
                            onClick={() =>
                              setReplyingToId(replyingToId === comment.id ? null : comment.id)
                            }
                            className="text-xs font-medium text-slate-500 dark:text-[#94A3B8] hover:text-[#06B6D4] transition-colors"
                          >
                            Reply
                          </button>
                        )}
                        {isOwn && (
                          <button
                            type="button"
                            onClick={() => deleteComment(postId, comment.id)}
                            className="text-slate-400 hover:text-[#EF4444] transition-colors"
                            aria-label="Delete comment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-slate-800 dark:text-[#E2E8F0] leading-relaxed break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {/* Nested Replies */}
                {comment.replies.length > 0 && (
                  <div className="pl-8 space-y-2">
                    {comment.replies.map((reply) => {
                      const replyAuthor = getUserById(reply.authorId);
                      return (
                        <div key={reply.id} className="flex items-start gap-2">
                          <CornerDownRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#64748B] mt-2 shrink-0" />
                          <Avatar
                            src={replyAuthor?.avatar}
                            name={replyAuthor?.fullName || 'User'}
                            size="xs"
                          />
                          <div className="flex-1 min-w-0 rounded-xl bg-slate-50/70 dark:bg-[#0E121A]/80 border border-slate-200/70 dark:border-[#252D3A] px-3 py-2">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                                {replyAuthor?.fullName || 'Creator'}
                              </span>
                              <span className="text-slate-400 dark:text-[#64748B]">·</span>
                              <span className="text-slate-500 dark:text-[#64748B]">
                                {formatRelativeTime(reply.createdAt)}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-700 dark:text-[#CBD5E1] leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {replyingToId === comment.id && (
                  <form
                    onSubmit={(e) => handleSubmitReply(e, comment.id)}
                    className="pl-8 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${author?.fullName || 'user'}...`}
                      autoFocus
                      className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-[#252D3A] bg-slate-50 dark:bg-[#0E121A] px-3 py-1.5 text-xs text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#06B6D4]"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#06B6D4] text-[#090B10] disabled:opacity-40"
                    >
                      Reply
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
