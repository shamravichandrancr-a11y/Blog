import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => api.put('/auth/change-password', data),
  getUserById: (id) => api.get(`/auth/users/${id}`),
  followUser: (id) => api.post(`/auth/follow/${id}`),
  getAllUsers: () => api.get('/auth/users'),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

export const blogService = {
  getBlogs: (params) => api.get('/blogs', { params }),
  getBlogById: (id) => api.get(`/blogs/${id}`),
  createBlog: (data) => api.post('/blogs', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateBlog: (id, data) => api.put(`/blogs/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteBlog: (id) => api.delete(`/blogs/${id}`),
  toggleLike: (id) => api.post(`/blogs/${id}/like`),
  toggleBookmark: (id) => api.post(`/blogs/${id}/bookmark`),
  getMyBlogs: () => api.get('/blogs/my'),
  getMyBookmarks: () => api.get('/blogs/bookmarks'),
  getTrending: () => api.get('/blogs/trending'),
  getStats: () => api.get('/blogs/stats'),
  uploadImage: (data) => api.post('/blogs/upload-image', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const commentService = {
  getComments: (blogId) => api.get(`/comments/${blogId}`),
  createComment: (data) => api.post('/comments', data),
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  toggleLike: (id) => api.post(`/comments/${id}/like`),
};
