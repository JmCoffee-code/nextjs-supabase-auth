import Link from "next/link";
import { AuthForm } from '@/app/components/AuthForm';
import { signUp } from "@/app/actions/auth";

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4
    dark:bg-black">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl text-white font-semibold">SIGN UP</h1>
                    <p className="mt-2 text-sm text-gray-600">Create yout account to get started

                    </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-8 rounded-lg">
                    <AuthForm action={signUp} isRegister/>
                    <div className="text-sm text-center mt-6">
                        <span className="text-gray-400">Already have an account? {" "}</span>
                        <Link href={"/login"} className="font-medium text-white underline"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}