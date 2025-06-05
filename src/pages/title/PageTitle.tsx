import { useState, useEffect, useRef } from "react";
import { MdInfo, MdClose } from "react-icons/md";
import "./PageTitle.scss";
import PageTitleBackground from "./PageTitleBackground";
import { getCookie, setCookie } from "../../utils/util_cookie";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { GrGithub } from "react-icons/gr";

export default function PageTitle() {
  const [tileNumber, setTileNumber] = useState<number>(3);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTileNumber = getCookie("tileNumber");
    if (
      savedTileNumber &&
      !isNaN(parseInt(savedTileNumber)) &&
      parseInt(savedTileNumber) >= 3 &&
      parseInt(savedTileNumber) <= 10
    ) {
      setTileNumber(parseInt(savedTileNumber));
    }
    setMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        setShowInfo(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div className={`page-title ${mounted ? "mounted" : ""}`}>
      <PageTitleBackground />
      <div className="text-container">
        <div className="title-container">
          <img src={logo} alt="Logo" className="logo" />
          <h1 className="main-title">Tic-Tac-Toe</h1>
          <p className="subtitle">A creation by Wicky</p>
        </div>
        <Link to="/game">
          <button className="play-button">Play Now</button>
        </Link>
      </div>
      <div className="footer">
        <div className="footer-left">
          <GrGithub />
          <p>
            <a href="https://github.com/WickyPlays/wickygame-tictactoe" target="_blank">
              Github
            </a>
          </p>
        </div>
        <>
          <a href="https://ko-fi.com/Wicky">Consider donating via my ko.fi!</a>
        </>
      </div>
    </div>
  );
}
