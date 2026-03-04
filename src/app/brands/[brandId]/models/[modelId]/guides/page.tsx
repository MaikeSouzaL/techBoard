'use client';
import dynamic from 'next/dynamic';
const Screen = dynamic(() => import('@/screens/GuidesScreen'), { ssr: false });
export default function Page() { return <Screen />; }
