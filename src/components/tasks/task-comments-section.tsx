"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type Comment,
  createComment,
  deleteComment,
  getCommentsByTask,
  updateComment,
} from "@/actions/comment.action";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TaskCommentsSection({
  taskId,
  canManage = true,
}: {
  taskId: string;
  canManage?: boolean;
}) {
  const [items, setItems] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function load() {
    const result = await getCommentsByTask(taskId);
    if (result.success) setItems(result.data);
    else toast.error(result.message ?? "Unable to load comments.");
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies: reload when the selected task changes
  useEffect(() => {
    void load();
  }, [taskId]);
  async function save() {
    if (!content.trim()) return;
    setLoading(true);
    const result = editing
      ? await updateComment(editing, { content: content.trim() })
      : await createComment(taskId, { content: content.trim() });
    setLoading(false);
    if (!result.success)
      return toast.error(result.message ?? "Unable to save comment.");
    setContent("");
    setEditing(null);
    void load();
  }
  async function remove(id: string) {
    const result = await deleteComment(id);
    if (!result.success)
      toast.error(result.message ?? "Unable to delete comment.");
    else void load();
  }
  return (
    <section className="space-y-3" aria-labelledby="task-comments-heading">
      <div>
        <h3
          id="task-comments-heading"
          className="font-heading text-sm font-semibold"
        >
          Comments
        </h3>
        <p className="text-xs text-muted-foreground">
          Keep decisions and context attached to the task.
        </p>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No comments yet.
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm">{item.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.author?.fullName ?? "Team member"}
                  </p>
                </div>
                {canManage && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit comment"
                      onClick={() => {
                        setEditing(item.id);
                        setContent(item.content);
                      }}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete comment"
                      onClick={() => void remove(item.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <Textarea
        aria-label="Comment"
        placeholder="Add context for the team..."
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        {editing && (
          <Button
            variant="outline"
            onClick={() => {
              setEditing(null);
              setContent("");
            }}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={() => void save()}
          disabled={loading || !content.trim()}
        >
          {editing ? "Save comment" : "Add comment"}
        </Button>
      </div>
    </section>
  );
}
