import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import api from "../../utils/api";
import {
  Mail,
  Calendar,
  User,
  ArrowLeft,
  CheckCircle,
  MessageSquarePlus,
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  inquiry_type: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  responded_at?: string;
}

interface Reply {
  id: string;
  inquiry_id: string;
  admin_id: string;
  reply: string;
  created_at: string;
}

export function ContactViews() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contact, setContact] = useState<Contact | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyBoxOpen, setReplyBoxOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Fetch contact
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await api.get(`/contacts/${id}`);
        setContact(res.data.contact || null);
      } catch (error) {
        console.error("❌ Failed to fetch contact:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReplies = async () => {
      try {
        const res = await api.get(`/contacts/${id}/replies`);
        setReplies(res.data.replies || []);
      } catch (error) {
        console.error("❌ Failed to fetch replies:", error);
      }
    };

    if (id) {
      fetchContact();
      fetchReplies();
    }
  }, [id]);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    try {
      setSendingReply(true);
      await api.post(`/contacts/${id}/reply`, { reply: replyText });
      setReplyText("");
      setReplyBoxOpen(false);

      // Refresh replies + contact (to update status)
      const replyRes = await api.get(`/contacts/${id}/replies`);
      setReplies(replyRes.data.replies || []);

      const contactRes = await api.get(`/contacts/${id}`);
      setContact(contactRes.data.contact || null);
    } catch (error) {
      console.error("❌ Failed to send reply:", error);
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      responded: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return badges[priority as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  if (loading) return <p className="p-6">Loading contact details...</p>;
  if (!contact) return <p className="p-6 text-red-500">Contact not found</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Contact Management
      </Button>

      <Card className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
            <p className="text-gray-600 capitalize">{contact.inquiry_type}</p>
            <p className="text-sm text-gray-500">
              <Calendar className="inline-block h-4 w-4 mr-1" />
              {new Date(contact.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Status + Priority */}
        <div className="flex gap-2 mb-4">
          <span
            className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusBadge(
              contact.status
            )}`}
          >
            {contact.status.replace("_", " ").toUpperCase()}
          </span>
          <span
            className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityBadge(
              contact.priority
            )}`}
          >
            {contact.priority?.toUpperCase()}
          </span>
        </div>

        {/* Contact Details */}
        <div className="space-y-4 text-gray-700">
          <p>
            <Mail className="inline-block h-4 w-4 mr-2" />
            {contact.email}
          </p>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">Subject</h2>
            <p className="mt-1">{contact.subject}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">Message</h2>
            <p className="mt-1">{contact.message}</p>
          </div>

          {contact.responded_at && (
            <p className="flex items-center text-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Responded on {new Date(contact.responded_at).toLocaleString()}
            </p>
          )}
        </div>
      </Card>

      {/* Replies Section */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5" />
          Replies
        </h2>

        {replies.length === 0 && (
          <p className="text-gray-500 text-sm">No replies yet.</p>
        )}

        {replies.map((r) => (
          <div
            key={r.id}
            className="p-3 rounded-lg border bg-gray-50 text-gray-800"
          >
            <p className="text-sm">{r.reply}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(r.created_at).toLocaleString()}
            </p>
          </div>
        ))}

        {/* Reply Box Toggle */}
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setReplyBoxOpen(!replyBoxOpen)}
        >
          {replyBoxOpen ? "Cancel" : "Add Reply"}
        </Button>

        {/* Reply Form */}
        {replyBoxOpen && (
          <div className="mt-4 space-y-3">
            <textarea
              className="w-full border rounded-lg p-2 text-sm"
              rows={3}
              placeholder="Write your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button
              onClick={handleReplySubmit}
              disabled={sendingReply || !replyText.trim()}
            >
              {sendingReply ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ContactViews;
