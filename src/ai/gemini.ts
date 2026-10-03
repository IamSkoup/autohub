import {z} from 'zod';
import {AUTOHUB_SYSTEM_PROMPT} from './system-prompt';
const recommendation=z.object({carId:z.string(),score:z.number().min(0).max(100),reason:z.string(),pros:z.array(z.string()),cons:z.array(z.string())});
export const recommendationResponse=z.object({summary:z.string(),recommendations:z.array(recommendation).min(1).max(6)});
export const comparisonResponse=z.object({summary:z.string(),differences:z.array(z.string()),scenarios:z.array(z.object({carId:z.string(),text:z.string()}))});
export async function callGemini<T>(prompt:string,schema:z.ZodType<T>):Promise<T>{
 const key=process.env.GEMINI_API_KEY;if(!key)throw new Error('AI_NOT_CONFIGURED');
 const model=process.env.GEMINI_MODEL||'gemini-3.8-flash';
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),25000);
 try{
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({systemInstruction:{parts:[{text:AUTOHUB_SYSTEM_PROMPT}]},contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json',temperature:0.3}}),signal:controller.signal,cache:'no-store'});
  if(response.status===429)throw new Error('AI_QUOTA');if(!response.ok)throw new Error(`AI_UPSTREAM_${response.status}`);
  const json=await response.json();const text=json?.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||'').join('');if(!text)throw new Error('AI_EMPTY');return schema.parse(JSON.parse(text));
 }finally{clearTimeout(timer)}
}
