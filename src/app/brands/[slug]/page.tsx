import Link from 'next/link';
import {notFound} from 'next/navigation';
import {brandBySlug} from '@/data/brands';
import {carRepository} from '@/services/car-repository';
import {CarCard} from '@/components/car-card';
import {slug} from '@/lib/slug';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const b=brandBySlug.get((await params).slug);if(!b)notFound();return {title:`${b.name} — модели и поколения`}}
export default async function BrandPage({params}:{params:Promise<{slug:string}>}){const b=brandBySlug.get((await params).slug);if(!b)notFound();const cars=carRepository.search({brand:b.slug,pageSize:12}).items;return <div className="container page-pad"><div className="breadcrumbs"><Link href="/brands">Марки</Link><span>/</span>{b.name}</div><span className="eyebrow accent">{b.country.toUpperCase()} / ПРОИЗВОДИТЕЛЬ</span><h1>{b.name}</h1><p className="page-intro">{b.models.length} моделей в каталоге. Выберите модель или откройте каталог с фильтром по марке.</p><Link className="button button-primary" href={`/catalog?brand=${b.slug}`}>Все автомобили {b.name} →</Link><section className="section"><div className="section-head"><div><span className="eyebrow accent">МОДЕЛЬНЫЙ РЯД</span><h2>Модели {b.name}</h2></div></div><div className="model-list">{b.models.map(m=><Link href={`/cars/${b.slug}/${slug(m)}`} key={m}>{m}<span>↗</span></Link>)}</div></section><section className="section"><h2>В каталоге</h2><div className="cards-grid">{cars.slice(0,4).map(c=><CarCard car={c} key={c.id}/>)}</div></section></div>}
