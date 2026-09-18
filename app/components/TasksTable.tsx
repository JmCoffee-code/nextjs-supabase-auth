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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PencilIcon, Plus, Search, Trash2 } from "lucide-react";
import { getPriorityBadgeColor, getStatusBadgeColor } from "../utils/table_healpers";
import TaskModal from "./TaskModal";
import { getPriority } from "os";
import ConfirmModal from "./ConfirmModal";


const TasksTable = () => {
    
    const queryClient = useQueryClient();

    //table state management
    const [sorting, setSorting] = useState<SortingState>([]);
    const[columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // Modal State management
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isConfirModalOpen, setIsConfirmModalOpen] = useState(false);
    const [tasksToDelete, setTaskToDelete] = useState<Task | null>(null);

    const [deleteError, setDeleteError] = useState<string | null>(null);

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


    const deleteMutation = useMutation({
        mutationFn: deleteTasks,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['tasks']});
        },
    });

    // function handlers
    const handleCreateModal = () => {
        setSelectedTask(null);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if(!tasksToDelete) return;
        setDeleteError(null);
        const result = await deleteMutation.mutateAsync(tasksToDelete.id);
        if(result.error) {
            setDeleteError(result.error);
        }
        else {
            setIsConfirmModalOpen(false);
            setTaskToDelete(null);
            setDeleteError(null);
        }
    };

    const handleCloseConfirmModal = () => {
        if(!deleteMutation.isPending) {
            setIsConfirmModalOpen(false);
            setTaskToDelete(null);
            setDeleteError(null);
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const getUserDisplayName = (userId: string | null) : string => {
        if(!userId) return "-";
        const user = users?.find((u) => u.id === userId);
        if(!user) return userId;
        return `${user.name} (${user.email})`;
;
    }

    const handleEdit = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    }; // Here in delete Modal I stop

    const handDeleteClick = (task: Task) => {
        setTaskToDelete(task);
        setIsConfirmModalOpen(true);
    }

    // table columns
    const columns = useMemo<ColumnDef<Task>[]> (
        () => [
            {
                accessorKey: "title",
                header: "Title",
                cell: (info) => (
                    <div className="font-medium text-white">
                        {info.getValue() as string}
                    </div>   
                ),   
            },
            {
                accessorKey: "description",
                header: "Description",
                cell: (info) => (
                    <div className="max-w-md- truncate text-gray-400">
                        {info.getValue() as string}
                    </div>   
                ),   
            },
             
            {
                accessorKey: "status",
                header: "Status",
                cell: (info) => {
                    const status = info.getValue() as string;
                    return <span className={`inline-flex rounded-full px-2 py-1 text-sm font-semibold ${getStatusBadgeColor(status)}`}>
                        {status.replace("_", " ").toLowerCase()}
                    </span>  
                }, 
            },
            {
                accessorKey: "priority",
                header: "Priority",
                cell: (info) => {
                    const priority = info.getValue() as string;
                    return <span className={`inline-flex rounded-full px-2 py-1 text-sm font-semibold ${getPriorityBadgeColor(priority)}`}>
                        {priority.toUpperCase()}
                    </span>  
                }, 
            },
            {
                accessorKey: "assigned_to",
                header: "Assigned to",
                cell: (info) => (
                    <div className="font-medium text-white">
                        {getUserDisplayName(info.getValue() as string)}
                    </div>   
                ),   
            },
            {
                accessorKey: "created_at",
                header: "Created At",
                cell: (info) => {
                    const date = new Date(info.getValue() as string);
                    return <div className="text-sm text-gray-400">
                        {date.toLocaleDateString()} {date.toLocaleTimeString()}
                    </div>
                },
            },
            {
                accessorKey: "updated_at",
                header: "Updated At",

                cell: (info) => {
                    const date = new Date(info.getValue() as string);
                    return <div className="text-sm text-gray-400">
                        {date.toLocaleDateString()} {date.toLocaleTimeString()}
                    </div>
                },
            },
            {
                id: "actions",
                header: "Actions",
                cell: (info) => {
                    const task = info.row.original;
                    return <div className="flex items-center gap-2">

                        <button 
                        type="button" className="cursor-pointer" 
                        onClick={() => handleEdit(task)}
                        disabled={deleteMutation.isPending}
                            ><PencilIcon 
                        className="h-4 w-4 text-gray-400 hover:text-white"/>
                        </button>

                        <button type="button" className="cursor-pointer"
                        onClick={() => handDeleteClick(task)}
                        disabled={deleteMutation.isPending}
                        >
                            <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300"/></button>
                    </div>
                }
            }
        ], 
        [deleteMutation.isPending]
    );

    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        globalFilterFn: "includesString",
        state: {
            sorting,
            columnFilters,
            globalFilter,
            pagination
        },
    });

    if(isLoading) {
        return <div className="flex items-center justify-center p-8">
            <div className="text-gray-400">Loading tasks...</div>
        </div>
    }

    if(error) {
        return <div className="rounded-lg p-4 bg-red-900/20 text-red-400">
            Error loading tasks : {error instanceof Error ? error.message : "unknown Error"}
        </div>
    }

    // display create tasks
  return (
    <>
        <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Tasks</h2>
            <button
            type="button"
           onClick={handleCreateModal}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-white text-black hover:bg-gray-200">
                <Plus className="w-4 h-4 text-black"/>
                Create Tasks
            </button>
        </div>

        <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                <input type="text" 
                value={globalFilter ?? ""} 
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border pl-10 bg-gray-800 pr-4 py-2 placeholder-gray-400 text-white"
                />
            </div>
            <div className="text-sm text-gray-400">
                {table.getFilteredRowModel().rows.length} of {" "}
                {table.getCoreRowModel().rows.length} tasks
            </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full border-collapse">
                <thead className="bg-gray-900">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="border-b border-gray-800 px-4 py-3 text-left text-sm font-medium uppercase tracking-wider text-gray-300"
                                >
                                    {header.isPlaceholder ? null : (
                                        <div
                                            className={
                                                header.column.getCanSort()
                                                    ? "cursor-pointer select-none hover:text-white"
                                                    : ""
                                            }
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}

                                            {{
                                                asc: " ↑",
                                                desc: " ↓",
                                            }[header.column.getIsSorted() as string] ?? null}
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="divide-y divide-gray-800 bg-gray-800">
                    {table.getRowModel().rows.length === 0 ?  (
                        <tr>
                        <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">{globalFilter ? "NO task found matching search" : "No tasks found. Create your first Task!"}</td>
                    </tr>
                    ) : (
                        table.getRowModel().rows.map((row) => <tr key={row.id} className="hover:bg-gray-800">
                            {row.getVisibleCells().map((cell) => <td key={cell.id} className="whitespace=nowrap px-4 py-3 text-sm text-gray-300
                        ">{flexRender(cell.column.columnDef.cell, cell.getContext()
                        )}
                        </td>
                        )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Row per page: </span>
                <select className="rounded-lg border px-2 py-1 text-sm bg-gray-800 text-white focus:border-white focus:ring-white">{[5, 10, 20, 30, 50].map((pageSize) => <option key={pageSize} value={pageSize}>{pageSize}</option>)}
                </select>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>

                <div className="flex items-center gap-2">
                    <button 
                    className="rounded-lg border p-1.5 disabled:cursor-not-allowed disabled:opacity-50 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700" 
                    disabled={!table.getCanPreviousPage()}
                    onClick={() => table.setPageIndex(0)}
                    >
                        <ChevronsLeft className="h-4 w-4 text-gray-300"/>
                    </button>

                    <button className="rounded-lg border p-1.5 disabled:cursor-not-allowed disabled:opacity-50 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
                    disabled={!table.getCanPreviousPage()}
                    onClick={() => table.previousPage()}
                    >
                        <ChevronLeft className="h-4 w-4 text-gray-300"/>
                    </button>

                    <button className="rounded-lg border p-1.5 disabled:cursor-not-allowed disabled:opacity-50 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
                    disabled={!table.getCanNextPage()}
                    onClick={() => table.nextPage()}
                    >
                        <ChevronRight className="h-4 w-4 text-gray-300"/>
                    </button>

                    <button className="rounded-lg border p-1.5 disabled:cursor-not-allowed disabled:opacity-50 border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
                    disabled={!table.getCanNextPage()}
                    onClick={() => table.setPageIndex(table.getPageCount() -1)}
                    
                    >
                        <ChevronsRight className="h-4 w-4 text-gray-300"/>
                    </button>

                </div>
            </div>

        </div>

        <TaskModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        task={selectedTask}
        />
        <ConfirmModal 
        isOpen={isConfirModalOpen} 
        onClose={handleCloseConfirmModal} 
        onConfirm={handleConfirmDelete}
        title="Delete Tasks"
        error={deleteError}
        message={
            tasksToDelete 
            ? `Are you sure you want to delete (${tasksToDelete.title}) this action cannot be undone.` 
            : `Are you sure you want to delete this task? this action cannot be undone`
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
        />
    </>
  );
};

export default TasksTable