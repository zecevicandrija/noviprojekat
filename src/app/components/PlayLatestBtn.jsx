"use client";
import { useState, useEffect } from "react";
import styles from "../page.module.css";

export default function PlayLatestBtn() {
  const [latestUrl, setLatestUrl] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/latest")
      .then((res) => res.json())
      .then((data) => setLatestUrl(data.url));
  }, []);

  if (!latestUrl) return null;

  return (
    <a
      href={latestUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.playBtn}
    >
      ▶ Pusti najnoviju
    </a>
  );
}
