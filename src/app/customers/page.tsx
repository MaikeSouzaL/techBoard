'use client';
import dynamic from 'next/dynamic';
const Screen = dynamic(() => import('@/screens/CustomersScreen'), { ssr: false });
export default function Page() { return <Screen />; }
