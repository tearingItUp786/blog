import middleD from './middleD.svg'
import leftD from './leftD.svg'
import rightD from './rightD.svg'

// import outer from './circle/outer-circle.svg'
// import inner from './circle/inner-circle.svg'

import {OuterCircle} from './circle/outer-circle'
import {InnerCircle} from './circle/inner-circle'
import {BigStar} from './big-star'
import {LineSvg} from './line'
import Sparkles from './sparkles'
import {MoonOrSun} from './moon-or-sun'
import {NameGroup} from './name-group'
import {LastName} from './last-name'
import {Slogan} from './slogan'

export const HomepageHero = () => {
  return (
    <div className="relative mx-auto min-h-full max-w-screen-xl">
      <div
        className="
        opacity-0
        transition-all
        dark:opacity-100
        dark:delay-500
        dark:duration-1000
        "
      >
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
          <InnerCircle className="mt-[-100%] scale-[.75]" />
        </div>
        <div className="absolute -top-[20%] left-[15%] max-w-[200px]">
          <img
            src={middleD}
            className="animate-[fadeIn_forwards_1s_2s] opacity-0"
          />
        </div>
        <div className="absolute bottom-0 left-1/4 flex -translate-x-1/2">
          <img
            src={leftD}
            className=" max-w-[65%] animate-[fadeIn_forwards_1s_2.5s] opacity-0"
          />
        </div>
        <div className="absolute -bottom-10 left-2/3 flex">
          <img
            src={rightD}
            className="max-w-full animate-[fadeIn_forwards_1s_3s] opacity-0"
          />
        </div>
      </div>
      <MoonOrSun className="absolute right-[30%] top-[50px] hidden w-[150px] translate-x-[50%] animate-[fadeIn_forwards_1s_3.75s] opacity-0 lg:block" />
      {/* Star stuff */}
      <BigStar className=" absolute bottom-0 max-w-[100px]  opacity-0 transition-all dark:animate-[sparkle_infinite_4s_2s]" />
      <BigStar className=" absolute bottom-0 right-[10%] max-w-[75px]  opacity-0  transition-all dark:animate-[sparkle_infinite_4s_1.5s]" />
      <BigStar className=" absolute right-[5%] top-0 max-w-[75px]  opacity-0  transition-all dark:animate-[sparkle_infinite_5s_1.5s]" />

      {/* Left Side */}
      <LineSvg id="line" className="absolute left-0 h-32 w-4" />
      <LineSvg id="line" className="absolute left-4 top-12 h-32 w-4" />
      <LineSvg id="line" className="absolute left-8 top-4 h-32 w-4" />

      <BigStar className=" absolute left-[5%] top-0 max-w-[75px] opacity-0 transition-all dark:animate-[sparkle_infinite_5s_1.5s]" />
      <BigStar className=" absolute left-[10%] top-[10%] max-w-[40px] opacity-0 transition-all  dark:animate-[sparkle_infinite_4s_1.5s]" />

      {/* Right Side line */}
      <LineSvg id="line" className="absolute -bottom-16 right-4 h-32 w-4" />
      <LineSvg id="line" className="absolute bottom-0 right-8 h-32 w-4" />
      <LineSvg id="line" className="absolute bottom-16 right-12 h-32 w-4" />
    </div>
  )
}
