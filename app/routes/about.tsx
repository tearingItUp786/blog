import { Cloudinary } from "@cloudinary/url-gen";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { crop } from "@cloudinary/url-gen/actions/resize";
import { focusOn } from "@cloudinary/url-gen/qualifiers/gravity";
import { FocusOn } from "@cloudinary/url-gen/qualifiers/focusOn";

import { BlockQuote } from "~/components/typography";
import { max } from "@cloudinary/url-gen/actions/roundCorners";
import Hero from "~/components/hero";

export async function loader() {
  let cld = new Cloudinary({
    cloud: {
      cloudName: "dinypqsgl",
    },
  });

  let myImage = cld.image("blog/taran");

  let desktopImage = myImage.resize(
    crop().width(400).height(500).gravity(focusOn(FocusOn.face()))
  );

  let mobileImage = myImage.resize(crop().width(500).height(500));
  return json({
    desktopImage: desktopImage.toURL(),
    mobileImage: mobileImage.toURL(),
  });
}

// need to fetch all content from the blog directory using github api
export default function About() {
  const data = useLoaderData<typeof loader>();
  console.log("wtf", data);
  return (
    <div className="page-container">
      <div className="max-w-full ml-[10vw] mr-[10vw] xl:mx-auto">
        <Hero />
        <BlockQuote
          className="mt-8 max-w-5xl mx-auto"
          author="David Goggins"
          authorClassName="text-right text-lg"
        >
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
          Taranveer Bains or Taran "tearing it up" Bains, as he likes to be
          called, is a Frontend Developer who has had the pleasure of working
          with some of the best digital agencies in Vancouver. He's worked on a
          variety of projects for companies such as BC Hydro, MasterCard, and
          Digital Asset. 1 part techie, 1 part business, and 100% dedicated to
          his craft and the communities he belongs to. Dedicated to solving
          difficult problems and belonging to teams that not only create the
          environment for great work to be done, but also inspire their team
          members/employees to be legendary.
        </p>

        <p>
          At his core, Taran loves a challenge. He believes in doing something
          that sucks everyday. Whether that's running 2 miles, doing a hike in a
          torrential downpour, or, if running two miles is no longer
          uncomfortable, picking up a skipping rope and working on some new
          skipping technique. By not allowing the mind to become overly
          comfortable in a simple fe, we will be able to test how far we really
          can go and do things that seem impossible to the normal person. Become
          more of yourself, <strong>every damn day</strong>.
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
            sizes="(max-width: 600px) 500px, 300px"
            srcSet={`${data.mobileImage} 500w, ${data.desktopImage} 300w`}
            src={data.desktopImage}
          />
          <BlockQuote
            author="Les Brown"
            authorClassName="text-right text-lg"
            className="ml-6 mx-auto mt-6 lg:mt-0 "
          >
            If you do what is easy, your life will be hard. If you do what is
            hard, your life will be easy.
          </BlockQuote>
        </div>
      </div>
    </div>
  );
}
