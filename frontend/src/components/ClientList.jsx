import React, { useState } from 'react';
import { Building2, Globe2, FileText, Plus, Edit2, Search, Filter } from 'lucide-react';
import { parseISO, differenceInDays, startOfDay } from 'date-fns';
import ClientForm from './ClientForm';

const ClientList = ({ clients, selectedClientId, onSelectClient, onAddClient, onEditClient, onDeleteClient, allTasks }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState('All');

  const getClientHealth = (client) => {
    const clientTasks = allTasks ? allTasks.filter(t => t.client_id === client.id) : [];
    if (clientTasks.length === 0) return 'Healthy';
    
    let hasOverdue = false;
    let hasDueSoon = false;
    let allCompleted = true;
    const today = startOfDay(new Date());

    clientTasks.forEach(t => {
      if (t.status !== 'Completed') {
        allCompleted = false;
        const dueDay = startOfDay(parseISO(t.due_date));
        const daysDiff = differenceInDays(dueDay, today);
        if (daysDiff < 0) hasOverdue = true;
        else if (daysDiff <= 5) hasDueSoon = true;
      }
    });

    if (hasOverdue) return 'Overdue';
    if (hasDueSoon) return 'Due Soon';
    if (allCompleted) return 'Healthy';
    return 'Healthy';
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.company_name.toLowerCase().includes(searchQuery.toLowerCase());
    const health = getClientHealth(client);
    const matchesFilter = healthFilter === 'All' || health === healthFilter;
    return matchesSearch && matchesFilter;
  });

  const handleAddSubmit = async (data) => {
    if (editingClient) {
      await onEditClient(editingClient.id, data);
      setEditingClient(null);
    } else {
      await onAddClient(data);
      setIsFormOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="text-indigo-500" />
            Clients
          </h2>
          <p className="text-sm text-gray-500 mt-1">Select or add a new client.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)} 
          className="p-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg transition-colors"
          title="Add Client"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Search and Filter */}
      <div className="p-4 bg-white border-b border-gray-100 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search clients..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['All', 'Overdue', 'Due Soon', 'Healthy'].map(f => (
            <button
              key={f}
              onClick={() => setHealthFilter(f)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                healthFilter === f 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                  : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      <div className="divide-y divide-gray-50 flex-1 overflow-y-auto">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No clients match your criteria.</div>
        ) : (
          filteredClients.map(client => {
            const clientTasks = allTasks ? allTasks.filter(t => t.client_id === client.id) : [];
            let hasOverdue = false;
            let hasDueSoon = false;
            let allCompleted = clientTasks.length > 0;
            const today = startOfDay(new Date());

            clientTasks.forEach(t => {
                if (t.status !== 'Completed') {
                    allCompleted = false;
                    const dueDay = startOfDay(parseISO(t.due_date));
                    const daysDiff = differenceInDays(dueDay, today);
                    if (daysDiff < 0) hasOverdue = true;
                    else if (daysDiff <= 5) hasDueSoon = true;
                }
            });

            let dotColor = null;
            let dotTitle = "";
            if (hasOverdue) {
              dotColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse';
              dotTitle = "Has Overdue Tasks";
            } else if (hasDueSoon) {
              dotColor = 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]';
              dotTitle = "Has Tasks Due Soon";
            } else if (clientTasks.length > 0 && allCompleted) {
              dotColor = 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]';
              dotTitle = "All Tasks Completed";
            }

            return (
              <div
                key={client.id}
                className={`w-full group text-left transition-all hover:bg-indigo-50/50 ${
                  selectedClientId === client.id 
                    ? 'bg-indigo-50 border-l-4 border-indigo-500' 
                    : 'border-l-4 border-transparent'
                }`}
              >
                <div className="p-4 flex justify-between items-start">
                  <button onClick={() => onSelectClient(client.id)} className="flex-1 text-left">
                    <div className="font-semibold text-gray-800 text-base flex items-center gap-2">
                       {client.company_name}
                       {dotColor && <span className={`w-3 h-3 rounded-full shrink-0 ${dotColor}`} title={dotTitle}></span>}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><Globe2 size={12}/> {client.country}</span>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">
                         {client.entity_type}
                      </span>
                    </div>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingClient(client); }} 
                    className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-md hover:bg-white border border-transparent shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    title="Edit Client"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {(isFormOpen || editingClient) && <ClientForm initialData={editingClient} onClose={() => { setIsFormOpen(false); setEditingClient(null); }} onSubmit={handleAddSubmit} onDelete={onDeleteClient ? async (id) => { await onDeleteClient(id); setEditingClient(null); } : undefined} />}
    </div>
  );
};

export default ClientList;
