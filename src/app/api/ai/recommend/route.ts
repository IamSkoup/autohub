import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import {extractRequirements,clarifyingQuestions} from '@/ai/requirements';
import {callGemini,recommendationResponse} from '@/ai/gemini';
import {carRepository} from '@/services/car-repository';
import {rateLimit} from '@/lib/rate-limit';
import {popularity} from '@/services/popularity';
export const runtime='nodejs';
const requestSchema=z.object({text:z.string().min(1).max(1500),budgetMax:z.number().positive().optional(),condition:z.string().optional(),body:z.string().optional(),seats:z.number().optional(),minPower:z.number().positive().optional(),drive:z.string().optional(),fuel:z.string().optional(),transmission:z.string().optional(),purpose:z.string().optional()});
export async function POST(req:NextRequest){
 const parsed=requestSchema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'Проверьте параметры запроса.'},{status:400});
 const r=parsed.data;popularity.recordSearch(r.text);const questions=clarifyingQuestions(r);if(questions.length&&!r.budgetMax&&!r.body&&!r.purpose)return NextResponse.json({questions});
 const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'local';if(!rateLimit(ip))return NextResponse.json({error:'Слишком много запросов. Попробуйте немного позже.'},{status:429});
 const filters=extractRequirements(r);let candidates=carRepository.candidates(filters,40);
 // Sparse catalogue records have no market prices. Relax unsupported strict filters and disclose this.
 const relaxed=candidates.length<3;if(relaxed)candidates=carRepository.candidates({...filters,maxPrice:undefined,minPrice:undefined,transmission:undefined,minSeats:undefined,minPower:undefined,maxPower:undefined,maxConsumption:undefined,minDisplacement:undefined,maxDisplacement:undefined},40);
 if(!candidates.length)return NextResponse.json({error:'В каталоге пока нет подходящих кандидатов.'},{status:404});
 const compact=candidates.map(c=>({id:c.id,brand:c.brand,model:c.model,generation:c.generation,yearStart:c.yearStart,yearEnd:c.yearEnd,body:c.body,priceMin:c.priceMin,priceMax:c.priceMax,drive:c.drive,fuel:c.fuel,transmission:c.transmission,horsepower:c.horsepower,consumption:c.consumption,description:c.description,tags:c.tags}));
 try{const ai=await callGemini(`Запрос пользователя: ${r.text}\nДополнительные требования: ${JSON.stringify(r)}\nИзвлечённые фильтры: ${JSON.stringify(filters)}\nКандидаты из каталога: ${JSON.stringify(compact)}\nВерни JSON: {"summary":"...","recommendations":[{"carId":"id из списка","score":0-100,"reason":"...","pros":["..."],"cons":["..."]}]}. Не приписывай неизвестные цену, коробку и характеристики. ${relaxed?'Строгие фильтры были ослаблены из-за неполных данных; прямо предупреди об этом.':''}`,recommendationResponse);
 const ids=new Set(candidates.map(c=>c.id));const valid=ai.recommendations.filter(x=>ids.has(x.carId)).slice(0,6);if(!valid.length)throw new Error('AI_INVALID_IDS');return NextResponse.json({summary:ai.summary,recommendations:valid.map(x=>({...x,car:carRepository.getById(x.carId)})),relaxed});
 }catch(e){const msg=e instanceof Error?e.message:'';return NextResponse.json({error:msg==='AI_NOT_CONFIGURED'?'AI пока не подключён. Добавьте GEMINI_API_KEY на сервере.':msg==='AI_QUOTA'?'Лимит бесплатного AI временно исчерпан. Каталог продолжает работать.':'AI временно недоступен. Попробуйте позже.'},{status:msg==='AI_QUOTA'?429:503})}
}
