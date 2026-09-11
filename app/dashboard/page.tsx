import { createClient } from "../lib/supabase/server";
import { signOut, signUp } from "../actions/auth";
import { LogOut } from "lucide-react";

export default async function DashboardPage (){
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if(!user) {
        return null;
    }

    const userMetaData = user.user_metadata;
    const userName = userMetaData?.name || user.email?.split('@')[0] || "User";

    return (
        <div className="flex min-h-screen justify-center items-center bg-black">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-white text-3xl font-semibold">Dashboard</h1>
                    <p className="text-sm text-gray-400 mt-2">
                        Welcome to your dashboard
                    </p>
                </div>
                <div className="border border-gray-800 bg-gray-900 p-8 rounded-lg">
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm form-medium text-gray-400">{userName}</label>
                            <p className="mt-1 text-lg text-white">userName</p>
                        </div>
                        <div>
                            <label className="text-sm form-medium text-gray-400">{user.email}</label>
                            <p className="mt-1 text-lg text-white">Email</p>
                        </div>

                        <form action={signOut}>
                            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 text-white px-4 py-3 transition-colors hover:bg-gray-700 cursor-pointer">
                                <LogOut className="h-4 w-4"/>
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}