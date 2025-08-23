'use client';
import { useAuth } from '../../../hooks/useAuth';

export default function AdminPage() {
  const { logout, user} = useAuth();

  return (
    <div>
    <h1>Admin Dashboard</h1>
    <h2>{`Hello ${user?.name}`}</h2>
    <button onClick={()=>{
      logout();
    }}>Logout</button>
    </div>
  );
}