import type { HTMLAttributes } from "react";

/**
 * Shared centered content container for homepage sections: a 1440px maximum
 * width with responsive side padding. Everything inside a section that uses it
 * shares the same left and right edges.
 */
const SectionContainer = ({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 ${className}`} {...rest} />
);

export default SectionContainer;
