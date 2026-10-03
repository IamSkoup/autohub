import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import {popularity} from '@/services/popularity';
import {carRepository} from '@/services/car-repository';
import {rateLimit} from '@/lib/rate-limit';
export async function POST(req:NextRequest){const p=z.object({type:z.enum(['search','view']),value:z.string().min(1).max(100)}).safeParse(await req.json().catch(()=>null));if(!p.success)return NextResponse.json({error:'Bad event'},{status:400});const ip=req.headers.get('x-forwarded-for')?.split(',')[0]||'local';if(!rateLimit(`event:${ip}`,120,60*60*1000))return NextResponse.json({error:'Rate limited'},{status:429});if(p.data.type==='search')popularity.recordSearch(p.data.value);else if(carRepository.getById(p.data.value))popularity.recordView(p.data.value);return NextResponse.json({ok:true})}
