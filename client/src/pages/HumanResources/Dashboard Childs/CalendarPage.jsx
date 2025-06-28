import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui";
import { useToast } from "@/components/ui/use-toast";
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from "@/lib/axios";
import { CorporateCalendarEndPoints } from "@/redux/apis/APIsEndpoints";

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
      toast({ variant: "destructive", title: "Error", description: "Failed to load events" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleInput = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.patch(CorporateCalendarEndPoints.UPDATE, { eventID: editId, updatedData: form });
        toast({ title: "Event updated" });
      } else {
        await axios.post(CorporateCalendarEndPoints.CREATE, form);
        toast({ title: "Event created" });
      }
      setShowDialog(false);
      setForm({ eventtitle: '', eventdate: '', description: '', audience: '' });
      setEditId(null);
      fetchEvents();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save event" });
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
    if (!window.confirm('Delete this event?')) return;
    try {
      await axios.delete(CorporateCalendarEndPoints.DELETE(eventId));
      toast({ title: "Event deleted" });
      fetchEvents();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete event" });
    }
  };  return (
    <div className="p-6 bg-white dark:bg-neutral-900 min-h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <img src="/../../src/assets/HR-Dashboard/calendar.png" alt="Calendar" className="w-8 h-8 dark:brightness-0 dark:invert" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">Company Calendar</h1>
        </div>
        <Button onClick={() => { setShowDialog(true); setEditId(null); setForm({ eventtitle: '', eventdate: '', description: '', audience: '' }); }} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">Add Event</Button>
      </div>
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          onSelectEvent={event => handleEdit(event)}
          className="dark:text-neutral-100"
        />
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-neutral-100">{editId ? 'Edit Event' : 'Add Event'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              name="eventtitle" 
              value={form.eventtitle} 
              onChange={handleInput} 
              placeholder="Title" 
              required 
              className="w-full border border-gray-300 dark:border-neutral-600 p-2 rounded bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-400" 
            />
            <input 
              name="eventdate" 
              type="date" 
              value={form.eventdate} 
              onChange={handleInput} 
              required 
              className="w-full border border-gray-300 dark:border-neutral-600 p-2 rounded bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100" 
            />
            <input 
              name="audience" 
              value={form.audience} 
              onChange={handleInput} 
              placeholder="Audience" 
              required 
              className="w-full border border-gray-300 dark:border-neutral-600 p-2 rounded bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-400" 
            />
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleInput} 
              placeholder="Description" 
              required 
              className="w-full border border-gray-300 dark:border-neutral-600 p-2 rounded bg-white dark:bg-neutral-700 text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-400" 
            />
            <div className="flex gap-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">{editId ? 'Update' : 'Create'}</Button>
              {editId && <Button type="button" variant="destructive" onClick={() => handleDelete(editId)} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">Delete</Button>}
              <Button type="button" variant="outline" onClick={() => { setShowDialog(false); setEditId(null); }} className="border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700">Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CalendarPage;
