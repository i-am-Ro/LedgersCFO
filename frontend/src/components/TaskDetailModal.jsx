import React from 'react';
import { X, Calendar, Tag, AlertCircle, CheckCircle2, Clock, CreditCard, AlignLeft, BarChart2, Hash } from 'lucide-react';
import { createPortal } from 'react-dom';
import { format, parseISO } from 'date-fns';

const TaskDetailModal = ({ task, onClose }) => {
  if (!task) return null;

  const dueDate = parseISO(task.due_date);
  const isCompleted = task.status === 'Completed';

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      case 'Low': return 'text-green-600 bg-green-50 border-green-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-700 bg-green-100';
      case 'In Progress': return 'text-blue-700 bg-blue-100';
      case 'Pending': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110] animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Background Accent */}
        <div className={`h-24 relative ${isCompleted ? 'bg-green-600' : 'bg-indigo-600'}`}>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors backdrop-blur-md"
          >
            <X size={20} />
          </button>
          <div className="absolute -bottom-8 left-8 bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            {isCompleted ? (
              <CheckCircle2 className="text-green-600" size={32} />
            ) : (
              <Clock className="text-indigo-600" size={32} />
            )}
          </div>
        </div>

        {/* Scrollable content body */}
        <div className="overflow-y-auto flex-1 px-8 pt-12 pb-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-black text-gray-900 leading-tight flex-1 mr-4">
              {task.title}
            </h2>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Tag size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Category</span>
              </div>
              <p className="text-sm font-bold text-gray-700">{task.category}</p>
            </div>
            <div className={`p-4 rounded-2xl border ${getPriorityColor(task.priority)}`}>
              <div className="flex items-center gap-2 opacity-70 mb-1">
                <BarChart2 size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Priority</span>
              </div>
              <p className="text-sm font-bold">{task.priority}</p>
            </div>
          </div>

          <div className="space-y-6">
            {task.description && (
              <div className="flex gap-4">
                <div className="mt-1 text-gray-400">
                  <AlignLeft size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</h4>
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{task.description}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <div className="mt-1 text-gray-400">
                <Calendar size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Due Date</h4>
                <p className="text-gray-800 font-bold text-sm">
                  {format(dueDate, 'EEEE, MMMM do, yyyy')}
                </p>
              </div>
            </div>

            {isCompleted && task.payment_date && (
              <div className="flex gap-4 p-4 rounded-2xl bg-green-50 border border-green-100">
                <div className="text-green-600">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-green-600/60 uppercase tracking-widest mb-1.5">Payment Completed</h4>
                  <p className="text-green-700 font-black text-sm">
                    {format(parseISO(task.payment_date), 'MMMM do, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {isCompleted && task.transaction_id && (
              <div className="flex gap-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <div className="text-indigo-600 mt-0.5">
                  <Hash size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Transaction ID</h4>
                  <p className="font-mono text-sm font-black text-indigo-800 bg-indigo-100 px-3 py-1.5 rounded-lg inline-block tracking-wider break-all">
                    {task.transaction_id}
                  </p>
                  {task.completed_at && (
                    <p className="text-xs text-indigo-400 mt-2 font-medium">
                      Completed on {format(parseISO(task.completed_at), 'MMM do, yyyy · h:mm a')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md active:scale-95"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TaskDetailModal;
