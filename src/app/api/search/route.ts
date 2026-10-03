import {NextRequest,NextResponse} from 'next/server';
import {carRepository} from '@/services/car-repository';
export async function GET(req:NextRequest){return NextResponse.json(carRepository.suggest((req.nextUrl.searchParams.get('q')||'').slice(0,100)))}
