import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchDashboardOverview = (): Promise<any> =>
  api.get('/system/overview/dashboard').then((res: { data: any }) => res.data);

export const fetchClusters = (): Promise<any[]> =>
  api.get('/clusters/').then((res: { data: any[] }) => res.data);

export const fetchHosts = (): Promise<any[]> =>
  api.get('/hosts/').then((res: { data: any[] }) => res.data);

export const fetchDatastores = (): Promise<any[]> =>
  api.get('/datastores/').then((res: { data: any[] }) => res.data);

export const fetchVMs = (): Promise<any[]> =>
  api.get('/vms/').then((res: { data: any[] }) => res.data);

export const postWorkOrder = (data: any): Promise<any> =>
  api.post('/workorders/', data).then((res) => res.data);

export const fetchWorkOrders = (limit = 5): Promise<any[]> =>
  api.get(`/workorders/?limit=${limit}`).then((res) => res.data);

export const updateWorkOrder = (id: number, data: any): Promise<any> =>
  api.put(`/workorders/${id}`, data).then((res) => res.data);

export const approveWorkOrder = (id: number): Promise<any> =>
  api.post(`/workorders/${id}/approve`).then((res) => res.data);

export const deleteWorkOrder = (id: number): Promise<any> =>
  api.delete(`/workorders/${id}`).then((res) => res.data);

export const fetchWorkOrderById = (id: number | string): Promise<any> =>
  api.get(`/workorders/?limit=100`).then((res) => {
    const found = res.data.find((o: any) => String(o.id) === String(id));
    if (!found) throw new Error('Work order not found');
    return found;
  }); 