'use client';
import dynamic from 'next/dynamic';
const Screen = dynamic(() => import('@/screens/SettingsScreen'), { ssr: false });
export default function Page() { return <Screen />; }
