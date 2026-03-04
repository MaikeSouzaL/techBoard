'use client';
import dynamic from 'next/dynamic';
const Screen = dynamic(() => import('@/screens/GuideViewScreen'), { ssr: false });
export default function Page() { return <Screen />; }
