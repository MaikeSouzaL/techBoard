'use client';
import dynamic from 'next/dynamic';
const Screen = dynamic(() => import('@/screens/BrandsScreen'), { ssr: false });
export default function Page() { return <Screen />; }
