"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";
import type { TaskInsert, TaskUpdate, TaskStatus } from "../lib/types/database"; 

export const getTasks = async () => {
    const supabase = await createClient();

    const {
        data: {user}, 
    } = await supabase.auth.getUser();

    if(!user) {
        return { error: "Unauthorize", data: null}
    }
    const {data, error} = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", {ascending : false});

    if(error) {
        return {error: error.message, data: null};
    }

    return { error: null, data};
};

export const getTask = async(id: string) => {
    const supabase = await createClient();

    const {
        data: {user}, 
    } = await supabase.auth.getUser();

    if(!user) {
        return { error: "Unauthorize", data: null}
    }
    const {data, error} = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

    if(error) {
        return {error: error.message, data: null};
    }

    return { error: null, data};
}

// next task is create

export const createTask = async (formData: FormData) => {
    const supabase = await createClient();
    const {
        data: {user}, 
    } = await supabase.auth.getUser();

    if(!user) {
        return { error: "Unauthorize"}
    }

    const taskData: TaskInsert = {
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || null,
        status: (formData.get("status") as TaskStatus) || "pending",
        priority: (formData.get("priority") as TaskInsert["priority"]) || "medium",
        assigned_to: formData.get("assigned_to") as string || null,

    };

    if(!taskData.title || taskData.title.trim() === "") {
        return {error: "Title is required"};
    }

    const {error} = await supabase.from("tasks").insert({
        ...taskData,
        created_by: user.id
    });

    if(error) {
        return { error: error.message }
    }

    revalidatePath("/tasks");
    return {error: null};
};

export const updateTask = async (id: string, formdata: FormData) => {
    const supabase = await createClient();
    const {
        data: {user}, 
    } = await supabase.auth.getUser();

    if(!user) {
        return { error: "Unauthorize"}
    }

    const {data: task, error: fetchError} = await supabase
    .from("tasks")
    .select("created_by, assigned_to")
    .eq("id", id)
    .single();

    if(fetchError || !task) {
        return { error: "Task not found"};
    }

    const canEdit = task.created_by === user.id || task.assigned_to === user.id;

    if(!canEdit) {
        return {error: "You do not have permission to edit this tasks"}
    };

    const updateData: TaskUpdate = {};

    const title = formdata.get("title") as string;
    if(title) updateData.title = title;

    const description = formdata.get("description") as string;
    updateData.description = description || null;

    const status = formdata.get("status") as TaskStatus;
    if(status) updateData.status = status;

    const priority = formdata.get("priority") as TaskUpdate["priority"];
    if(priority) updateData.priority = priority;

    const assigned_to = formdata.get("assigned_to") as string;
    updateData.assigned_to = assigned_to || null;

    const {error} = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", id)

    if(error) {
        return { error: error.message };
    }

    revalidatePath("/tasks");
    return { error: null };
};

export const deleteTasks = async (id: string) => {
    const supabase = await createClient();
    const {
        data: {user}, 
    } = await supabase.auth.getUser();

    if(!user) {
        return { error: "Unauthorize"}
    }

    const {data: task, error: fetchError} = await supabase
    .from("tasks")
    .select("created_by")
    .eq("id", id)
    .single();

    if(fetchError || !task) {
        return {error: "Tasks not found"};
    }

    if(task.created_by !== user.id) {
        return {error: "Only the creator can delete this task"}
    }

    const {error} = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

    if(error) {
        return {error: error.message}
    }

    revalidatePath("/tasks");
    return {error: null};
}