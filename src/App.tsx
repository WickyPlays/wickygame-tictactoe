import "./App.scss";
import { Route, Routes } from "react-router-dom";
import PageTitle from "./pages/title/PageTitle";
import PageGame from "./pages/game/PageGame";

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<PageTitle />} />
        <Route path="/game" element={<PageGame />} />
      </Routes>
    </div>
  );
}
