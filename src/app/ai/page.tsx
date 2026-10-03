import {Suspense} from 'react';
import {AiClient} from '@/components/ai-client';
export const metadata={title:'AI-подбор автомобиля'};
export default function Ai(){return <Suspense fallback={<div className="container loading-page">Загрузка…</div>}><AiClient/></Suspense>}
