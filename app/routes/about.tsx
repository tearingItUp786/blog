import { Cloudinary } from "@cloudinary/url-gen";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { scale } from "@cloudinary/url-gen/actions/resize";

import {
  BlockQuote,
  H3,
  H4,
  ShortQuote,
  TextLink,
} from "~/components/typography";
// import { max } from "@cloudinary/url-gen/actions/roundCorners";
import Hero from "~/components/hero";
import clsx from "clsx";
import {
  LotrIcon,
  BeltIcon,
  BookIcon,
  PaletteIcon,
} from "~/components/about/icons";

const RandomThing = ({
  title,
  description,
  className,
  titleClassName,
  icon,
}: {
  title: string;
  description: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}) => {
  return (
    <div
      className={clsx(
        className,
        "w-full p-8 border-solid border border-gray-300 dark:border-white "
      )}
    >
      {icon ? (
        <div
          className="
        first:fill-gray-300 
        first:dark:fill-white
         max-w-[40px] mb-4"
        >
          {icon}
        </div>
      ) : null}
      <H4 className={clsx(titleClassName, "mb-4")}>{title}</H4>
      <p className="max-w-md">{description}</p>
    </div>
  );
};

export async function loader() {
  let cld = new Cloudinary({
    cloud: {
      cloudName: "dinypqsgl",
    },
  });

  let desktopImage = cld.image("blog/hero").resize(scale().width(800));
  let mobileImage = cld
    .image("blog/hero")
    .resize(scale().width(500).height(500));

  return json({
    desktopImage: desktopImage.toURL(),
    mobileImage: mobileImage.toURL(),
  });
}

