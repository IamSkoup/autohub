import type {CarFilters} from '@/types/car';
export type Requirements={text:string;budgetMax?:number;condition?:string;body?:string;seats?:number;minPower?:number;drive?:string;fuel?:string;transmission?:string;purpose?:string};
export function extractRequirements(input:Requirements):CarFilters{
 const t=input.text.toLocaleLowerCase();const f:CarFilters={};
 const raw=t.match(/(?:до|не дороже|бюджет\s*до)\s*(\d[\d\s.,]*)\s*(млн|миллион|тыс|тысяч|₽|руб)?/);
 if(input.budgetMax)f.maxPrice=input.budgetMax;else if(raw){let n=Number(raw[1].replace(/\s/g,'').replace(',','.'));const unit=raw[2]||'';if(unit.startsWith('млн')||unit.startsWith('миллион'))n*=1e6;else if(unit.startsWith('тыс')||n<1000)n*=1000;f.maxPrice=Math.round(n)}
 if(input.body)f.body=input.body;else if(/кроссовер/i.test(t))f.body='Кроссовер';else if(/седан/i.test(t))f.body='Седан';else if(/внедорожник/i.test(t))f.body='Внедорожник';
 if(input.drive)f.drive=input.drive;else if(/полный привод|4wd|awd/i.test(t))f.drive='Полный';
 if(input.fuel)f.fuel=input.fuel;else if(/электро/i.test(t))f.fuel='Электро';
 if(input.transmission)f.transmission=input.transmission;
 if(input.seats)f.minSeats=input.seats;
 if(input.minPower)f.minPower=input.minPower;
 return f;
}
export function clarifyingQuestions(r:Requirements){const t=r.text.trim().toLocaleLowerCase();if(t.length<28||/^(хочу|нужна|нужен)\s+(хорошую|хороший|машину|автомобиль)[.!\s]*$/.test(t))return ['Какой у вас бюджет?','Рассматриваете новый автомобиль или с пробегом?','Для каких поездок нужна машина?','Нужен ли полный привод?','Сколько человек обычно ездит?'];return []}
