import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { Card } from "../../components/UI/Card";
import { Search, Calendar, MessageCircle } from "lucide-react";
import { Button } from '../../components/UI/Button';

interface Reply {
  id: string;
  reply: string;
  created_at: string;
}

interface ContactInquiry {
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

export default function UserContactList() {
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReplies, setSelectedReplies] = useState<Reply[] | null>(null);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await api.post("/contacts/my-contacts");
        setContacts(res.data.contacts || []);
      } catch (err) {
        console.error("❌ Failed to fetch user contacts:", err);
      }
    };
    fetchContacts();
  }, []);

  const fetchReplies = async (inquiryId: string) => {
    try {
      setLoadingReplies(true);
      const res = await api.post(`/contacts/${inquiryId}/response`);
      setSelectedReplies(res.data.replies || []);
    } catch (err) {
      console.error("❌ Failed to fetch replies:", err);
      setSelectedReplies([]);
    } finally {
      setLoadingReplies(false);
    }
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">My Contact Inquiries</h1>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search inquiries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full border rounded-md p-2"
        />
      </div>

      {/* No inquiries */}
      {filteredContacts.length === 0 ? (
        <Card className="text-center py-12">
          <MessageCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            No inquiries found
          </h3>
          <p className="text-gray-500 text-sm">
            You haven’t submitted any contact inquiries yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredContacts.map((contact) => (
         <Card key={contact.id} className="p-4">
  {/* Top Row: Subject + Status */}
  <div className="flex justify-between items-start">
    {/* Left side - subject, message, created date */}
    <div
      className="cursor-pointer flex-1"
      // onClick={() => navigate(`/my-inquiries/${contact.id}/replies`)}
    >
      <h2 className="font-semibold">{contact.subject}</h2>
      <p className="text-sm text-gray-600 line-clamp-1">{contact.message}</p>
      <p className="text-xs text-gray-500 flex items-center mt-1">
        <Calendar className="h-3 w-3 mr-1" />
        {new Date(contact.created_at).toLocaleString()}
      </p>
    </div>

    {/* Right side - status badge + View Replies button */}
    <div className="flex flex-col items-end ml-3">
      <span
        className={`text-xs px-3 py-1 rounded-full ${
          contact.status === "responded"
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {contact.status.toUpperCase()}
      </span>

      {/* ✅ View Replies Button (below badge) */}
      <Button
        type="button"
        onClick={() => fetchReplies(contact.id)}
        className="flex items-center mt-2"
      >
        View Replies
      </Button>
    </div>
  </div>
</Card>


          ))}
        </div>
      )}

      {/* ✅ Replies Modal */}
      {selectedReplies && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Replies</h2>

            {loadingReplies ? (
              <p className="text-gray-500 text-sm">Loading replies...</p>
            ) : selectedReplies.length === 0 ? (
              <p className="text-gray-500 text-sm">No replies yet.</p>
            ) : (
              <ul className="space-y-3 max-h-64 overflow-y-auto">
                {selectedReplies.map((reply) => (
                  <li
                    key={reply.id}
                    className="border rounded-md p-3 bg-gray-50"
                  >
                    <p className="text-sm text-gray-700">{reply.reply}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(reply.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedReplies(null)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
