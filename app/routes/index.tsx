import { scale } from "@cloudinary/url-gen/actions/resize";
import { json } from "@remix-run/node";
import { useLoaderData } from "react-router";
import { H1, H2, H3, H4 } from "~/components/typography";
import { cloudinaryInstance } from "~/utils/cloudinary";

export async function loader() {
  let hero = cloudinaryInstance.image("blog/lion");
  let mobileHero = cloudinaryInstance
    .image("blog/lion")
    .resize(scale().width(800));

  return json({
    hero: hero.toURL(),
    mobileHero: mobileHero.toURL(),
  });
}

export default function Index() {
  const { hero } = useLoaderData<typeof loader>();
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
      bg-fixed
      bg-contain
      bg-no-repeat
     `}
      >
        <article className="absolute top-[50%] left-[50%] z-[2] translate-x-[-50%] translate-y-[-55%]">
          <H1 className="leading-[1.1] md:text-[5rem] text-body">
            Taran Bains
          </H1>
          <H2 className="text-center leading-tight px-2 md:text-[3.5rem] dark:bg-accent uppercase bg-gray-100 text-white">
            Tearing it up
          </H2>
          <H1 className="md:text-[2.5rem] leading-[1.5] text-body">
            Like his life depends on it
          </H1>
        </article>
      </div>
    </div>
  );
}
