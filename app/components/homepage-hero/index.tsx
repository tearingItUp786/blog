import middleD from './middleD.svg'
import leftD from './leftD.svg'
import rightD from './rightD.svg'

// import outer from './circle/outer-circle.svg'
// import inner from './circle/inner-circle.svg'

import {OuterCircle} from './circle/outer-circle'
import {InnerCircle} from './circle/inner-circle'

export const HomepageHero = () => {
  return (
    <div className="relative min-h-full">
      <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-[55%]">
        <div className="grid place-items-center">
          <OuterCircle />
          <InnerCircle className="mt-[-100%] scale-[.8]" />
        </div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <img src={middleD} className="max-w-1/2" />
        </div>
        <div className="absolute bottom-10 left-1/3 flex -translate-x-1/2">
          <img src={leftD} className="max-w-[50%]" />
        </div>
        <div className="absolute bottom-0 left-2/3 flex">
          <img src={rightD} className="max-w-[50%]" />
        </div>
      </div>
    </div>
  )
}
