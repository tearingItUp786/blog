import lightMiddleD from './middleD/light-middleD.svg'
import darkMiddleD from './middleD/dark-middleD.svg'
import lightLeftD from './leftD/light-leftD.svg'
import darkLeftD from './leftD/dark-leftD.svg'
import lightRightD from './rightD/light-rightD.svg'
import darkRightD from './rightD/dark-rightD.svg'

import {OuterCircle} from './circle/outer-circle'
import {InnerCircle} from './circle/inner-circle'
import {BigStar} from './big-star'
import {LineSvg} from './line'
import Sparkles from './sparkles'
import {MoonOrSun} from './moon-or-sun'
import {NameGroup} from './name-group'
import {LastName} from './last-name'
import {Slogan} from './slogan'
import {useTheme} from '~/utils/theme-provider'

export const HomepageHero = () => {
  /**
   * Because I'm using the theme hook, which is client based
   * when I render this on the server side, the imgs don't get included in the initial html
   * need to look into client hints
   */
  const [theme] = useTheme()
  return (
    <div className="relative mx-auto min-h-svh max-w-screen-xl">
      <div className="">
        <Sparkles
          id="sparkles"
          className="absolute left-[50%] top-[50%] w-[50%] min-w-[500px] "
        />
      </div>
      <NameGroup className="absolute left-0 top-[45%] hidden w-[200px] -translate-y-1/2 translate-x-1/2 lg:block" />
      <LastName className="absolute right-[60%] top-[75%] hidden w-[200px] -translate-x-1/2 lg:block" />
      <Slogan className="absolute right-[20%] top-[45%] hidden w-[150px] lg:block" />
      <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-[55%]">
        <div className="grid place-items-center">
          <OuterCircle />
          <InnerCircle className="mt-[-100%] scale-[.9] transition-transform dark:scale-[.75]" />
        </div>
        <div className="absolute -top-[20%] left-[15%] max-w-[200px]">
          {theme === 'light' ? (
            <img
              fetchpriority="high"
              alt="A lords of the rings style tree"
              src={lightMiddleD}
              className="animate-[fadeIn_forwards_.5s_.5s] opacity-0 dark:hidden"
            />
          ) : null}
          {theme === 'dark' ? (
            <img
              fetchpriority="high"
              alt="A lords of the rings style tree"
              src={darkMiddleD}
              className="hidden animate-[fadeIn_forwards_.5s_.5s] opacity-0 dark:block"
            />
          ) : null}
        </div>
        <div className="absolute bottom-0 left-1/4 flex -translate-x-1/2">
          {theme === 'light' ? (
            <img
              alt="lord of the rings style left tree"
              src={lightLeftD}
              className="max-w-[65%] animate-[fadeIn_forwards_.5s_1s] opacity-0 dark:hidden"
            />
          ) : null}
          {theme === 'dark' ? (
            <img
              src={darkLeftD}
              alt="lord of the rings style left tree"
              className="hidden max-w-[65%] animate-[fadeIn_forwards_.5s_1s] opacity-0 dark:block"
            />
          ) : null}
        </div>
        <div className="absolute -bottom-10 left-2/3 flex">
          {theme === 'light' ? (
            <img
              src={lightRightD}
              alt="lord of the rings style right tree"
              className="max-w-full animate-[fadeIn_forwards_.5s_1.5s] opacity-0 dark:hidden"
            />
          ) : null}
          {theme === 'dark' ? (
            <img
              src={darkRightD}
              alt="lord of the rings style right tree"
              className="hidden max-w-full animate-[fadeIn_forwards_.5s_1.5s] opacity-0 dark:block"
            />
          ) : null}
        </div>
      </div>
      <MoonOrSun
        className="
      absolute right-[30%] top-[50px] hidden w-[150px] 
      translate-x-[50%] animate-[fadeIn_forwards_1s_2.75s] 
      opacity-0 lg:block"
      />
      {/* Star stuff */}
      <BigStar className=" absolute bottom-0 max-w-[100px]  animate-[sparkle_infinite_4s_2s] opacity-0 transition-all" />
      <BigStar className=" absolute bottom-0 right-[10%] max-w-[75px]  animate-[sparkle_infinite_4s_1.5s]  opacity-0 transition-all" />
      <BigStar className=" absolute right-[5%] top-0 max-w-[75px]  animate-[sparkle_infinite_5s_1.5s]  opacity-0 transition-all" />

      {/* Left Side */}
      <LineSvg id="line" className="absolute left-0 h-32 w-4" />
      <LineSvg id="line" className="absolute left-4 top-12 h-32 w-4" />
      <LineSvg id="line" className="absolute left-8 top-4 h-32 w-4" />

      <BigStar className=" absolute left-[5%] top-0 max-w-[75px] animate-[sparkle_infinite_5s_1.5s] opacity-0 transition-all" />
      <BigStar className=" absolute left-[10%] top-[10%] max-w-[40px] animate-[sparkle_infinite_4s_1.5s] opacity-0  transition-all" />

      {/* Right Side line */}
      <LineSvg id="line" className="absolute -bottom-16 right-4 h-32 w-4" />
      <LineSvg id="line" className="absolute bottom-0 right-8 h-32 w-4" />
      <LineSvg id="line" className="absolute bottom-16 right-12 h-32 w-4" />
    </div>
  )
}
