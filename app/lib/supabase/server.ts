import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
    const coockieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
            cookies: {
                getAll() {
                    return coockieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {   
                        cookiesToSet.forEach(({name, value, options}) => {
                            coockieStore.set(name, value, options);
                        });
                    }
                    catch {
                        // setAll method from server component

                    }
                },
            },
        })
}