// need to fetch all content from the blog directory using github api
export default function About() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="page-container">
      <div className="max-w-full ml-[10vw] mr-[10vw] xl:mx-auto">
        <Hero />
        <BlockQuote className="mt-8 max-w-5xl mx-auto" author="David Goggins">
          The only way that you’re ever going to get to the other side of this
          journey is by suffering. You have to suffer in order to grow. Some
          people get it, some people don’t.
        </BlockQuote>
        <p
          className="
          pt-6
          mt-6
          relative 
          before:content-['']
          before:h-[1px]
          before:left-[50%]
          before:-translate-x-1/2
          before:w-[200px]
          before:bg-gray-100
          before:absolute
          before:top-0
        "
        >
          Hey there, thanks for stopping by. I'm a self-taught software engineer
          with over six years of experience based and I am based out of
          Vancouver, Canada. I've got a passion for Typescript in both the
          Frontend and the Backend. If you'd like to hear about how I went from
          being a man with a Bachelor's degree in Business Administration to a
          Software Engineer, feel free to reach out to me on{" "}
          <TextLink href="https://twitter.com/tearingItUp786">twitter</TextLink>
          ; I'd be more than happy to walk you through my journey.
        </p>
        <H3>Start with why</H3>
        <p>
          My <span className="text-accent">why?</span> I want to improve the
          lives of all those who come across my path.
        </p>
        <p>
          I don't want to go into why I started this website; I am sure that you
          can ascertain my motivations (staying up-to-date on my skills, fun,
          etc). If I had to distill it down to a single point, however, it is
          that I want to be able to share my knowledge with the world. There are
          thousands upon thousands of these websites that have been created by
          thousands of amazing developers, many of whom are much better than I
          at software development. However, I strive to go beyond just software
          development; I want to provide a place to distribute as much knowledge
          as I can on a myriad of topics. That's why this is the home for{" "}
          <strong>"mostly"</strong> my developer thoughts; I've given myself
          room to take the conversation elsewhere.
        </p>

        <div
          className="md:mx-auto 
        ml-0
        md:max-w-6xl 
        md:ml-6 
        max-w-4xl 
        my-8 flex flex-wrap 
        lg:flex-nowrap 
        items-center
        justify-center
        lg:justify-start
        "
        >
          <img
            alt="Me looking very handsome"
            className="max-w-full lg:max-w-[400px]"
            sizes="(max-width: 600px) 500px, 300px"
            srcSet={`${data.mobileImage} 500w, ${data.desktopImage} 300w`}
            src={data.desktopImage}
          />
          <BlockQuote
            author="Les Brown"
            className="lg:ml-6 mx-auto mt-6 lg:mt-0 "
          >
            If you do what is easy, your life will be hard. If you do what is
            hard, your life will be easy.
          </BlockQuote>
        </div>
        <H3>Some of my core values</H3>
        <p>The following are some of my guiding principles</p>
        <div className="mb-8">
          <H4>Effort</H4>
          <ShortQuote author="Andrew D. Huberman">
            And my definition of greatness is anyone that’s making that effort,
            even in a tiny way, just to take this incredible machinery that we
            were given — this nervous system — and to leverage it toward being
            better, feeling better, and showing up better for other people
          </ShortQuote>
          <p className="text-accent text-xl">
            Nothing gets done unless you're putting in the work.
          </p>
        </div>
        <div className="block lg:flex lg:justify-between">
          <div className="w-full lg:w-[46%]">
            <H4>Accountability</H4>
            <ShortQuote author="Paramjit Singh Bains (My Father)">
              You lift the first foot and God will lift the second. Remember
              though, that you have to lift the first foot, then and only then
              will God lift the second.
            </ShortQuote>
            <p>
              I've learned many things from my old man, but this is one of the
              most important lessons that I've learned from him. No matter where
              you end up, no matter what you do, you are directly responsible
              for how you respond and how you move forward. I choose to move
              forward with the best intentions in my heart and I will always
              take responsibility for the decisions and choices I make.
            </p>
          </div>
          <div className="w-full lg:w-[46%]">
            <H4>Collarborate</H4>
            <ShortQuote author="Unknown">
              If you want to go fast, go alone. If you want to go far, go
              together.
            </ShortQuote>
            <p>
              While working solo has its benefits, I've found some of the
              greatest work I've done in my career was produced, in part, thanks
              to effective collaboration. I've been fortunate enough to work
              with some amazing folks over the years and I've learned a lot from
              them. Designers, engineers, product owners, etc. I've learned from
              each and every one of them. No one can have all the answers...
              that's why we work together with folks! Two heads are better than
              one.
            </p>
          </div>
        </div>
        <div className="mt-12">
          <H3>Details about me you'd probably never guess</H3>
          <div className="mt-8 lg:grid lg:grid-cols-2 lg:grid-rows-2 gap-y-12 gap-x-16">
            <RandomThing
              title="I'm a huge fan of Lord of the Rings (LOTR)"
              description="From its deeply intricate lore, to the amazing stories of brotherhood and love, I love it all. 
              Also, the fact that Tolkein wrote LOTR to help him process his PTSD from the Vietnam war adds another layer of depth
              and value to his legacy ❤️ "
              icon={<LotrIcon />}
            />
            <RandomThing
              icon={<PaletteIcon />}
              className="border-accent dark:border-accent"
              titleClassName="text-accent dark:text-accent"
              title="My favourite colour is pink"
              description="I mean, since you're on my site, you've probably already guessed that, yeah, I like pink. The color; not the artist. 😆"
            />
            <RandomThing
              icon={<BeltIcon />}
              title="I love Brazilian jiu-jitsu"
              description="While injures have precluded me from actively engaging in the sport, 2023 is my comeback year. It's about time I got my blackbelt... its been long enough — 16 years on and off and still a blue!🥋"
            />
            <RandomThing
              icon={<BookIcon />}
              title="I'm a published poet"
              description={
                <>
                  There was a time where I'd spend my spare moments writing
                  Shakespearean sonnets. I've since moved on to writing awesome
                  blog posts but if you'd like to read my only published work{" "}
                  <TextLink href="https://res.cloudinary.com/dinypqsgl/image/upload/v1676432698/Poem2015.docx_sb0xkh.pdf">
                    you can find it here
                  </TextLink>{" "}
                  🪶
                </>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
