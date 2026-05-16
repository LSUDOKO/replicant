'use client';
import * as React from 'react';
import Image from 'next/image';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import Link from 'next/link';

export function Header() {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);

	const links = [
		{
			label: 'Genesis',
			href: '/dashboard/genesis',
		},
		{
			label: 'Marketplace',
			href: '/dashboard/marketplace',
		},
		{
			label: 'Evolution',
			href: '/dashboard/evolution',
		},
        {
			label: 'Species Tree',
			href: '/dashboard/tree',
		},
        {
			label: 'Dashboard',
			href: '/dashboard',
		},
	];

	React.useEffect(() => {
		if (open) {
			// Disable scroll
			document.body.style.overflow = 'hidden';
		} else {
			// Re-enable scroll
			document.body.style.overflow = '';
		}

		// Cleanup when component unmounts (important for Next.js)
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn(
				'fixed top-0 left-0 right-0 z-50 mx-auto w-full border-b border-transparent transition-all duration-500 ease-out',
				{
					'glass-refraction md:top-6 md:max-w-6xl md:rounded-full md:shadow-2xl':
						scrolled && !open,
					'bg-background/95 backdrop-blur-xl': open,
				},
			)}
		>
			<nav
				className={cn(
					'flex h-20 w-full items-center justify-between px-8 md:h-16 md:transition-all md:duration-500 md:ease-out',
					{
						'md:px-6': scrolled,
					},
				)}
			>
                <Link href="/" className="flex items-center gap-3 active-press">
                    <div className="relative h-10 w-30 overflow-hidden">
                        <Image
                            src="/logomain.png"
                            alt="Replicant"
                            fill
                            priority
                            sizes="120px"
                            className="object-contain object-left"
                        />
                    </div>
                    <span className="text-lg font-bold tracking-tighter uppercase text-white">REPLICANT</span>
                </Link>

				<div className="hidden items-center gap-2 md:flex">
					{links.map((link, i) => (
						<Link key={i} className={buttonVariants({ variant: 'ghost', className: 'active-press' })} href={link.href}>
							{link.label}
						</Link>
					))}
					<Link href="/dashboard" className={buttonVariants({ variant: 'default', className: 'active-press glow-violet ml-2' })}>
                        Launch App
                    </Link>
				</div>
				<Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden active-press">
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</nav>

			<div
				className={cn(
					'bg-background/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden',
					open ? 'block' : 'hidden',
				)}
			>
				<div
					data-slot={open ? 'open' : 'closed'}
					className={cn(
						'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
						'flex h-full w-full flex-col justify-between gap-y-2 p-6',
					)}
				>
					<div className="grid gap-y-2">
						{links.map((link) => (
							<Link
								key={link.label}
								className={buttonVariants({
									variant: 'ghost',
									className: 'justify-start',
								})}
								href={link.href}
								onClick={() => setOpen(false)}
							>
								{link.label}
							</Link>
						))}
					</div>
					<div className="flex flex-col gap-2">
						<Link href="/dashboard" className={buttonVariants({ variant: 'default', className: 'w-full' })} onClick={() => setOpen(false)}>
							Launch App
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
