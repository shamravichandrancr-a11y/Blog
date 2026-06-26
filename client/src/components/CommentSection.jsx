import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { commentService } from '../services';
import { timeAgo, getAvatarUrl } from '../utils';
import { HiHeart, HiReply, HiTrash, HiPencil, HiCheck, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Comment = ({ comment, blogId, onDelete, depth = 0 }) => {
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(comment.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(comment.likes?.length || 0);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [replies, setReplies] = useState(comment.replies || []);

  const handleLike = async () => {
    if (!isAuthenticated) return toast.error('Login to like');
    try {
      const { data } = await commentService.toggleLike(comment._id);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {}
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      const { data } = await commentService.createComment({ content: replyText, blogId, parentComment: comment._id });
      setReplies(prev => [data.comment, ...prev]);
      setReplyText('');
      setReplying(false);
    } catch { toast.error('Failed to add reply'); }
  };

  const handleEdit = async () => {
    try {
      await commentService.updateComment(comment._id, { content: editText });
      comment.content = editText;
      setEditing(false);
    } catch { toast.error('Failed to update comment'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentService.deleteComment(comment._id);
      onDelete(comment._id);
    } catch { toast.error('Failed to delete comment'); }
  };

  const isOwner = user?._id === comment.author?._id || user?.role === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}
    >
      <img src={getAvatarUrl(comment.author)} alt={comment.author?.name}
        className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0 mt-1" />

      <div className="flex-1">
        <div className="neo-card p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-sm font-semibold text-zinc-200">{comment.author?.name}</span>
              <span className="text-xs text-zinc-600 ml-2">{timeAgo(comment.createdAt)}</span>
              {comment.isEdited && <span className="text-xs text-zinc-700 ml-2">(edited)</span>}
            </div>
            {isOwner && (
              <div className="flex items-center gap-1">
                <button onClick={() => setEditing(!editing)} className="text-zinc-600 hover:text-zinc-300 transition-colors p-1">
                  <HiPencil size={13} />
                </button>
                <button onClick={handleDelete} className="text-zinc-600 hover:text-red-400 transition-colors p-1">
                  <HiTrash size={13} />
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-2">
              <textarea value={editText} onChange={e => setEditText(e.target.value)}
                className="neo-input p-3 text-sm resize-none w-full" rows={3} />
              <div className="flex gap-2">
                <button onClick={handleEdit} className="neo-button px-3 py-1.5 text-xs flex items-center gap-1 text-green-400">
                  <HiCheck size={13} /> Save
                </button>
                <button onClick={() => setEditing(false)} className="neo-button px-3 py-1.5 text-xs flex items-center gap-1 text-zinc-400">
                  <HiX size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-300 leading-relaxed">{comment.content}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2 px-1">
          <button onClick={handleLike} className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? 'text-red-400' : 'text-zinc-600 hover:text-zinc-300'}`}>
            <HiHeart size={13} className={liked ? 'fill-red-400' : ''} />
            {likeCount > 0 && likeCount}
          </button>
          {isAuthenticated && depth < 2 && (
            <button onClick={() => setReplying(!replying)} className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors">
              <HiReply size={13} /> Reply
            </button>
          )}
        </div>

        {/* Reply Input */}
        <AnimatePresence>
          {replying && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 ml-2">
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="neo-input p-3 text-sm resize-none w-full" rows={2} />
              <div className="flex gap-2 mt-2">
                <button onClick={handleReply} className="neo-button-primary neo-button px-3 py-1.5 text-xs">Reply</button>
                <button onClick={() => setReplying(false)} className="neo-button px-3 py-1.5 text-xs text-zinc-400">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nested Replies */}
        {replies.length > 0 && (
          <div>
            {replies.map(reply => (
              <Comment key={reply._id} comment={reply} blogId={blogId} onDelete={(id) => setReplies(prev => prev.filter(r => r._id !== id))} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function CommentSection({ blogId }) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await commentService.getComments(blogId);
        setComments(data.comments);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;
    setSubmitting(true);
    try {
      const { data } = await commentService.createComment({ content: newComment, blogId });
      setComments(prev => [data.comment, ...prev]);
      setNewComment('');
      toast.success('Comment added');
    } catch { toast.error('Failed to post comment'); } finally { setSubmitting(false); }
  };

  return (
    <div className="mt-12">
      <h3 className="font-clash text-2xl font-bold text-white mb-6">
        Comments <span className="text-zinc-600 text-lg">({comments.length})</span>
      </h3>

      {/* Comment Input */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="neo-card p-5 mb-6">
          <div className="flex gap-3">
            <img src={getAvatarUrl(user)} alt={user?.name}
              className="w-9 h-9 rounded-full object-cover border border-white/10 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="neo-input p-4 text-sm resize-none w-full min-h-[100px]" />
              <div className="flex justify-end">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  type="submit" disabled={submitting || !newComment.trim()}
                  className="neo-button-primary neo-button px-5 py-2 text-sm font-semibold disabled:opacity-50">
                  {submitting ? 'Posting...' : 'Post Comment'}
                </motion.button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="neo-card p-6 text-center mb-6">
          <p className="text-zinc-500 text-sm">
            <a href="/login" className="text-zinc-300 underline underline-offset-4">Login</a> to join the conversation
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : comments.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-zinc-500">Be the first to comment</p>
        </div>
      ) : (
        <div>
          {comments.map(comment => (
            <Comment key={comment._id} comment={comment} blogId={blogId}
              onDelete={(id) => setComments(prev => prev.filter(c => c._id !== id))} />
          ))}
        </div>
      )}
    </div>
  );
}
