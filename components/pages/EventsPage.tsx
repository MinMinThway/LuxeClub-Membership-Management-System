import React, { useState, useEffect } from 'react';
import { Event, Tier } from '../../types';
import { getEvents } from '../../services/mockApi';
import { translations } from '../../constants';
import TierBadge from '../common/TierBadge';
import { XIcon } from '../common/Icons';

interface EventsPageProps {
  language: 'en' | 'my';
}

const EventModal: React.FC<{
    event: Partial<Event> | null;
    onClose: () => void;
    onSave: (event: Event) => void;
}> = ({ event, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Event>>({
        name: '',
        description: '',
        date: '',
        location: '',
        targetTiers: [],
        ...event
    });

    const handleSave = () => {
        // Basic validation
        if (!formData.name || !formData.date || !formData.location) {
            alert("Please fill all required fields.");
            return;
        }
        onSave(formData as Event);
    };
    
    const handleTierToggle = (tier: Tier) => {
        const currentTiers = formData.targetTiers || [];
        const newTiers = currentTiers.includes(tier)
            ? currentTiers.filter(t => t !== tier)
            : [...currentTiers, tier];
        setFormData({ ...formData, targetTiers: newTiers });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-brand-secondary rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{event?.id ? 'Edit Event' : 'Create Event'}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400 block mb-2">Event Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 bg-gray-100 dark:bg-brand-light rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400 block mb-2">Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full p-2 bg-gray-100 dark:bg-brand-light rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"></textarea>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 block mb-2">Date</label>
                            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 bg-gray-100 dark:bg-brand-light rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                        </div>
                         <div>
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 block mb-2">Location</label>
                            <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2 bg-gray-100 dark:bg-brand-light rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent" />
                        </div>
                    </div>
                    <div>
                         <label className="text-sm font-bold text-gray-600 dark:text-gray-400 block mb-2">Target Tiers</label>
                         <div className="flex flex-wrap gap-2">
                            {Object.values(Tier).map(tier => (
                                <button key={tier} onClick={() => handleTierToggle(tier)} className={`px-3 py-1 text-sm rounded-full border-2 ${formData.targetTiers?.includes(tier) ? 'bg-brand-accent border-brand-accent text-brand-dark font-bold' : 'bg-transparent border-gray-300 dark:border-gray-600'}`}>
                                    {tier}
                                </button>
                            ))}
                         </div>
                    </div>
                </div>
                <div className="p-4 border-t dark:border-gray-700 text-right space-x-2">
                     <button onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-brand-light text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSave} className="py-2 px-4 rounded-lg bg-brand-accent text-brand-dark font-bold hover:bg-yellow-500">Save Event</button>
                </div>
            </div>
        </div>
    );
};


const EventsPage: React.FC<EventsPageProps> = ({ language }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Partial<Event> | null>(null);
  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
      setLoading(false);
    };
    fetchData();
  }, []);
  
  const handleSaveEvent = (event: Event) => {
    if(event.id) {
        setEvents(events.map(e => e.id === event.id ? event : e));
    } else {
        const newEvent = { ...event, id: `EVT${Date.now()}`};
        setEvents([newEvent, ...events]);
    }
    setIsModalOpen(false);
    setSelectedEvent(null);
  };
  
  const handleEdit = (event: Event) => {
      setSelectedEvent(event);
      setIsModalOpen(true);
  };

  const handleCreate = () => {
      setSelectedEvent({});
      setIsModalOpen(true);
  }

  const handleDelete = (eventId: string) => {
      if(window.confirm('Are you sure you want to delete this event?')) {
          setEvents(events.filter(e => e.id !== eventId));
      }
  };


  return (
    <div className="p-4 sm:p-6">
      {isModalOpen && <EventModal event={selectedEvent} onClose={() => setIsModalOpen(false)} onSave={handleSaveEvent} />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Management</h1>
        <button onClick={handleCreate} className="bg-brand-accent text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition duration-300">
          Create Event
        </button>
      </div>

      <div className="bg-white dark:bg-brand-secondary shadow-lg rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-100 dark:bg-brand-light">
            <tr>
              <th scope="col" className="px-6 py-3">Event Name</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Location</th>
              <th scope="col" className="px-6 py-3">Target Tiers</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center p-6">Loading events...</td></tr>
            ) : events.length > 0 ? (
              events.map(event => (
                <tr key={event.id} className="border-b border-gray-200 dark:border-brand-light hover:bg-gray-50 dark:hover:bg-brand-light">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white">{event.name}</th>
                  <td className="px-6 py-4">{event.date}</td>
                  <td className="px-6 py-4">{event.location}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {event.targetTiers.map(tier => <TierBadge key={tier} tier={tier} />)}
                    </div>
                  </td>
                  <td className="px-6 py-4 space-x-4">
                    <button onClick={() => handleEdit(event)} className="font-medium text-brand-accent hover:underline">Edit</button>
                    <button onClick={() => handleDelete(event.id)} className="font-medium text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
                <tr><td colSpan={5} className="text-center p-6">No events found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventsPage;
