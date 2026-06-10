import api from './api';

export const getJmiProgramTypes = async () => {
  try {
    const response = await api.get('/api/jmi-result/program-types');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getJmiProgramNames = async (programTypeId) => {
  try {
    const response = await api.get('/api/jmi-result/program-names', {
      params: { programTypeId },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const searchJmiResults = async ({ courseTypeId, courseNameId, phdDisciplineId = '' }) => {
  try {
    const response = await api.post('/api/jmi-result/search', {
      courseTypeId,
      courseNameId,
      phdDisciplineId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getJmiProgramTypes,
  getJmiProgramNames,
  searchJmiResults,
};
