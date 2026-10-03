import {NextRequest,NextResponse} from 'next/server';
import {carRepository} from '@/services/car-repository';
import type {CarFilters} from '@/types/car';
export const runtime='nodejs';
export async function GET(req:NextRequest){const s=req.nextUrl.searchParams;const f:CarFilters={};for(const key of ['q','brand','model','country','body','engine','fuel','transmission','drive','sort'] as const){const v=s.get(key);if(v)f[key]=v}for(const key of ['minPrice','maxPrice','minYear','maxYear','minPower','maxPower','minDisplacement','maxDisplacement','maxConsumption','minSeats','page','pageSize'] as const){const n=Number(s.get(key));if(Number.isFinite(n)&&n>0)f[key]=n}return NextResponse.json(carRepository.search(f),{headers:{'Cache-Control':'public, max-age=30, stale-while-revalidate=120'}})}
