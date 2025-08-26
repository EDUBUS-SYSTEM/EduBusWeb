'use client';
import { useAuth } from '../../../hooks/useAuth';
import Link from 'next/link';

export default function AdminPage() {
  const { logout, user} = useAuth();

  return (
    <div>
    <h1>Admin Dashboard</h1>
    <h2>{`Hello ${user?.name}`}</h2>
    <Link href="/create-account">
      <button>Create Account</button>
    </Link>
    <button onClick={()=>{
      logout();
    }}>Logout</button>
    </div>
  );
}