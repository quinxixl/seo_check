import React from "react";
import "./assets/styles/base.scss";
import "./App.scss";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import AppRouter from "./routing/AppRouter.jsx";

const App = () => (
  <div className="App">
    <Header />
    <main>
      <AppRouter />
    </main>
    <Footer />
  </div>
);

export default App;
