
"use client";

import Link from 'next/link';
import { Trophy, User, LogOut, LogIn, UserPlus, Shield, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/context/user-context';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
  const { user, logout } = useUser();
  const isSuperAdmin = user?.email === 'markus.koenigreich@gmail.com';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex flex-wrap items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Trophy className="h-6 w-6 text-primary" />
          <div>
            <span className="font-bold text-lg font-headline">Ping Pong Champions</span>
            <p className="text-xs text-muted-foreground">Compete with friends in your own ping pong league.</p>
          </div>
        </Link>
        <div className="flex items-center justify-end gap-2 mt-4 sm:mt-0 flex-wrap">
          {user ? (
            <>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="bg-secondary border-transparent hover:shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0">
                  <User className="mr-2 h-4 w-4" />
                  <span>{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    {user.showEmail && (
                        <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                        </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
                </DropdownMenuItem>
                 {isSuperAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/users"><Shield className="mr-2 h-4 w-4" />User Management</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/leagues"><Swords className="mr-2 h-4 w-4" />League Management</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <div className='flex items-center gap-2 flex-wrap justify-end'>
               <ThemeToggle />
              <Button asChild variant="ghost">
                <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Login</Link>
              </Button>
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/register"><UserPlus className="mr-2 h-4 w-4" />Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
