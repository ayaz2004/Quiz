import api from './api';

const API_URL = import.meta.env.VITE_API_URL;

export const getCommunityListings = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.search) query.append('search', params.search);
  if (params.listingType) query.append('listingType', params.listingType);
  if (params.genderPreference) query.append('genderPreference', params.genderPreference);
  const response = await api.get(`/api/housing/listings?${query.toString()}`);
  return response.data;
};

export const getCommunityListing = async (id) => {
  const response = await api.get(`/api/housing/listings/${id}`);
  return response.data;
};

export const revealListingContact = async (id) => {
  const response = await api.post(`/api/housing/listings/${id}/contact`);
  return response.data;
};

export const getMyHousingListings = async (page = 1, limit = 10) => {
  const response = await api.get(`/api/housing/my-listings?page=${page}&limit=${limit}`);
  return response.data;
};

export const createHousingListing = async (formData) => {
  const response = await fetch(`${API_URL}/api/housing/listings`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create listing');
  return data;
};

export const updateHousingListing = async (id, formData) => {
  const response = await fetch(`${API_URL}/api/housing/listings/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update listing');
  return data;
};

export const updateHousingListingStatus = async (id, status) => {
  const response = await api.patch(`/api/housing/listings/${id}/status`, { status });
  return response.data;
};

export const getAdminHousingListings = async (page = 1, limit = 10, status = 'pending_review') => {
  const response = await api.get(
    `/api/housing/admin/listings?page=${page}&limit=${limit}&status=${status}`
  );
  return response.data;
};

export const moderateHousingListing = async (id, status) => {
  const response = await api.patch(`/api/housing/admin/listings/${id}`, { status });
  return response.data;
};

export const deleteHousingListing = async (id) => {
  const response = await api.delete(`/api/housing/admin/listings/${id}`);
  return response.data;
};

// ——— Roommate groups (Phase 3) ———

export const getHousingGroups = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.search) query.append('search', params.search);
  if (params.genderPreference) query.append('genderPreference', params.genderPreference);
  const response = await api.get(`/api/housing/groups?${query.toString()}`);
  return response.data;
};

export const getMyHousingGroups = async () => {
  const response = await api.get('/api/housing/groups/my');
  return response.data;
};

export const getHousingGroup = async (id) => {
  const response = await api.get(`/api/housing/groups/${id}`);
  return response.data;
};

export const createHousingGroup = async (payload) => {
  const response = await api.post('/api/housing/groups', payload);
  return response.data;
};

export const updateHousingGroup = async (id, payload) => {
  const response = await api.put(`/api/housing/groups/${id}`, payload);
  return response.data;
};

export const updateHousingGroupStatus = async (id, status) => {
  const response = await api.patch(`/api/housing/groups/${id}/status`, { status });
  return response.data;
};

export const requestJoinHousingGroup = async (id, message = '') => {
  const response = await api.post(`/api/housing/groups/${id}/request-join`, { message });
  return response.data;
};

export const joinHousingGroupByInvite = async (inviteCode) => {
  const response = await api.post(`/api/housing/groups/join/${inviteCode}`);
  return response.data;
};

export const handleHousingGroupJoinRequest = async (groupId, requestId, status) => {
  const response = await api.patch(`/api/housing/groups/${groupId}/requests/${requestId}`, { status });
  return response.data;
};

export const leaveHousingGroup = async (id) => {
  const response = await api.post(`/api/housing/groups/${id}/leave`);
  return response.data;
};

export const revealHousingGroupContact = async (id) => {
  const response = await api.post(`/api/housing/groups/${id}/contact`);
  return response.data;
};
