import clsx from "clsx";

const fontSizes = {
  h1: "text-6xl text-gray-100 dark:text-white",
};

type TitleProps = {
  As?: React.ElementType;
  className?: string;
  [key: string]: any;
};

function Title({
  As,
  size,
  className,
  ...rest
}: TitleProps & { size: keyof typeof fontSizes }) {
  const Tag = As ?? size;
  return <Tag className={clsx(fontSizes[size])} {...rest} />;
}

const H1 = (props: TitleProps) => {
  return <Title {...props} size="h1" />;
};

export { H1 };
