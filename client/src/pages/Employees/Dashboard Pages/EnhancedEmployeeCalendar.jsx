import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { apiService } from '@/apis/apiService';
import { useSelector } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Coffee,
  Home,
  AlertCircle,
  CheckCircle,
  Info,
  CalendarDays
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const localizer = momentLocalizer(moment);

const EnhancedEmployeeCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [mySchedules, setMySchedules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { toast } = useToast();
  const user = useSelector((state) => state.employeereducer?.user);

  const eventTypes = [
    { value: 'all', label: 'All Events', color: 'bg-gray-500' },
    { value: 'meeting', label: 'Meetings', color: 'bg-blue-500' },
    { value: 'holiday', label: 'Holidays', color: 'bg-green-500' },
    { value: 'training', label: 'Training', color: 'bg-purple-500' },
    { value: 'event', label: 'Company Events', color: 'bg-orange-500' },
    { value: 'schedule', label: 'My Schedule', color: 'bg-emerald-500' }
  ];

  // Fetch company events and my schedules
  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      // Fetch company events
      const eventsRes = await apiService.get('/api/v1/corporate-calendar/all');
      let allEvents = [];
      
      if (eventsRes.data.success) {
        const companyEvents = eventsRes.data.data.map(event => ({
          ...event,
          id: `event-${event._id}`,
          start: new Date(event.eventdate + 'T' + '00:00'),
          end: new Date(event.eventdate + 'T' + '23:59'),
          title: event.eventtitle,
          resource: { 
            type: 'event', 
            data: event,
            category: 'event'
          }
        }));
        allEvents = [...allEvents, ...companyEvents];
      }

      // Fetch my work schedules
      if (user && user._id) {
        const schedulesRes = await apiService.get(`/api/v1/schedule/employee/${user._id}`);
        if (schedulesRes.data.success) {
          const myWorkSchedules = schedulesRes.data.data.map(schedule => ({
            id: `schedule-${schedule._id}`,
            start: new Date(schedule.date + 'T' + schedule.startTime),
            end: new Date(schedule.date + 'T' + schedule.endTime),
            title: `Work: ${schedule.shift}`,
            resource: { 
              type: 'schedule', 
              data: schedule,
              category: 'schedule'
            }
          }));
          allEvents = [...allEvents, ...myWorkSchedules];
          setMySchedules(schedulesRes.data.data);
        }
      }

      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  // Filter events based on search term and type
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.resource.data.description && event.resource.data.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || event.resource.category === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // Get today's schedule
  const getTodaySchedule = () => {
    const today = moment().format('YYYY-MM-DD');
    return mySchedules.find(schedule => schedule.date === today);
  };

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = () => {
    const nextWeek = moment().add(7, 'days');
    return events.filter(event => 
      moment(event.start).isBetween(moment(), nextWeek, 'day', '[]')
    ).slice(0, 5);
  };

  // Custom event style
  const eventStyleGetter = (event) => {
    const isSchedule = event.resource.type === 'schedule';
    const isEvent = event.resource.type === 'event';
    
    if (isSchedule) {
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
    
    if (isEvent) {
      const eventType = event.resource.data.type;
      const colorMap = {
        'meeting': '#3b82f6',
        'holiday': '#10b981',
        'training': '#8b5cf6',
        'event': '#f97316',
        'deadline': '#ef4444'
      };
      
      return {
        style: {
          backgroundColor: colorMap[eventType] || '#6b7280',
          borderColor: colorMap[eventType] || '#6b7280',
          color: 'white',
          borderRadius: '6px',
          border: 'none',
          opacity: 0.9
        }
      };
    }
    
    return {};
  };

  // Handle event selection
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const todaySchedule = getTodaySchedule();
  const upcomingEvents = getUpcomingEvents();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">My Calendar</h1>
              <p className="text-gray-300">View company events and your work schedule</p>
            </div>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-400" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaySchedule ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    <span>{todaySchedule.startTime} - {todaySchedule.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <Coffee className="h-4 w-4 text-orange-400" />
                    <span>Break: {todaySchedule.breakStart} - {todaySchedule.breakEnd}</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300">
                    {todaySchedule.scheduleType}
                  </Badge>
                  {todaySchedule.notes && (
                    <p className="text-gray-300 text-sm">{todaySchedule.notes}</p>
                  )}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-4">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No schedule for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-400" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-white">
                  <span className="text-gray-300">Work Days</span>
                  <span className="font-semibold">5/5</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="text-gray-300">Events</span>
                  <span className="font-semibold">{events.filter(e => e.resource.type === 'event').length}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="text-gray-300">Meetings</span>
                  <span className="font-semibold">
                    {events.filter(e => e.resource.data.type === 'meeting').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-2">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-white font-medium truncate">{event.title}</p>
                        <p className="text-gray-400 text-xs">
                          {moment(event.start).format('MMM DD, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-4">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming events</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    {eventTypes.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-white">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Calendar View
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                  Company Events
                </Badge>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300">
                  My Schedule
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-4" style={{ height: '600px' }}>
              <BigCalendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                view={currentView}
                onView={setCurrentView}
                date={currentDate}
                onNavigate={setCurrentDate}
                popup
                step={30}
                showMultiDayTimes
                views={['month', 'week', 'day', 'agenda']}
                tooltipAccessor={(event) => event.resource.data.description || event.title}
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Details Modal */}
        {selectedEvent && (
          <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900/95 backdrop-blur-xl border-white/20 rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{selectedEvent.title}</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span>
                    {moment(selectedEvent.start).format('MMM DD, YYYY HH:mm')} - 
                    {moment(selectedEvent.end).format('HH:mm')}
                  </span>
                </div>
                
                {selectedEvent.resource.data.location && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedEvent.resource.data.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Badge className={`${selectedEvent.resource.type === 'schedule' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}`}>
                    {selectedEvent.resource.type === 'schedule' ? 'Work Schedule' : 'Company Event'}
                  </Badge>
                </div>
                
                {selectedEvent.resource.data.description && (
                  <div className="mt-4">
                    <h4 className="text-white font-medium mb-2">Description</h4>
                    <p className="text-gray-300 text-sm">{selectedEvent.resource.data.description}</p>
                  </div>
                )}

                {selectedEvent.resource.type === 'schedule' && selectedEvent.resource.data.notes && (
                  <div className="mt-4">
                    <h4 className="text-white font-medium mb-2">Notes</h4>
                    <p className="text-gray-300 text-sm">{selectedEvent.resource.data.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedEmployeeCalendar;
