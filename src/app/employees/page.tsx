'use client';
import dynamic from 'next/dynamic';
const Screen = dynamic(() => import('@/screens/EmployeesScreen'), { ssr: false });
export default function Page() { return <Screen />; }
