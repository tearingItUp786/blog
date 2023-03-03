import {scale} from '@cloudinary/url-gen/actions/resize'
import {json} from '@remix-run/node'
import {H1, H2} from '~/components/typography'
import {cloudinaryInstance} from '~/utils/cloudinary'

export async function loader() {
  let hero = cloudinaryInstance.image('blog/lion')
  let mobileHero = cloudinaryInstance
    .image('blog/lion')
    .resize(scale().width(800))

  return json({
    hero: hero.toURL(),
    mobileHero: mobileHero.toURL(),
  })
}

export default function Index() {
  return (
    <div>
      <div
        style={{
          // backgroundImage: `url(${String(hero)})`,
          // boxShadow: "inset 0 0 0 2000px rgb(0 0 0 / 61%)",
          height: `calc(100vh - 63.5px)`,
        }}
        className={`
      relative 
      overflow-hidden
      bg-contain
      bg-fixed
      bg-no-repeat
     `}
      >
        <article className="absolute top-[50%] left-[50%] z-[2] translate-x-[-50%] translate-y-[-55%]">
          <H1 className="text-body leading-[1.1] md:text-[5rem]">
            Taran Bains
          </H1>
          <H2 className="bg-gray-100 px-2 text-center uppercase leading-tight text-white dark:bg-accent md:text-[3.5rem]">
            Tearing it up
          </H2>
          <H1 className="text-body leading-[1.5] md:text-[2.5rem]">
            Like his life depends on it
          </H1>
        </article>
      </div>
    </div>
  )
}
