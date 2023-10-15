import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
{
  /* {!!isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} />}
          {!!error && <Error message={error} />} */
}
