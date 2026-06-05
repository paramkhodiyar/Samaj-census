'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react';
import { useActionState } from 'react';

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black p-4">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
      
      <Card className="w-full max-w-md bg-black/60 border-blue-500/30 backdrop-blur-xl shadow-2xl shadow-blue-500/10 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>
        <CardHeader className="space-y-1 pt-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-2xl bg-blue-600/10 border border-blue-500/20">
              <Shield className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center text-white tracking-tight">Samaj Portal</CardTitle>
          <CardDescription className="text-center text-gray-400 text-base">
            Enterprise Registry & Census Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                />
              </div>
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{state.error}</p>
              </div>
            )}

            <SubmitButton />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-11">
              Mobile OTP
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-11">
              Google
            </Button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4">Register your family</a>
          </p>
        </CardFooter>
      </Card>
      
      <div className="fixed bottom-4 left-4 flex gap-6">
        <div className="text-xs text-gray-600">v1.0.0 Stable</div>
        <div className="text-xs text-gray-600">Secure AES-256 Encryption</div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          Authenticating...
        </div>
      ) : (
        'Sign In to Registry'
      )}
    </Button>
  );
}
