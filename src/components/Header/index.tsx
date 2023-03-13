import React from "react";
import SignInButton from "./SignInButton";
import styles from "./styles.module.scss";
import Link from "next/link";
import { useRouter } from "next/router";
import { ActiveLink } from "../ActiveLink";
export default function Header(props) {
  return (
    <>
      <header className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <img src="/images/logo.svg" alt="Logo Ig.News" />
          <nav>
            <ActiveLink activeClass={styles.active} href="/">
              <a>Home</a>
            </ActiveLink>
            <ActiveLink activeClass={styles.active} href="/posts">
              <a>Posts</a>
            </ActiveLink>
          </nav>
          <SignInButton />
        </div>
      </header>
    </>
  );
}
