import {NextRequest,NextResponse} from 'next/server';
import {carRepository} from '@/services/car-repository';
export function GET(req:NextRequest){const ids=(req.nextUrl.searchParams.get('ids')||'').split(',').slice(0,20);return NextResponse.json(ids.map(id=>carRepository.getById(id)).filter(Boolean))}
