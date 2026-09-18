"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Task, TaskStatus, TaskPriority } from "../lib/types/database";
import { useEffect, useState } from "react";
import { getUsers } from "../actions/users";
import { createTask, updateTask } from "../actions/tasks";
import { X } from "lucide-react";

interface TaskModalProps  {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
}

const TaskModal = ({isOpen, onClose, task} : TaskModalProps) => {

  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState< string | null >(null);
  
  const {
    data: users, 
    isLoading: isLoadingUsers, 
    error: usersError,
  } = useQuery({
    queryKey: ["users"], 
    queryFn: async() => {
    const result = await getUsers();

    if(result.error) {
      throw new Error(result.error);
    }
    return result.data || [];

  },
  enabled: isOpen, 
});

const [formData, setFormData] = useState({
  title: "",
  description: "",
  status: "pending" as TaskStatus,
  priority: "medium" as TaskPriority,
  assigned_to: "",
});

useEffect(() => {
    if(!isOpen) {
      return;
    }

    const newFormData = task 
    ? { 
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      assigned_to: task.assigned_to || "",
     }
    : {
      title: "",
      description: "",
      status: "pending" as TaskStatus,
      priority: "medium" as TaskPriority,
      assigned_to: "",
    };

    setFormData(newFormData);
    setError(null);
}, [task, isOpen])

 if(!isOpen) return null;

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  const form = new FormData(e.currentTarget);
  const result = task 
    ? await(updateTask(task.id, form)) 
    : await createTask(form);

    if(result.error) {
      setError(result.error); 
      setIsSubmitting(false);
    }
    else {
      queryClient.invalidateQueries({queryKey: ["tasks"]});
      onClose();
      setIsSubmitting(false);
    }
 };

 const handleClose = () => {
  if(!isSubmitting) {
    onClose();
    setError(null);
  }
 }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border bg-gray-900 shadow-lg border-gray-800">
        <div className="flex items-center justify-between border-b border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white">{task ? "Edit tasks" : "Create new Tasks"}
          </h2>
          <button 
          type="button" 
          onClick={handleClose} 
          disabled={isSubmitting}
          className="rounded-lg p-1 text-gray-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && 
          (<div className="mb-4 rounded-lg bg-red-900/20 text-red-400 p-3">
            {error}
          </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray=300">
                Title <span className="text-red-500"></span>
              </label>
              <input 
              type="text" 
              name="title" 
              id="title" 
              required 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value
              })} 
              className="mt-1 block w-full bg-gray-800 px-3 py-2 text-white rounded-lg border border-gray-700 focus:border-white focus:ring-white"
              disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray=300">
                Description
              </label>
              <textarea 
              id="description" 
              name="description" 
              rows={4} 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value

              })}
              className="mt-1 block w-full bg-gray-800 px-3 py-2 text-white rounded-lg border border-gray-700 focus:border-white focus:ring-white"
              disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="">
                <label 
                htmlFor="status" 
                className="block text-sm font-medium text-gray=300">
                Status 
                </label>
                <select 
                name="status" 
                id="status" 
                className="mt-1 block w-full bg-gray-800 px-3 py-2 text-white rounded-lg border border-gray-700 focus:border-white focus:ring-white"
                value={formData.status}
                onChange={(e) => setFormData({...formData,status: e.target.value as TaskStatus

                })}
                disabled={isSubmitting}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="">
                <label 
                htmlFor="priority" 
                className="block text-sm font-medium text-gray=300">
                Priority 
                </label>
                <select 
                name="priority" 
                id="priority" 
                className="mt-1 block w-full bg-gray-800 px-3 py-2 text-white rounded-lg border border-gray-700 focus:border-white focus:ring-white"
                value={formData.priority}
                onChange={(e) => setFormData({...formData,priority: e.target.value as TaskPriority

                })}
                disabled={isSubmitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label 
                htmlFor="assigned_to" 
                className="block text-sm font-medium text-gray=300">
                Assigned To 
                </label>
                <select name="assigned_to" id="assigned_to" value={formData.assigned_to} onChange={(e) => setFormData({...formData, assigned_to: e.target.value})
                }
                className="mt-1 block w-full bg-gray-800 px-3 py-2 text-white rounded-lg border border-gray-700 focus:border-white focus:ring-white"
                disabled={isSubmitting}
                  >
                  <option value="">Unassigned</option>
                  {isLoadingUsers 
                  ? <option disabled>Loading users...</option> : usersError 
                  ? <option disabled>Error loading users</option> 
                  : users && users.length > 0 
                  ? users.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>) 
                  : <option disabled>No users found</option>}
                </select>

                {usersError && (
                  <p className="mt-1 text-xs text-amber-400">
                    {usersError instanceof Error 
                    ? usersError.message
                    : "Unabled to load users."}
                  </p>
                )}

                {
                users 
                && users.length === 0 
                && !isLoadingUsers 
                && !usersError 
                && (
                  <p className="mt-1 text-xs text-gray-400">No users registered yet.</p>
                )}

            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">

            <button 
            type="button" 
            onClick={handleClose} 
            disabled={isSubmitting} 
            className="cursor-pointer rounded-lg border border-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-700 hover:border-gray-600">
              Cancel
            </button>

            <button 
            type="submit" 
            disabled={isSubmitting} 
            className="cursor-pointer rounded-lg border border-gray-700 px-4 py-2 text-black transition-colors hover:bg-gray-700 hover:border-gray-600 bg-white disabled:opacity-50">{
            isSubmitting 
            ? "Saving..." 
            : task
            ? "Update Tasks"
            : "Create Task"
            }
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;