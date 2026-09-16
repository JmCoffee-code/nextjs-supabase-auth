"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "../lib/supabase/server";
import { use } from "react";

export interface UserOption {
    id: string;
    email: string;
    name?: string;
}

export const getUsers = async (): Promise<{
    error: string | null;
    data: UserOption[] | null;
}> => {
    const supabase = await createServerClient();

    const {
        data: {user}, 
    } = await supabase.auth.getUser();

    if(!user) {
        return { error: "Unauthorize", data: null};
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if(!supabaseServiceKey) {
        return {
            error: 'Service role key not configured. please add supabase role key',
            data: null,
        }
    }

    const adminClient = createClient(supabaseUrl!, supabaseServiceKey, {auth: {
            autoRefreshToken: false,
            persistSession: false
        },
    });

    const {data, error} = await adminClient.auth.admin.listUsers(); // here is what I get list of users in this line of code

    if(error) {
        return {error: error.message, data: null};
    }

    const users: UserOption[] = data.users.map((u) => ({
        id: u.id,
        email: u.email || "",
        name: u.user_metadata?.name || u.email?.split('@')[0] || "User",
    })) || []

    return { error: null, data: users };
}