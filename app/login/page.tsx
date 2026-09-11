import Link from "next/link";
import { AuthForm } from '../components/AuthForm';
import { signIn } from '../actions/auth';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4
    dark:bg-black">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl text-white font-semibold">SIGN IN</h1>
                    <p className="mt-2 text-sm text-gray-600">Welcome back! Please sign in to your account

                    </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-8 rounded-lg">
                    <AuthForm action={signIn}/>
                    <div className="text-sm text-center mt-6">
                        <span className="text-gray-400">Don&apos;t have an account?{" "}</span>
                        <Link href={"/register"} className="font-medium text-white underline"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}