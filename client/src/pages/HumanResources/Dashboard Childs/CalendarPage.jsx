import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from "@/lib/axios";
import { CorporateCalendarEndPoints } from "@/redux/apis/APIsEndpoints";
import { apiService } from "@/apis/apiService";
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Users, 
  MapPin, 
  FileText,
  CalendarDays,
  AlertCircle,
  CheckCircle,
  Briefcase,
  User,
  Save,
  X
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const localizer = momentLocalizer(moment);

export function CalendarPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    eventtitle: '',
    eventdate: '',
    description: '',
    audience: ''
  });
  const [editId, setEditId] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(CorporateCalendarEndPoints.GETALL);
      if (res.data.success) {
        setEvents(res.data.data.map(ev => ({
          ...ev,
          title: ev.eventtitle,
          start: new Date(ev.eventdate),
          end: new Date(ev.eventdate)
        })));
      }
    } catch (e) {
      toast({ 
        title: "Error", 
        description: "Failed to load events",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchEvents(); 
  }, []);

  const handleInput = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.patch(CorporateCalendarEndPoints.UPDATE, { eventID: editId, updatedData: form });
        toast({ title: "Success", description: "Event updated successfully" });
      } else {
        await axios.post(CorporateCalendarEndPoints.CREATE, form);
        toast({ title: "Success", description: "Event created successfully" });
      }
      setShowDialog(false);
      setForm({ eventtitle: '', eventdate: '', description: '', audience: '' });
      setEditId(null);
      fetchEvents();
    } catch (e) {
      toast({ 
        title: "Error", 
        description: "Failed to save event",
        variant: "destructive"
      });
    }
  };

  const handleEdit = event => {
    setForm({
      eventtitle: event.eventtitle,
      eventdate: moment(event.eventdate).format('YYYY-MM-DD'),
      description: event.description,
      audience: event.audience
    });
    setEditId(event._id);
    setShowDialog(true);
  };

  const handleDelete = async eventId => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(CorporateCalendarEndPoints.DELETE(eventId));
      toast({ title: "Success", description: "Event deleted successfully" });
      fetchEvents();
    } catch (e) {
      toast({ 
        title: "Error", 
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.eventdate) >= now)
      .sort((a, b) => new Date(a.eventdate) - new Date(b.eventdate))
      .slice(0, 5);
  };

  const getEventStats = () => {
    const now = new Date();
    const thisMonth = events.filter(event => {
      const eventDate = new Date(event.eventdate);
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    });
    const upcoming = events.filter(event => new Date(event.eventdate) >= now);
    
    return {
      total: events.length,
      thisMonth: thisMonth.length,
      upcoming: upcoming.length,
      past: events.length - upcoming.length
    };
  };

  const stats = getEventStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-700 dark:text-slate-300 mt-4 text-center">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Company Calendar
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Manage corporate events and schedules
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => { 
                      setShowDialog(true); 
                      setEditId(null); 
                      setForm({ eventtitle: '', eventdate: '', description: '', audience: '' }); 
                    }} 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl sm:max-w-[600px] shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {editId ? 'Edit Event' : 'Create New Event'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Event Title</label>
                      <Input 
                        name="eventtitle" 
                        value={form.eventtitle} 
                        onChange={handleInput} 
                        placeholder="Enter event title" 
                        required 
                        className="bg-white/70 dark:bg-slate-700/70"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Event Date</label>
                      <Input 
                        name="eventdate" 
                        type="date" 
                        value={form.eventdate} 
                        onChange={handleInput} 
                        required 
                        className="bg-white/70 dark:bg-slate-700/70"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Target Audience</label>
                      <Input 
                        name="audience" 
                        value={form.audience} 
                        onChange={handleInput} 
                        placeholder="Who is this event for?" 
                        required 
                        className="bg-white/70 dark:bg-slate-700/70"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</label>
                      <Textarea 
                        name="description" 
                        value={form.description} 
                        onChange={handleInput} 
                        placeholder="Event description and details" 
                        required 
                        className="bg-white/70 dark:bg-slate-700/70 min-h-[100px]"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowDialog(false)}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                      {editId && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          onClick={() => handleDelete(editId)}
                          className="rounded-xl"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      )}
                      <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
                      >
                        {editId ? 'Update Event' : 'Create Event'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Events</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">This Month</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.thisMonth}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Upcoming</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.upcoming}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.past}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Calendar and Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl">
            <div className="h-[600px] calendar-container">
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={event => handleEdit(event)}
                className="modern-calendar"
                style={{ height: '100%' }}
              />
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Upcoming Events</h2>
            <div className="space-y-4">
              {getUpcomingEvents().length > 0 ? (
                getUpcomingEvents().map((event, index) => (
                  <div key={event._id || index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl border border-blue-100 dark:border-slate-600 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                          {event.eventtitle}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                          <Calendar className="w-4 h-4" />
                          {moment(event.eventdate).format('MMM DD, YYYY')}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                          <Users className="w-4 h-4" />
                          {event.audience}
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(event)}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No upcoming events</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">Create your first event to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Calendar Styles */}
      <style jsx global>{`
        .calendar-container .rbc-calendar {
          background: transparent;
          color: inherit;
        }
        
        .calendar-container .rbc-header {
          background: rgba(148, 163, 184, 0.1);
          color: inherit;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          padding: 8px;
          font-weight: 600;
        }
        
        .calendar-container .rbc-event {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 12px;
          padding: 2px 6px;
        }
        
        .calendar-container .rbc-event:hover {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          cursor: pointer;
        }
        
        .calendar-container .rbc-day-bg {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .calendar-container .rbc-day-bg:hover {
          background: rgba(59, 130, 246, 0.05);
        }
        
        .calendar-container .rbc-today {
          background: rgba(59, 130, 246, 0.1);
        }
        
        .calendar-container .rbc-off-range-bg {
          background: rgba(148, 163, 184, 0.05);
        }
        
        .calendar-container .rbc-month-view {
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 16px;
          overflow: hidden;
        }
        
        .calendar-container .rbc-date-cell {
          padding: 8px;
        }
        
        .calendar-container .rbc-button-link {
          color: inherit;
        }
        
        .calendar-container .rbc-toolbar {
          margin-bottom: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }
        
        .calendar-container .rbc-btn-group button {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: inherit;
          border-radius: 8px;
          margin: 0 2px;
          padding: 6px 12px;
        }
        
        .calendar-container .rbc-btn-group button:hover {
          background: rgba(59, 130, 246, 0.2);
        }
        
        .calendar-container .rbc-btn-group button.rbc-active {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
        }
      `}</style>
    </div>
  );
}

export default CalendarPage;
