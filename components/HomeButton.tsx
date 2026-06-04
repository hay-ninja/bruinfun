'use client'
import Link from 'next/link';
import Image from 'next/image'


export default function HomeButton(){
    return (
        <Link href="/" aria-label="Go to Homepage">
            <Image 
                src="/header/BruinFun.png"
                width={128}
                height={80}
                alt="BruinFun Home"
                className="cursor-pointer hover:opacity-80 transition-opacity"
            />
        </Link>
    )
}