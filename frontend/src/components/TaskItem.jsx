import React from 'react';
import { format, isPast, parseISO, differenceInDays, startOfDay } from 'date-fns';
import { Clock, AlertCircle, CheckCircle2, RotateCcw, Edit2, AlertTriangle } from 'lucide-react';

const TaskItem = ({ task, onStatusChange, onEdit, onView }) => {
  const isCompleted = task.status === 'Completed';
  const isInProgress = task.status === 'In Progress';
  const dueDate = parseISO(task.due_date);
  const today = startOfDay(new Date());
  const dueDay = startOfDay(dueDate);
  
  const daysDifference = differenceInDays(dueDay, today);
  
  const isOverdue = !isCompleted && daysDifference < 0;
  const isDueSoon = !isCompleted && daysDifference >= 0 && daysDifference <= 5;
  const overdueDays = Math.abs(daysDifference);

  let borderColor = 'border-gray-200';
  let bgColor = 'bg-white';
  
  if (isOverdue) {
    borderColor = 'border-red-300';
    bgColor = 'bg-red-50';
  } else if (isDueSoon) {
    borderColor = 'border-yellow-400';
    bgColor = 'bg-yellow-50';
  }

  return (
    <div 
      onClick={() => !isInProgress && onView(task)}
      className={`p-3 rounded-lg shadow-sm border ${borderColor} ${bgColor} transition-all hover:shadow-md mb-2 group cursor-pointer ${isInProgress ? 'opacity-75 grayscale-[0.5] cursor-not-allowed select-none' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-3">
          <h4 className="text-sm font-bold text-gray-800 flex flex-wrap items-center gap-2">
            {task.title}
            {isOverdue && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 min-w-max">
                <AlertCircle size={12}/> Overdue by {overdueDays} day{overdueDays !== 1 ? 's' : ''}
              </span>
            )}
            {isDueSoon && (
              <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 min-w-max">
                <AlertTriangle size={10}/> {daysDifference === 0 ? 'Today' : `${daysDifference}d`}
              </span>
            )}
          </h4>
          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded inline-block mt-0.5">{task.category}</span>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  task.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : 
                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                  'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                {task.status.toUpperCase()}
              </span>
              <button 
                disabled={isInProgress} 
                onClick={(e) => { e.stopPropagation(); onEdit(task); }} 
                title="Edit Task" 
                className={`text-gray-400 hover:text-indigo-600 transition-colors bg-white hover:bg-indigo-50 p-1 rounded-md border border-gray-100 shadow-sm ${isInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Edit2 size={12} />
              </button>
            </div>
            {isCompleted && task.payment_date && (
                <div className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded mt-1 inline-block">
                  PAID: {format(parseISO(task.payment_date), 'MMM d, yyyy')}
                </div>
            )}
        </div>
      </div>
      
      {task.description && <p className="text-gray-500 text-[11px] mb-2 line-clamp-1">{task.description}</p>}
      
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
        <div className="flex items-center text-[11px] gap-1">
          <Clock size={12} className={isOverdue ? 'text-red-500' : isDueSoon ? 'text-yellow-600' : 'text-gray-400'} />
          <span className={isOverdue ? 'text-red-600 font-bold' : isDueSoon ? 'text-yellow-700 font-bold' : 'text-gray-500 font-medium'}>
            {format(dueDate, 'MMM d, yy')}
          </span>
        </div>
        
        <div className="flex gap-1">
          {!isCompleted ? (
            <button 
              disabled={isInProgress}
              onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'Completed'); }}
              className={`text-[10px] font-black text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-all border border-transparent hover:border-green-100 ${isInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              COMPLETE
            </button>
          ) : (
            <button 
              disabled={isInProgress}
              onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'Pending'); }}
              className={`text-[10px] font-black text-gray-400 hover:bg-gray-100 px-2 py-1 rounded transition-all border border-transparent hover:border-gray-200 ${isInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              UNDO
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
