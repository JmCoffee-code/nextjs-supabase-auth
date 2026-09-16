"use client";

import { useMemo, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel, 
    getFilteredRowModel,  
    getPaginationRowModel, 
    flexRender, 
    type ColumnDef, 
    type SortingState, 
    type ColumnFiltersState, 
    type PaginationState 
} from "@tanstack/react-table";
import {
    useQuery, 
    useMutation, 
    useQueryClient
} from "@tanstack/react-query";
import type { Task } from "../lib/types/database";
import { getTasks, deleteTasks } from "../actions/tasks";
import { getUsers } from "../actions/users";


const TasksTable = () => {
    
    const queryClient = useQueryClient();

    //table state management
    const [sorting, setSorting] = useState<SortingState>([]);
    const[columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10
    });

    // Modal State management
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isConfirModalOpen, setIsConfirmModalOpen] = useState(false);
    const [tasksToDelete, setTaskToDelete] = useState<Task | null>(null);

    const {data, isLoading, error} = useQuery({
        queryKey:['tasks'],
        queryFn: async () => {
            const result = await getTasks();

            if(result.error) {
                throw new Error(result.error);
            }
            return result.data || [];
        },
    });

    const {data: users} = useQuery({
        queryKey:['users'],
        queryFn: async () => {
            const result = await getUsers();

            if(result.error) {
                throw new Error(result.error);
            }
            return result.data || [];
        },
    });


    

    // display
  return (
    <div> TasksTable Component</div>
  )
}

export default TasksTable