import React from "react";

type Props = {
  children: React.ReactNode;
};

export const Debug = ({ children }: Props) => {
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);

  if (!searchParams.has("debug")) {
    return null;
  }
  return <div>{children}</div>;
};
