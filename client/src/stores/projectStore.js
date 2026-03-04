import { create } from 'zustand';

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    search: '',
    sort: '-createdAt',
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  },

  setProjects: (projects) => set({ projects }),
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters },
    pagination: { ...state.pagination, page: 1 }
  })),
  
  setPagination: (pagination) => set((state) => ({ 
    pagination: { ...state.pagination, ...pagination }
  })),

  addProject: (project) => set((state) => ({ 
    projects: [project, ...state.projects]
  })),

  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((p) => 
      p._id === id ? { ...p, ...updates } : p
    ),
    currentProject: state.currentProject?._id === id 
      ? { ...state.currentProject, ...updates }
      : state.currentProject
  })),

  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p._id !== id),
    currentProject: state.currentProject?._id === id ? null : state.currentProject
  })),

  reset: () => set({
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,
    filters: { status: 'all', search: '', sort: '-createdAt' },
    pagination: { page: 1, limit: 12, total: 0, pages: 0 },
  }),
}));