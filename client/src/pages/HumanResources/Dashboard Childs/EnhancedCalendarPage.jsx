import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
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
  X,
  ChevronDown,
  Search
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const localizer = momentLocalizer(moment);

export default function EnhancedCalendarPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    audience: 'all',
    location: ''
  });

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    employeeId: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    scheduleType: 'regular',
    location: 'Office',
    notes: ''
  });

  const [editId, setEditId] = useState(null);
  const [currentView, setCurrentView] = useState('month');

  // Fetch events and schedules
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch events
      const eventsRes = await apiService.get('/api/v1/corporate-calendar/all');
      if (eventsRes.data.success) {
        const formattedEvents = eventsRes.data.data.map(event => ({
          ...event,
          id: event._id,
          start: new Date(event.eventdate + 'T' + (event.startTime || '00:00')),
          end: new Date(event.eventdate + 'T' + (event.endTime || '23:59')),
          title: event.eventtitle,
          resource: { type: 'event', data: event }
        }));
        setEvents(formattedEvents);
      }

      // Fetch schedules
      const schedulesRes = await apiService.get('/api/v1/schedule/all');
      if (schedulesRes.data.success) {
        const formattedSchedules = schedulesRes.data.data.map(schedule => ({
          id: `schedule-${schedule._id}`,
          start: new Date(schedule.date + 'T' + schedule.startTime),
          end: new Date(schedule.date + 'T' + schedule.endTime),
          title: `${schedule.employeeId.fname} ${schedule.employeeId.lname} - ${schedule.shift}`,
          resource: { type: 'schedule', data: schedule }
        }));
        setEvents(prev => [...prev, ...formattedSchedules]);
      }

      // Fetch employees
      const employeesRes = await apiService.get('/api/v1/employee/all');
      console.log('Raw employees response:', employeesRes); // Debug log
      console.log('Response data:', employeesRes.data); // Debug log
      
      if (employeesRes.data && employeesRes.data.success) {
        const employeesList = employeesRes.data.employees || employeesRes.data.data || [];
        console.log('Processed employees list:', employeesList); // Debug log
        setEmployees(employeesList);
      } else if (employeesRes.data && Array.isArray(employeesRes.data)) {
        // Sometimes API returns direct array
        console.log('Direct array employees:', employeesRes.data); // Debug log
        setEmployees(employeesRes.data);
      } else {
        console.log('No employees found in response'); // Debug log
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Separate function to fetch employees
  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      console.log('Fetching employees specifically for schedule dialog...');
      const response = await apiService.get('/api/v1/employee/all');
      console.log('Employee fetch response:', response);
      
      if (response.data && response.data.success) {
        const employeesList = response.data.employees || response.data.data || [];
        console.log('Setting employees:', employeesList);
        setEmployees(employeesList);
        return employeesList;
      } else if (response.data && Array.isArray(response.data)) {
        console.log('Setting employees from direct array:', response.data);
        setEmployees(response.data);
        return response.data;
      } else {
        console.error('Unexpected employee response format:', response.data);
        toast({
          title: "Warning",
          description: "Could not load employee list. Please refresh the page.",
          variant: "destructive"
        });
        return [];
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees. Please check your connection.",
        variant: "destructive"
      });
      return [];
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle event form submission
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        eventtitle: eventForm.title,
        eventdate: moment(eventForm.date).format('YYYY-MM-DD'),
        description: eventForm.description,
        audience: eventForm.audience
      };

      if (editId && editId.startsWith('event-')) {
        await apiService.put(`/api/v1/corporate-calendar/update-event`, {
          ...eventData,
          id: editId.replace('event-', '')
        });
        toast({ title: "Success", description: "Event updated successfully" });
      } else {
        await apiService.post('/api/v1/corporate-calendar/create-event', eventData);
        toast({ title: "Success", description: "Event created successfully" });
      }

      setShowEventDialog(false);
      resetEventForm();
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive"
      });
    }
  };

  // Handle schedule form submission
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const scheduleData = {
        employeeId: scheduleForm.employeeId,
        date: moment(scheduleForm.date).format('YYYY-MM-DD'),
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        shift: scheduleForm.scheduleType,
        location: scheduleForm.location,
        notes: scheduleForm.notes
      };

      if (editId && editId.startsWith('schedule-')) {
        await apiService.put(`/api/v1/schedule/update-schedule/${editId.replace('schedule-', '')}`, scheduleData);
        toast({ title: "Success", description: "Schedule updated successfully" });
      } else {
        await apiService.post('/api/v1/schedule/create-schedule', scheduleData);
        toast({ title: "Success", description: "Schedule created successfully" });
      }

      setShowScheduleDialog(false);
      resetScheduleForm();
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save schedule",
        variant: "destructive"
      });
    }
  };

  // Handle event deletion
  const handleDelete = async (eventId) => {
    try {
      if (eventId.startsWith('event-')) {
        await apiService.delete(`/api/v1/corporate-calendar/delete-event/${eventId.replace('event-', '')}`);
      } else if (eventId.startsWith('schedule-')) {
        await apiService.delete(`/api/v1/schedule/delete-schedule/${eventId.replace('schedule-', '')}`);
      }
      
      toast({ title: "Success", description: "Item deleted successfully" });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      });
    }
  };

  // Reset forms
  const resetEventForm = () => {
    setEventForm({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
      audience: 'all',
      location: ''
    });
    setEditId(null);
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      employeeId: '',
      date: '',
      startTime: '09:00',
      endTime: '17:00',
      scheduleType: 'regular',
      location: 'Office',
      notes: ''
    });
    setEditId(null);
  };

  // Handle calendar slot selection
  const handleSelectSlot = ({ start, end }) => {
    setSelectedDate(moment(start).format('YYYY-MM-DD'));
    setEventForm(prev => ({ 
      ...prev, 
      date: moment(start).format('YYYY-MM-DD'),
      startTime: moment(start).format('HH:mm'),
      endTime: moment(end).format('HH:mm')
    }));
    setShowEventDialog(true);
  };

  // Handle event selection
  const handleSelectEvent = async (event) => {
    if (event.resource.type === 'event') {
      setEventForm({
        title: event.resource.data.eventtitle,
        date: moment(event.resource.data.eventdate).format('YYYY-MM-DD'),
        startTime: event.resource.data.startTime || '',
        endTime: event.resource.data.endTime || '',
        description: event.resource.data.description || '',
        audience: event.resource.data.audience || 'all',
        location: event.resource.data.location || ''
      });
      setEditId(event.id);
      setShowEventDialog(true);
    } else if (event.resource.type === 'schedule') {
      setScheduleForm({
        employeeId: event.resource.data.employeeId._id,
        date: moment(event.resource.data.date).format('YYYY-MM-DD'),
        startTime: event.resource.data.startTime,
        endTime: event.resource.data.endTime,
        scheduleType: event.resource.data.shift,
        location: event.resource.data.location || 'Office',
        notes: event.resource.data.notes || ''
      });
      setEditId(event.id);
      // Fetch employees before opening dialog
      await fetchEmployees();
      setShowScheduleDialog(true);
    }
  };

  // Event style getter
  const eventStyleGetter = (event) => {
    if (event.resource.type === 'schedule') {
      return {
        style: {
          backgroundColor: '#10b981',
          borderColor: '#059669',
          color: 'white',
          borderRadius: '6px',
          border: 'none',
          opacity: 0.9
        }
      };
    }
    return {
      style: {
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        color: 'white',
        borderRadius: '6px',
        border: 'none',
        opacity: 0.9
      }
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">HR Calendar Management</h1>
            <p className="text-gray-300">Manage company events and employee schedules</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                resetEventForm();
                if (selectedDate) {
                  setEventForm(prev => ({ ...prev, date: selectedDate }));
                }
                setShowEventDialog(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
            <Button
              onClick={async () => {
                resetScheduleForm();
                if (selectedDate) {
                  setScheduleForm(prev => ({ ...prev, date: selectedDate }));
                }
                // Fetch employees before opening dialog
                await fetchEmployees();
                setShowScheduleDialog(true);
              }}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Schedule Employee
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Calendar Overview
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                  Events
                </Badge>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                  Schedules
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-4" style={{ height: '600px' }}>
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                selectable
                eventPropGetter={eventStyleGetter}
                view={currentView}
                onView={setCurrentView}
                popup
                step={30}
                showMultiDayTimes
                views={['month', 'week', 'day', 'agenda']}
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="bg-white border-0 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-gray-100 pb-6">
              <DialogTitle className="flex items-center gap-3 text-gray-900 text-xl font-semibold">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                {editId ? 'Edit Company Event' : 'Create New Company Event'}
              </DialogTitle>
              <p className="text-gray-500 text-sm mt-2">
                {editId ? 'Update event details below' : 'Fill in the details to create a new company event'}
              </p>
            </DialogHeader>
            
            <form onSubmit={handleEventSubmit} className="space-y-6 pt-6">
              {/* Event Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Event Title *
                </label>
                <Input
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                  placeholder="e.g., Team Meeting, Company Announcement"
                  required
                />
              </div>

              {/* Date and Audience Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    Date *
                  </label>
                  <Input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    Audience
                  </label>
                  <Select value={eventForm.audience} onValueChange={(value) => setEventForm({ ...eventForm, audience: value })}>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-11">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="all">All Employees</SelectItem>
                      <SelectItem value="management">Management Only</SelectItem>
                      <SelectItem value="department">Department Specific</SelectItem>
                      <SelectItem value="hr">HR Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Time Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    Start Time
                  </label>
                  <Input
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    End Time
                  </label>
                  <Input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  Location
                </label>
                <Input
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-11"
                  placeholder="e.g., Conference Room A, Online, Main Office"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Description
                </label>
                <Textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 min-h-[100px] resize-none"
                  placeholder="Provide event details, agenda, or important information..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEventDialog(false);
                    resetEventForm();
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 shadow-lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editId ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="bg-white border-0 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-gray-100 pb-6">
              <DialogTitle className="flex items-center gap-3 text-gray-900 text-xl font-semibold">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                {editId ? 'Edit Employee Schedule' : 'Create Employee Work Schedule'}
              </DialogTitle>
              <p className="text-gray-500 text-sm mt-2">
                {editId ? 'Update the work schedule details below' : 'Assign a work schedule to an employee with specific hours and requirements'}
              </p>
            </DialogHeader>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-6 pt-6">
              {/* Employee Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    Select Employee *
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchEmployees}
                    disabled={employeesLoading}
                    className="text-xs"
                  >
                    {employeesLoading ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>
                <Select value={scheduleForm.employeeId} onValueChange={(value) => setScheduleForm({ ...scheduleForm, employeeId: value })}>
                  <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500 h-12">
                    <SelectValue placeholder={employeesLoading ? "Loading employees..." : "Choose an employee to assign schedule"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 max-h-48">
                    {employeesLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin h-6 w-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p>Loading employees...</p>
                      </div>
                    ) : employees.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>No employees found</p>
                        <p className="text-xs">Please check your employee records or try refreshing</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={fetchEmployees}
                          className="mt-2 text-xs"
                        >
                          Retry Loading
                        </Button>
                      </div>
                    ) : (
                      employees.map(employee => (
                        <SelectItem 
                          key={employee._id} 
                          value={employee._id} 
                          className="hover:bg-gray-50 cursor-pointer p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {employee.fname || employee.firstName} {employee.lname || employee.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{employee.email}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date and Shift Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    Schedule Date *
                  </label>
                  <Input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500 h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    Shift Type
                  </label>
                  <Select value={scheduleForm.scheduleType} onValueChange={(value) => setScheduleForm({ ...scheduleForm, scheduleType: value })}>
                    <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500 h-11">
                      <SelectValue placeholder="Select shift type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="regular">Regular Hours (9 AM - 5 PM)</SelectItem>
                      <SelectItem value="morning">Morning Shift (6 AM - 2 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon Shift (2 PM - 10 PM)</SelectItem>
                      <SelectItem value="evening">Evening Shift (6 PM - 2 AM)</SelectItem>
                      <SelectItem value="night">Night Shift (10 PM - 6 AM)</SelectItem>
                      <SelectItem value="custom">Custom Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    Start Time *
                  </label>
                  <Input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500 h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    End Time *
                  </label>
                  <Input
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500 h-11"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  Work Location
                </label>
                <Input
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                  className="border-gray-200 focus:border-green-500 focus:ring-green-500 h-11"
                  placeholder="e.g., Main Office, Remote, Branch Office, Client Site"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Additional Notes
                </label>
                <Textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  className="border-gray-200 focus:border-green-500 focus:ring-green-500 min-h-[80px] resize-none"
                  placeholder="Add any special instructions, requirements, or important information for this schedule..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowScheduleDialog(false);
                    resetScheduleForm();
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 shadow-lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editId ? 'Update Schedule' : 'Create Schedule'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Debug Button for Employee Loading */}
        <div className="fixed bottom-4 right-4 z-50">
        </div>
      </div>
    </div>
  );
}
