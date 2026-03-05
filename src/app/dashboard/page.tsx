'use client';
import dynamic from 'next/dynamic';
const Screen = dynamic(() => import('@/screens/DashboardScreen'), { ssr: false });
export default function Page() { return <Screen />; }
