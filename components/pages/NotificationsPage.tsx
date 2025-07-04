import React, { useState, useEffect } from 'react';
import { Notification, Tier } from '../../types';
import { getNotifications } from '../../services/mockApi';
import { translations } from '../../constants';

interface NotificationsPageProps {
  language: 'en' | 'my';
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ language }) => {
  const [sentNotifications, setSentNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetTiers, setTargetTiers] = useState<Tier[] | 'all'>('all');
  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getNotifications();
      setSentNotifications(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
        alert("Title and message cannot be empty.");
        return;
    }
    
    const newNotification: Notification = {
        id: `NOTIF${Date.now()}`,
        title,
        message,
        targetTiers,
        sentDate: new Date().toISOString().split('T')[0],
    };
    
    // In a real app, this would be an API call.
    // Here we just prepend it to our local state.
    setSentNotifications([newNotification, ...sentNotifications]);
    
    // Reset form
    setTitle('');
    setMessage('');
    setTargetTiers('all');
    alert('Notification sent successfully!');
  };
  
  const handleTierToggle = (tier: Tier) => {
    if (targetTiers === 'all') {
        setTargetTiers([tier]);
    } else {
        const newTiers = targetTiers.includes(tier)
            ? targetTiers.filter(t => t !== tier)
            : [...targetTiers, tier];
        
        if (newTiers.length === 0) {
            setTargetTiers('all');
        } else if (newTiers.length === Object.values(Tier).length) {
            setTargetTiers('all');
        }
        else {
            setTargetTiers(newTiers);
        }
    }
  };


  return (
    <div className="p-4 sm:p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Send Notification</h1>
        <form onSubmit={handleSendNotification} className="bg-white dark:bg-brand-secondary p-6 rounded-lg shadow-lg space-y-4">
            <div>
                <label className="text-sm font-bold text-gray-600 dark:text-gray-400 block mb-2">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Holiday Special Offer" className="w-full p-2 bg-gray-100 dark:bg-brand-light rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent" />
            </div>
            <div>
                <label className="text-sm font-bold text-gray-600 dark:text-gray-400 block mb-2">Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Compose your message..." className="w-full p-2 bg-gray-100 dark:bg-brand-light rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"></textarea>
            </div>
             <div>
                <label className="text-sm font-bold text-gray-600 dark:text-gray-400 block mb-2">Target Audience</label>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setTargetTiers('all')} className={`px-3 py-1 text-sm rounded-full border-2 ${targetTiers === 'all' ? 'bg-brand-accent border-brand-accent text-brand-dark font-bold' : 'bg-transparent border-gray-300 dark:border-gray-600'}`}>
                        All Members
                    </button>
                    {Object.values(Tier).map(tier => (
                        <button key={tier} type="button" onClick={() => handleTierToggle(tier)} className={`px-3 py-1 text-sm rounded-full border-2 ${targetTiers !== 'all' && targetTiers.includes(tier) ? 'bg-brand-accent border-brand-accent text-brand-dark font-bold' : 'bg-transparent border-gray-300 dark:border-gray-600'}`}>
                            {tier}
                        </button>
                    ))}
                </div>
            </div>
             <div className="text-right pt-2">
                <button type="submit" className="bg-brand-accent text-brand-dark font-bold py-2 px-6 rounded-lg hover:bg-yellow-500 transition duration-300">
                    Send Notification
                </button>
            </div>
        </form>
      </div>
      
       <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sent History</h1>
         <div className="space-y-4">
            {loading ? (
                <p className="text-gray-600 dark:text-gray-300">Loading history...</p>
            ) : sentNotifications.length > 0 ? (
                sentNotifications.map(notif => (
                    <div key={notif.id} className="bg-white dark:bg-brand-secondary p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{notif.title}</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{notif.sentDate}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mt-1 mb-2">{notif.message}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Sent to: {notif.targetTiers === 'all' ? 'All Members' : notif.targetTiers.join(', ')}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-600 dark:text-gray-300 text-center py-4">No notifications sent yet.</p>
            )}
         </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
