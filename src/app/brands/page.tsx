import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {brands} from '@/data/brands';
export const metadata={title:'Марки автомобилей'};
export default function Brands(){const countries=[...new Set(brands.map(b=>b.country))];return <div className="container page-pad"><span className="eyebrow accent">СПРАВОЧНИК / {brands.length} МАРОК</span><h1>Марки автомобилей</h1><p className="page-intro">От классических российских моделей до современных электромобилей. Выберите производителя, чтобы изучить его модельный ряд.</p>{countries.map(country=><section className="brand-country" key={country}><h2>{country}</h2><div className="brand-grid">{brands.filter(b=>b.country===country).map(b=><Link href={`/brands/${b.slug}`} key={b.slug}><strong>{b.name}</strong><span>{b.models.length} моделей <ArrowUpRight size={17}/></span></Link>)}</div></section>)}</div>}
