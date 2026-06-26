import { formatDistanceToNow, format } from 'date-fns';

export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatDate = (date) => format(new Date(date), 'MMM dd, yyyy');

export const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

export const truncate = (str, length = 150) =>
  str?.length > length ? str.substring(0, length) + '...' : str;

export const stripHtml = (html) => html?.replace(/<[^>]+>/g, '') || '';

export const calcReadingTime = (content) => {
  const text = stripHtml(content);
  const wpm = 200;
  return Math.max(1, Math.ceil(text.split(/\s+/).length / wpm));
};

export const categories = [
  'Technology', 'Design', 'Business', 'Science', 'Culture',
  'Health', 'Travel', 'Food', 'Sports', 'Entertainment', 'Politics', 'Education', 'Other'
];

export const getInitials = (name) =>
  name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

export const getAvatarUrl = (user) =>
  user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}&backgroundColor=1B1B1B&textColor=D4D4D8`;
