import React, { useState, useEffect } from 'react';
import { getClients, getTasks, createTask, updateTaskStatus, createClient, updateTask, updateClient, deleteClient, deleteTask } from './api';
import ClientList from './components/ClientList';
import TaskDashboard from './components/TaskDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClients();
      fetchTasks();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await getClients();
      setClients(data);
      if (data.length > 0 && !selectedClientId) {
        setSelectedClientId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching clients", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      // Sort tasks by due date
      const sorted = data.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      setTasks(sorted);
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };

  const handleAddTask = async (taskData) => {
    if (taskData.status === 'Completed') {
      try {
        const tempTask = { ...taskData, status: 'In Progress' };
        const newTask = await createTask(tempTask);
        setTasks(prev => [...prev, newTask].sort((a, b) => new Date(a.due_date) - new Date(b.due_date)));
        
        setTimeout(async () => {
          try {
            await updateTask(newTask.id, { ...taskData, status: 'Completed' });
            setTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, ...taskData, status: 'Completed' } : t));
          } catch (e) { console.error("Error finalizing task creation status", e); }
        }, 2000);
      } catch (error) {
        console.error("Error creating task", error);
      }
    } else {
      try {
        const newTask = await createTask(taskData);
        setTasks(prev => [...prev, newTask].sort((a, b) => new Date(a.due_date) - new Date(b.due_date)));
      } catch (error) {
        console.error("Error creating task", error);
      }
    }
  };

  const handleAddClient = async (clientData) => {
    try {
      const newClient = await createClient(clientData);
      setClients(prev => [...prev, newClient]);
      setSelectedClientId(newClient.id);
    } catch (error) {
      console.error("Error creating client", error);
    }
  };

  const handleEditClient = async (clientId, updatedData) => {
    try {
      await updateClient(clientId, updatedData);
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updatedData } : c));
    } catch (error) {
      console.error("Error editing client", error);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    try {
      await deleteClient(clientId);
      setClients(prev => prev.filter(c => c.id !== clientId));
      if (selectedClientId === clientId) setSelectedClientId(null);
    } catch (error) {
      console.error("Error deleting client", error);
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    if (status === 'Completed') {
      const today = new Date().toISOString().split('T')[0];
      try {
        await updateTaskStatus(taskId, 'In Progress');
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'In Progress' } : t));
        
        setTimeout(async () => {
          try {
            const updatedTask = await updateTask(taskId, { status: 'Completed', payment_date: today });
            // Merge full server response (includes transaction_id, completed_at)
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatedTask } : t));
          } catch (e) { console.error("Error finalizing status", e); }
        }, 2000);
      } catch (error) {
        console.error("Error updating status", error);
      }
    } else {
      try {
        await updateTaskStatus(taskId, status);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
      } catch (error) {
        console.error("Error updating status", error);
      }
    }
  };

  const handleEditTask = async (taskId, updatedData) => {
    if (updatedData.status === 'Completed') {
      try {
        const tempUpdate = { ...updatedData, status: 'In Progress' };
        await updateTask(taskId, tempUpdate);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...tempUpdate } : t));

        setTimeout(async () => {
          try {
             await updateTask(taskId, { ...updatedData, status: 'Completed' });
             setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatedData, status: 'Completed' } : t));
          } catch (e) { console.error("Error finalizing edit", e); }
        }, 2000);
      } catch (error) {
        console.error("Error editing task", error);
      }
    } else {
      try {
        await updateTask(taskId, updatedData);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatedData } : t));
      } catch (error) {
        console.error("Error editing task", error);
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Error deleting task", error);
    }
  };

  // When viewing a completed task that has no transaction_id yet (created before feature rollout),
  // silently trigger a backend update so it gets assigned one, then refresh state.
  const handleViewTask = async (task, setViewingTask) => {
    setViewingTask(task); // open immediately with what we have
    if (task.status === 'Completed' && !task.transaction_id) {
      try {
        const updatedTask = await updateTask(task.id, { updated_at: new Date().toISOString() });
        // Merge the new transaction_id into global tasks state
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...updatedTask } : t));
        // Also update the modal's task so the ID appears immediately
        setViewingTask(prev => prev?.id === task.id ? { ...prev, ...updatedTask } : prev);
      } catch (e) {
        console.error('Error generating transaction ID for existing task', e);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/signup" element={<Signup onLogin={setUser} />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-100 p-6 font-sans">
                <div className="max-w-[1600px] mx-auto flex flex-col h-full">
                  
                  {/* Header */}
                  <header className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg">
                        <Activity className="text-white" size={24} />
                      </div>
                      <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">LedgersCFO</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Compliance Tracker</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {user && (
                        <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
                          <div className="flex flex-col items-end mr-2 hidden sm:flex">
                            <span className="text-xs font-black text-gray-800 leading-none">{user.name || user.email.split('@')[0]}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{user.email}</span>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                            <UserIcon size={20} />
                          </div>
                          <button 
                            onClick={handleLogout}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                            title="Logout"
                          >
                            <LogOut size={20} />
                          </button>
                        </div>
                      )}
                    </div>
                  </header>

                  {/* Main Content */}
                  {loading && clients.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500">Loading data...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 items-start mt-0">
                            <div className="flex flex-col h-[calc(100vh-160px)] gap-4 sticky top-6">
                              <div className="flex-1 min-h-0">
                                <ClientList 
                                  clients={clients} 
                                  allTasks={tasks}
                                  selectedClientId={selectedClientId} 
                                  onSelectClient={setSelectedClientId} 
                                  onAddClient={handleAddClient}
                                  onEditClient={handleEditClient}
                                  onDeleteClient={handleDeleteClient}
                                />
                              </div>

                            </div>
                      <div className="col-span-1 md:col-span-3">
                        <TaskDashboard 
                          client={selectedClient} 
                          tasks={tasks.filter(t => t.client_id === selectedClientId)} 
                          onAddTask={handleAddTask}
                          onUpdateTaskStatus={handleUpdateTaskStatus}
                          onEditTask={handleEditTask}
                          onDeleteTask={handleDeleteTask}
                          onViewTask={handleViewTask}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
