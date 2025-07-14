import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example: get dashboard overview
export const fetchDashboardOverview = (): Promise<any> =>
  api.get('/system/overview/dashboard').then((res: { data: any }) => res.data);

// Add more API functions as needed for clusters, hosts, datastores, vms, etc. 