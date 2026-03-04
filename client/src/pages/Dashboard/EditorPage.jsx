import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { projectsAPI, exportsAPI } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

const EditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPlan } = useAuthStore();
  
  const [projectName, setProjectName] = useState('Untitled Project');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements, setElements] = useState([]);
  const [canvasSettings, setCanvasSettings] = useState({
    width: 1920,
    height: 1080,
    backgroundColor: '#080C10',
    frameRate: 30,
    duration: 5,
  });

  // Fetch project
  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await projectsAPI.getById(id);
      return response.data.data.project;
    },
    onSuccess: (project) => {
      if (project) {
        setProjectName(project.name);
        if (project.data?.elements) {
          setElements(project.data.elements);
        }
        if (project.data?.settings) {
          setCanvasSettings(prev => ({ ...prev, ...project.data.settings }));
        }
      }
    },
  });

  // Save project mutation
  const saveMutation = useMutation({
    mutationFn: (data) => projectsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      toast.success('Project saved');
    },
    onError: () => {
      toast.error('Failed to save project');
    },
  });

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading && id) {
        saveMutation.mutate({
          name: projectName,
          data: {
            elements,
            settings: canvasSettings,
          },
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [projectName, elements, canvasSettings]);

  // Handle export
  const handleExport = async (format) => {
    if (format === 'mp4' && !hasPlan('pro')) {
      toast.error('MP4 export requires Pro plan');
      return;
    }

    setIsExporting(true);
    try {
      const response = await exportsAPI.create({
        projectId: id,
        format,
        quality: 'high',
      });
      toast.success('Export created!');
      navigate('/dashboard/exports');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Add element
  const addElement = (type) => {
    const newElement = {
      id: Date.now().toString(),
      type,
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      rotation: 0,
      opacity: 1,
      color: type === 'text' ? '#FFFFFF' : '#00F0FF',
      text: type === 'text' ? 'Text' : '',
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  // Update element
  const updateElement = (elementId, updates) => {
    setElements(elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };

  // Delete element
  const deleteElement = (elementId) => {
    setElements(elements.filter(el => el.id !== elementId));
    setSelectedElement(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background-primary overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background-secondary">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/projects')}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-background-tertiary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent text-text-primary font-semibold border-none outline-none focus:ring-0"
          />
          <span className="text-xs text-text-muted">
            {saveMutation.isPending ? 'Saving...' : 'Saved'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport('gif')}
            disabled={isExporting}
          >
            Export GIF
          </Button>
          <Button
            size="sm"
            onClick={() => handleExport('mp4')}
            disabled={isExporting}
          >
            Export MP4
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Elements */}
        <aside className="w-64 border-r border-border bg-background-secondary p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-text-secondary mb-4">Elements</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'rectangle', icon: '▢', label: 'Rectangle' },
              { type: 'circle', icon: '○', label: 'Circle' },
              { type: 'text', icon: 'T', label: 'Text' },
              { type: 'image', icon: '🖼', label: 'Image' },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => addElement(item.type)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background-tertiary hover:bg-accent-cyan/10 hover:text-accent-cyan transition-colors"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Layers */}
          <h3 className="text-sm font-semibold text-text-secondary mt-6 mb-4">Layers</h3>
          <div className="space-y-2">
            {elements.map((element, index) => (
              <motion.div
                key={element.id}
                layout
                className={`
                  p-3 rounded-lg cursor-pointer transition-colors
                  ${selectedElement === element.id 
                    ? 'bg-accent-cyan/20 text-accent-cyan' 
                    : 'bg-background-tertiary text-text-secondary hover:text-text-primary'}
                `}
                onClick={() => setSelectedElement(element.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm capitalize">{element.type}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    className="p-1 hover:text-red-400"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
            {elements.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">
                Add elements to get started
              </p>
            )}
          </div>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 flex items-center justify-center bg-background-primary p-8 overflow-auto">
          <div
            className="relative bg-background-tertiary shadow-2xl"
            style={{
              width: canvasSettings.width / 2,
              height: canvasSettings.height / 2,
              backgroundColor: canvasSettings.backgroundColor,
            }}
          >
            {elements.map((element) => (
              <div
                key={element.id}
                className={`
                  absolute cursor-move transition-all
                  ${selectedElement === element.id ? 'ring-2 ring-accent-cyan' : ''}
                `}
                style={{
                  left: element.x / 2,
                  top: element.y / 2,
                  width: element.width / 2,
                  height: element.height / 2,
                  transform: `rotate(${element.rotation}deg)`,
                  opacity: element.opacity,
                }}
                onClick={() => setSelectedElement(element.id)}
              >
                {element.type === 'rectangle' && (
                  <div
                    className="w-full h-full rounded-lg"
                    style={{ backgroundColor: element.color }}
                  />
                )}
                {element.type === 'circle' && (
                  <div
                    className="w-full h-full rounded-full"
                    style={{ backgroundColor: element.color }}
                  />
                )}
                {element.type === 'text' && (
                  <div
                    className="w-full h-full flex items-center justify-center text-2xl font-bold"
                    style={{ color: element.color }}
                  >
                    {element.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        {/* Right Panel - Properties */}
        <aside className="w-64 border-l border-border bg-background-secondary p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-text-secondary mb-4">Properties</h3>
          
          {selectedElement ? (
            <div className="space-y-4">
              {(() => {
                const element = elements.find(el => el.id === selectedElement);
                if (!element) return null;
                
                return (
                  <>
                    <div>
                      <label className="text-xs text-text-muted">Color</label>
                      <input
                        type="color"
                        value={element.color}
                        onChange={(e) => updateElement(element.id, { color: e.target.value })}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-text-muted">Opacity</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={element.opacity}
                        onChange={(e) => updateElement(element.id, { opacity: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-text-muted">Rotation</label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={element.rotation}
                        onChange={(e) => updateElement(element.id, { rotation: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {element.type === 'text' && (
                      <div>
                        <label className="text-xs text-text-muted">Text</label>
                        <input
                          type="text"
                          value={element.text}
                          onChange={(e) => updateElement(element.id, { text: e.target.value })}
                          className="input-field w-full mt-1"
                        />
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div>
              <h4 className="text-xs font-semibold text-text-muted mb-3">Canvas Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-text-muted">Background</label>
                  <input
                    type="color"
                    value={canvasSettings.backgroundColor}
                    onChange={(e) => setCanvasSettings({ ...canvasSettings, backgroundColor: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted">Duration (s)</label>
                  <input
                    type="number"
                    value={canvasSettings.duration}
                    onChange={(e) => setCanvasSettings({ ...canvasSettings, duration: parseInt(e.target.value) })}
                    className="input-field w-full mt-1"
                    min="1"
                    max="60"
                  />
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Timeline */}
      <div className="h-40 border-t border-border bg-background-secondary p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-text-secondary">Timeline</h3>
          <span className="text-xs text-text-muted">{canvasSettings.duration}s</span>
        </div>
        <div className="relative h-16 bg-background-tertiary rounded-lg overflow-hidden">
          {/* Playhead */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-accent-cyan" style={{ left: '50%' }} />
          
          {/* Track */}
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-background-primary rounded">
            {elements.map((element, index) => (
              <div
                key={element.id}
                className="absolute h-full bg-accent-cyan/50 rounded"
                style={{
                  left: `${(index / elements.length) * 100}%`,
                  width: `${100 / elements.length}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;