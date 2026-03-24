import React, { useState } from 'react';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import TaskDetailModal from './TaskDetailModal';
import { Plus, Filter, Search, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';

const TaskDashboard = ({ client, tasks, onAddTask, onUpdateTaskStatus, onEditTask, onDeleteTask, onViewTask }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);

  const handleViewTask = (task) => {
    if (onViewTask) {
      onViewTask(task, setViewingTask);
    } else {
      setViewingTask(task);
    }
  };

  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('created_at');

  if (!client) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <p className="text-lg">Please select a client to view tasks.</p>
      </div>
    );
  }

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'All' && task.status !== filterStatus) return false;
    if (filterCategory !== 'All' && task.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = task.title && task.title.toLowerCase().includes(q);
      const matchesDesc = task.description && task.description.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc) return false;
    }
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortField === 'due_date') {
      return new Date(a.due_date) - new Date(b.due_date); // Earliest first
    } 
    if (sortField === 'alphabetical') {
      return (a.title || '').localeCompare(b.title || ''); // A-Z
    } 
    if (sortField === 'overdue') {
      const isOverdue = (t) => {
        if (t.status === 'Completed') return false;
        const d = new Date(t.due_date);
        d.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);
        return d < today;
      };
      return (isOverdue(b) ? 1 : 0) - (isOverdue(a) ? 1 : 0); // Overdue first
    } 
    if (sortField === 'paid') {
      const isPaid = (t) => t.status === 'Completed' ? 1 : 0;
      return isPaid(b) - isPaid(a); // Paid first
    } 
    if (sortField === 'created_at') {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0); // Newest first
    }
    return 0;
  });

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const overdueCount = tasks.filter(t => {
      if (t.status === 'Completed') return false;
      const d = new Date(t.due_date);
      d.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      return d < today;
  }).length;

  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Group by category
  const categoryStats = tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  const stats = {
    total,
    pending,
    completed,
    overdue: overdueCount,
    completionRate,
    categoryStats
  };

  const handleTaskSubmit = async (taskData) => {
    if (editingTask) {
      await onEditTask(editingTask.id, taskData);
      setEditingTask(null);
    } else {
      await onAddTask(taskData);
      setIsFormOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm">
            <CheckCircle size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-800 leading-none">{client.company_name}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Compliance Dashboard</p>
          </div>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-black transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} /> NEW TASK
        </button>
      </div>

      {/* Stats and Summary */}
      <div className="p-3 bg-gray-50/50 border-b border-gray-100 flex flex-col gap-3 shrink-0">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
              <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600 scale-90">
                  <FileText size={16} />
              </div>
              <div>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Total</p>
                  <p className="text-sm font-black text-gray-800">{stats.total}</p>
              </div>
          </div>
          <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
              <div className="bg-yellow-50 p-1.5 rounded-lg text-yellow-600 scale-90">
                  <Clock size={16} />
              </div>
              <div>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Pending</p>
                  <p className="text-sm font-black text-gray-800">{stats.pending}</p>
              </div>
          </div>
          <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
              <div className="bg-red-50 p-1.5 rounded-lg text-red-600 scale-90">
                  <AlertCircle size={16} />
              </div>
              <div>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Overdue</p>
                  <p className={`text-sm font-black ${stats.overdue > 0 ? 'text-red-600' : 'text-gray-800'}`}>{stats.overdue}</p>
              </div>
          </div>
          <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
              <div className="bg-green-50 p-1.5 rounded-lg text-green-600 scale-90">
                  <CheckCircle size={16} />
              </div>
              <div>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Done</p>
                  <p className="text-sm font-black text-gray-800">{stats.completed}</p>
              </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Compliance Progress</span>
                <span className="text-sm font-black text-indigo-600">{stats.completionRate}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${stats.overdue > 0 ? 'bg-red-500' : 'bg-indigo-600'}`}
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>

            <div className="w-px h-8 bg-gray-100 hidden md:block"></div>

            <div className="hidden lg:flex flex-wrap gap-1.5 max-w-[300px]">
              {Object.entries(stats.categoryStats).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-1 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                  <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tight">{cat}:</span>
                  <span className="text-[9px] font-black text-indigo-600">{count}</span>
                </div>
              )).slice(0, 3)}
            </div>
        </div>
      </div>
      
      {/* Filters and Controls */}
      <div className="p-3 border-b border-gray-100 bg-white flex flex-wrap gap-3 items-center shrink-0">
        <div className="relative flex-1 min-w-[150px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
          />
        </div>
        
        <div className="flex gap-2 items-center ml-auto">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700 bg-white font-bold"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700 bg-white font-bold"
          >
            <option value="All">All Categories</option>
            <option value="General">General</option>
            <option value="Tax">Tax</option>
            <option value="Filing">Filing</option>
            <option value="Audit">Audit</option>
          </select>

          <div className="flex gap-2 items-center border-l border-gray-100 pl-3">
            <select 
              value={sortField} 
              onChange={(e) => setSortField(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700 bg-white font-black uppercase tracking-tight"
            >
              <option value="created_at">Newest</option>
              <option value="due_date">Due Date</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/20">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100 border-dashed text-sm">
            No tasks found matching your criteria.
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onStatusChange={onUpdateTaskStatus} 
                onEdit={setEditingTask} 
                onView={handleViewTask}
              />
            ))}
          </div>
        )}
      </div>

      {(isFormOpen || editingTask) && (
        <TaskForm 
          clientId={client.id} 
          initialData={editingTask}
          onClose={() => { setIsFormOpen(false); setEditingTask(null); }} 
          onSubmit={handleTaskSubmit} 
          onDelete={onDeleteTask ? async (id) => { await onDeleteTask(id); setEditingTask(null); } : undefined}
        />
      )}

      {viewingTask && (
        <TaskDetailModal 
          task={viewingTask} 
          onClose={() => setViewingTask(null)} 
        />
      )}
    </div>
  );
};

export default TaskDashboard;
