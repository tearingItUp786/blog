import Toggle from "~/components/theme-toggle";
import { H1, H2, H3, H4 } from "~/components/typography";

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <H1>Welcome to my world</H1>
      <H2>Sup</H2>
      <H3>Sub Header-blogs H3</H3>
      <H4>blog title - sub title</H4>
      <Toggle />
      <ul>
        <li className="text-pink">
          <a
            target="_blank"
            href="https://remix.run/tutorials/blog"
            rel="noreferrer"
          >
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/tutorials/jokes"
            rel="noreferrer"
          >
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
    </div>
  );
}
