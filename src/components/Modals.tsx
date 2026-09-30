import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostComposer } from './PostComposer';
import {
  X,
  Share2,
  Copy,
  Check,
  FolderPlus,
  AlertTriangle,
  Lock,
  Globe,
} from 'lucide-react';

interface ModalsProps {
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
}

export const Modals: React.FC<ModalsProps> = ({ isCreateModalOpen, onCloseCreateModal }) => {
  const {
    shareModalPost,
    setShareModalPost,
    previewImage,
    setPreviewImage,
    confirmDialog,
    closeConfirmDialog,
    createCollection,
    showToast,
  } = useApp();

  const [copied, setCopied] = useState(false);

  // New Collection State
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);
  const [colName, setColName] = useState('');
  const [colDesc, setColDesc] = useState('');
  const [colPrivacy, setColPrivacy] = useState<'Public' | 'Private'>('Public');

  const handleCopyLink = () => {
    if (shareModalPost) {
      navigator.clipboard.writeText(`https://nexora.network/post/${shareModalPost.id}`);
      setCopied(true);
      showToast('Post link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim()) return;
    createCollection(colName.trim(), colDesc.trim(), colPrivacy);
    setColName('');
    setColDesc('');
    setIsNewCollectionOpen(false);
  };

  return (
    <>
      {/* 1. Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-base font-semibold text-[var(--text)]">Create Post</h3>
              <button
                onClick={onCloseCreateModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3">
              <PostComposer onPostSuccess={onCloseCreateModal} />
            </div>
          </div>
        </div>
      )}

      {/* 2. Share Modal */}
      {shareModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-[var(--primary)]" />
                <h3 className="text-base font-semibold text-[var(--text)]">Share Post</h3>
              </div>
              <button
                onClick={() => setShareModalPost(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] p-3 text-xs text-[var(--text-secondary)] line-clamp-3">
                "{shareModalPost.content}"
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1">
                  Share via Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://nexora.network/post/${shareModalPost.id}`}
                    className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90 transition-all shrink-0"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  onClick={() => {
                    setShareModalPost(null);
                    showToast('Shared to your feed!', 'success');
                  }}
                  className="rounded-xl border border-[var(--border)] py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
                >
                  Repost to Feed
                </button>
                <button
                  onClick={() => {
                    setShareModalPost(null);
                    showToast('Sent in private message', 'success');
                  }}
                  className="rounded-xl bg-[var(--surface-secondary)] py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--border)] transition-colors"
                >
                  Send via Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Image Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

      {/* 4. Confirmation Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  confirmDialog.danger ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40' : 'bg-amber-100 text-amber-600'
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[var(--text)]">{confirmDialog.title}</h4>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-5">
              {confirmDialog.message}
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirmDialog}
                className="rounded-xl border border-[var(--border)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-secondary)] transition-colors"
              >
                {confirmDialog.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  closeConfirmDialog();
                }}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-opacity ${
                  confirmDialog.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[var(--primary)] hover:opacity-90'
                }`}
              >
                {confirmDialog.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
