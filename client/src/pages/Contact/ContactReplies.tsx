import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import api from "../../utils/api";
import { ArrowLeft } from "lucide-react";

interface Reply {
  id: string;
  reply: string;
  created_at: string;
}

export function ContactReplies() {
  const { id } = useParams();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const res = await api.get(`/contacts/${id}/replies`);
        setReplies(res.data.replies || []);
      } catch (error) {
        console.error("❌ Failed to fetch replies:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchReplies();
  }, [id]);

  if (loading) return <p className="p-6">Loading replies...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button size="sm" variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Contact Details
      </Button>

      <Card className="p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Replies</h1>

        {replies.length > 0 ? (
          replies.map((reply) => (
            <div
              key={reply.id}
              className="bg-green-50 border border-green-200 p-3 rounded-lg shadow-sm"
            >
              <p className="text-gray-800">{reply.reply}</p>
              <p className="text-xs text-gray-500 mt-1">
                Replied on {new Date(reply.created_at).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No replies yet.</p>
        )}
      </Card>
    </div>
  );
}

export default ContactReplies;
