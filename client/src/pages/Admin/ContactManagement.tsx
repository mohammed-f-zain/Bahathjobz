import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import api from '../../utils/api'; 
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Mail, 
  Calendar, 
  User,
  MessageCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Reply,
  Building2,
  Heart,
  Handshake
} from 'lucide-react';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'responded', label: 'Responded' },
  // { value: 'closed', label: 'Closed' },
];

const inquiryTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'job_seeker', label: 'Job Seeker Support' },
  { value: 'employer', label: 'Employer Support' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'feedback', label: 'Feedback & Suggestions' },
];

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function ContactManagement() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [inquiryTypeFilter, setInquiryTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const navigate = useNavigate();

  // ✅ Fetch contacts from backend
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await api.get("/contacts");
        setContacts(res.data.contacts || []);
      } catch (error) {
        console.error("❌ Failed to fetch contacts:", error);
      }
    };
    fetchContacts();
  }, []);

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      responded: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return badges[priority as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getInquiryTypeIcon = (type: string) => {
    const icons = {
      general: MessageCircle,
      job_seeker: User,
      employer: Building2,
      technical: AlertCircle,
      partnership: Handshake,
      feedback: Heart,
    };
    return icons[type as keyof typeof icons] || MessageCircle;
  };

  // ✅ Update contact status API call
  const handleStatusChange = async (contactId: string, newStatus: string) => {
    try {
      const res = await api.patch(`/contacts/${contactId}/status`, { status: newStatus });
      if (res.status === 200) {
        setContacts((prev) =>
          prev.map((c) => (c.id === contactId ? { ...c, status: newStatus } : c))
        );
        console.log("✅ Status updated:", res.data);
      }
    } catch (err) {
      console.error("❌ Error updating contact status:", err);
    }
  };

  // ✅ Apply filters
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || contact.status === statusFilter;
    const matchesType = !inquiryTypeFilter || contact.inquiry_type === inquiryTypeFilter;
    const matchesPriority = !priorityFilter || contact.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Management</h1>
          <p className="text-gray-600">Manage user inquiries and support requests</p>
        </div>
        {/* <Button>
          <Mail className="h-4 w-4 mr-2" />
          Export Report
        </Button> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
            <p className="text-sm text-gray-600">Total Inquiries</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {contacts.filter(c => c.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {contacts.filter(c => c.status === 'in_progress').length}
            </p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {contacts.filter(c => c.status === 'responded').length}
            </p>
            <p className="text-sm text-gray-600">Responded</p>
          </div>
        </Card>      
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Filter by status"
          />
          <Select
            options={inquiryTypeOptions}
            value={inquiryTypeFilter}
            onChange={(e) => setInquiryTypeFilter(e.target.value)}
            placeholder="Filter by type"
          />
          <Select
            options={priorityOptions}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            placeholder="Filter by priority"
          />          
        </div>
      </Card>

      {/* Contact Inquiries List */}
      <div className="space-y-4">
        {filteredContacts.map((contact) => {
          const TypeIcon = getInquiryTypeIcon(contact.inquiry_type);
          return (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <TypeIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(contact.status)}`}>
                            {contact.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(contact.priority)}`}>
                            {contact.priority?.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            {contact.inquiry_type?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 mb-1">{contact.subject}</h4>
                    <p className="text-gray-700 text-sm line-clamp-2">{contact.message}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(contact.created_at).toLocaleDateString()}
                      </span>
                      {contact.responded_at && (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Responded {new Date(contact.responded_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {/* <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button> */}
                   <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/contactView/${contact.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {contact.status === 'pending' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleStatusChange(contact.id, 'in_progress')}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  )}
                  {/* {['pending', 'in_progress'].includes(contact.status) && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleStatusChange(contact.id, 'responded')}
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  )} */}
                  {/* <Button size="sm">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button> */}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredContacts.length === 0 && (
        <Card className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No contact inquiries found</h3>
          <p className="text-gray-600">
            {contacts.length === 0 ? 'No contact inquiries have been submitted yet' : 'Try adjusting your search criteria'}
          </p>
        </Card>
      )}
    </div>
  );
}
