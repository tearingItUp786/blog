import { BigStar } from './big-star'
import { InnerCircle } from './circle/inner-circle'
import { OuterCircle } from './circle/outer-circle'
import { LastName } from './last-name'
import { LineSvg } from './line'
import { MoonOrSun } from './moon-or-sun'
import { NameGroup } from './name-group'
import { Slogan } from './slogan'
import Sparkles from './sparkles'

export const HomepageHero = () => {
	/**
	 * Because I'm using the theme hook, which is client based
	 * when I render this on the server side, the imgs don't get included in the initial html
	 * need to look into client hints
	 */
	const theme: any = 'light'

	return (
		<div className="relative mx-auto min-h-svh max-w-(--breakpoint-xl)">
			<Sparkles
				id="sparkles"
				className="absolute top-[50%] left-[50%] w-[50%] min-w-[500px]"
			/>
			<NameGroup className="absolute top-[45%] left-0 hidden w-[200px] translate-x-1/2 -translate-y-1/2 lg:block" />
			<LastName className="absolute top-[75%] right-[60%] hidden w-[200px] -translate-x-1/2 lg:block" />
			<Slogan className="absolute top-[45%] right-[20%] hidden w-[150px] lg:block" />
			<div className="absolute top-1/2 left-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-[55%]">
				<div className="grid place-items-center">
					<OuterCircle />
					<InnerCircle className="mt-[-100%] scale-[.9] transition-transform dark:scale-[.75]" />
				</div>
				<div className="absolute -top-[20%] left-[15%] max-w-[200px]">
					{theme === 'light' ? (
						<img
							fetchPriority="high"
							alt="A lords of the rings style tree"
							src="/images/middleD/light-middleD.svg"
							className="animate-[fadeIn_forwards_.5s_.5s] opacity-0 dark:hidden"
						/>
					) : null}
					{theme === 'dark' ? (
						<img
							fetchPriority="high"
							alt="A lords of the rings style tree"
							src="/images/middleD/dark-middleD.svg"
							className="hidden animate-[fadeIn_forwards_.5s_.5s] opacity-0 dark:block"
						/>
					) : null}
				</div>
				<div className="absolute bottom-0 left-1/4 flex -translate-x-1/2">
					{theme === 'light' ? (
						<img
							alt="lord of the rings style left tree"
							src="/images/leftD/light-leftD.svg"
							className="max-w-[65%] animate-[fadeIn_forwards_.5s_1s] opacity-0 dark:hidden"
						/>
					) : null}
					{theme === 'dark' ? (
						<img
							src="/images/leftD/dark-leftD.svg"
							alt="lord of the rings style left tree"
							className="hidden max-w-[65%] animate-[fadeIn_forwards_.5s_1s] opacity-0 dark:block"
						/>
					) : null}
				</div>
				<div className="absolute -bottom-10 left-2/3 flex">
					{theme === 'light' ? (
						<img
							src="/images/rightD/light-rightD.svg"
							alt="lord of the rings style right tree"
							className="max-w-full animate-[fadeIn_forwards_.5s_1.5s] opacity-0 dark:hidden"
						/>
					) : null}
					{theme === 'dark' ? (
						<img
							src="/images/rightD/dark-rightD.svg"
							alt="lord of the rings style right tree"
							className="hidden max-w-full animate-[fadeIn_forwards_.5s_1.5s] opacity-0 dark:block"
						/>
					) : null}
				</div>
			</div>
			<MoonOrSun className="absolute top-[50px] right-[30%] hidden w-[150px] translate-x-[50%] animate-[fadeIn_forwards_1s_2.75s] opacity-0 lg:block" />
			{/* Star stuff */}
			<BigStar className="absolute bottom-0 max-w-[100px] animate-[sparkle_infinite_4s_2s] opacity-0 transition-all" />
			<BigStar className="absolute right-[10%] bottom-0 max-w-[75px] animate-[sparkle_infinite_4s_1.5s] opacity-0 transition-all" />
			<BigStar className="absolute top-0 right-[5%] max-w-[75px] animate-[sparkle_infinite_5s_1.5s] opacity-0 transition-all" />

			{/* Left Side */}
			<LineSvg id="line" className="absolute left-0 h-32 w-4" />
			<LineSvg id="line" className="absolute top-12 left-4 h-32 w-4" />
			<LineSvg id="line" className="absolute top-4 left-8 h-32 w-4" />

			<BigStar className="absolute top-0 left-[5%] max-w-[75px] animate-[sparkle_infinite_5s_1.5s] opacity-0 transition-all" />
			<BigStar className="absolute top-[10%] left-[10%] max-w-[40px] animate-[sparkle_infinite_4s_1.5s] opacity-0 transition-all" />

			{/* Right Side line */}
			<LineSvg id="line" className="absolute right-4 -bottom-16 h-32 w-4" />
			<LineSvg id="line" className="absolute right-8 bottom-0 h-32 w-4" />
			<LineSvg id="line" className="absolute right-12 bottom-16 h-32 w-4" />
		</div>
	)
}
