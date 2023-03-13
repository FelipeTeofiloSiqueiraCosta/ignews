import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import Reactm, { cloneElement } from "react";

interface ActiveLinkProps extends LinkProps {
  children: React.ReactElement;
  activeClass: string;
}

export function ActiveLink({
  children,
  activeClass,
  ...props
}: ActiveLinkProps) {
  const { asPath, pathname } = useRouter();

  const className = asPath === props.href ? activeClass : "";

  return (
    <Link {...props}>{cloneElement(children, { className: className })}</Link>
  );
}
