import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TasksTable from "../components/TasksTable";

const TaskPage = async () => {
    const supabase = await createClient();
    const {
        data: {user}, 
    } = await supabase.auth.getUser();

    if(!user) {
        redirect("/login");
    }


  return (
    <div className="min-h-screen bg-black px-4 py-8">
        <div className="mx-auto max-w-7xl">
            <Link href={"/dashboard"} className="text-sm mb-4 inline-flex items-center text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4"/>
                Back to Dashboard
            </Link>
            <TasksTable/>
        </div>
    </div>
  )
}

export default TaskPage