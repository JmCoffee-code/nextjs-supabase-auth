import Link from "next/link";
import { createClient } from "./lib/supabase/server";

export default async function DashboardPage (){
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

   
    return (
        <div className="flex min-h-screen justify-center items-center bg-black">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-white text-3xl font-semibold">Welcome</h1>
                    <p className="text-sm text-gray-400 mt-2">
                        {user ? `Hello, ${user.user_metadata?.name || user.email?.split('@')[0] || "User"}` : `get Started with your account`}
                    </p>
                </div>
                <div className="flex flex-col gap-4">
                  {user ? (<Link className="text-black bg-white rounded-lg px-6 py-3" href={"/dashboard"}>Go to Dashboard</Link>) : (
                    <>
                    <Link className="text-black bg-white rounded-lg px-6 py-3" href={"/login"}>Sign In</Link>
                    <Link className="text-black bg-white rounded-lg px-6 py-3" href={"/register"}>Sign Up</Link>
                    </>
                  )}
                </div>
            </div>
        </div>
    );
}