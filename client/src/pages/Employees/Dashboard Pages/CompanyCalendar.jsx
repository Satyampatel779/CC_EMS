import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const CompanyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock events data
  const mockEvents = [
    {
      id: 1,
      title: 'New Year Holiday',
      type: 'holiday',
      date: '2024-01-01',
      startTime: null,
      endTime: null,
      location: null,
      description: 'Company holiday - All offices closed',
      isAllDay: true
    },
    {
      id: 2,
      title: 'Q1 All Hands Meeting',
      type: 'meeting',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '11:30',
      location: 'Main Conference Room',
      description: 'Quarterly company meeting to discuss goals and achievements',
      isAllDay: false
    },
    {
      id: 3,
      title: 'Team Building Event',
      type: 'event',
      date: '2024-01-20',
      startTime: '14:00',
      endTime: '18:00',
      location: 'Adventure Park',
      description: 'Annual team building activities and dinner',
      isAllDay: false
    },
    {
      id: 4,
      title: 'Professional Development Day',
      type: 'training',
      date: '2024-02-05',
      startTime: '09:00',
      endTime: '17:00',
      location: 'Training Center',
      description: 'Company-wide professional development and training sessions',
      isAllDay: false
    },
    {
      id: 5,
      title: 'Independence Day',
      type: 'holiday',
      date: '2024-07-04',
      startTime: null,
      endTime: null,
      location: null,
      description: 'National holiday - All offices closed',
      isAllDay: true
    },
    {
      id: 6,
      title: 'Company Anniversary Celebration',
      type: 'event',
      date: '2024-03-15',
      startTime: '18:00',
      endTime: '22:00',
      location: 'Grand Ballroom',
      description: 'Celebrating 10 years of company excellence',
      isAllDay: false
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'holiday':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'event':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'training':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'holiday':
        return '🏖️';
      case 'meeting':
        return '👥';
      case 'event':
        return '🎉';
      case 'training':
        return '📚';
      default:
        return '📅';
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesType;
  });

  const upcomingEvents = filteredEvents
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-xl">Company Calendar</h1>
              <p className="text-gray-200 text-lg mt-1 drop-shadow-md">View company events, holidays, and important dates</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white drop-shadow-md">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth(-1)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-blue-100 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-blue-100 transition-colors"
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth(1)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-blue-100 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {dayNames.map(day => (
                    <div key={day} className="p-3 text-center text-sm font-semibold text-gray-200 drop-shadow-sm">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = day && 
                      new Date().getDate() === day && 
                      new Date().getMonth() === currentDate.getMonth() && 
                      new Date().getFullYear() === currentDate.getFullYear();
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] p-2 border border-white/10 rounded-lg ${
                          day ? 'bg-white/5 hover:bg-white/10 backdrop-blur-sm' : 'bg-transparent'
                        } ${isToday ? 'bg-blue-500/20 border-blue-400/50 shadow-lg' : ''} transition-all duration-300`}
                      >
                        {day && (
                          <>
                            <div className={`text-sm font-bold mb-1 drop-shadow-md ${isToday ? 'text-blue-200' : 'text-white'}`}>
                              {day}
                            </div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 2).map(event => (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 rounded text-center truncate border backdrop-blur-sm ${
                                    event.type === 'holiday' ? 'bg-red-500/20 text-red-200 border-red-400/30' :
                                    event.type === 'meeting' ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' :
                                    event.type === 'event' ? 'bg-purple-500/20 text-purple-200 border-purple-400/30' :
                                    event.type === 'training' ? 'bg-green-500/20 text-green-200 border-green-400/30' :
                                    'bg-gray-500/20 text-gray-200 border-gray-400/30'
                                  }`}
                                  title={event.title}
                                >
                                  {getEventTypeIcon(event.type)} {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-300 text-center font-medium drop-shadow-md">
                                  +{dayEvents.length - 2} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Filters */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md flex items-center gap-2">
                  <Filter className="w-5 h-5 text-purple-200" />
                  Filters
                </h3>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-300" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-300 rounded-xl focus:border-purple-400 focus:ring-purple-400/20"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white rounded-xl focus:border-purple-400">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="holiday">Holidays</SelectItem>
                    <SelectItem value="meeting">Meetings</SelectItem>
                    <SelectItem value="event">Events</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-200" />
                  Upcoming Events
                </h3>
              </div>
              <div>
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white text-sm">{event.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          event.type === 'holiday' ? 'bg-red-500/20 text-red-200 border-red-400/30' :
                          event.type === 'meeting' ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' :
                          event.type === 'event' ? 'bg-purple-500/20 text-purple-200 border-purple-400/30' :
                          event.type === 'training' ? 'bg-green-500/20 text-green-200 border-green-400/30' :
                          'bg-gray-500/20 text-gray-200 border-gray-400/30'
                        }`}>
                          {event.type}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-300">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        {!event.isAllDay && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.startTime} - {event.endTime}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {upcomingEvents.length === 0 && (
                    <div className="text-center py-6">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3 opacity-50" />
                      <p className="text-gray-300 text-sm">No upcoming events</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2">Event Types</h3>
              </div>
              <div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-red-500/30 border border-red-400/50"></div>
                    <span className="text-sm text-gray-200 font-medium drop-shadow-sm">Holidays</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-blue-500/30 border border-blue-400/50"></div>
                    <span className="text-sm text-gray-200 font-medium drop-shadow-sm">Meetings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-purple-500/30 border border-purple-400/50"></div>
                    <span className="text-sm text-gray-200 font-medium drop-shadow-sm">Events</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-green-500/30 border border-green-400/50"></div>
                    <span className="text-sm text-gray-200 font-medium drop-shadow-sm">Training</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCalendar;
