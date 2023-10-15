import { useEffect, useRef, useState } from "react";
import "./index.css";
import StarRating from "./stars";
import { useLocalStorage } from "./useLocalStorage";
import { useMovie } from "./useMovie";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "7786b963";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  /////////////////////////////////////////////
  function handleSelectedMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatch(movie) {
    if (watched.some((item) => item.imdbID === movie.imdbID)) return;
    console.log({ movie });
    setWatched((watched) => [...watched, movie]);
    setSelectedId(null);
  }
  function handleDeleteWatchMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  ///////////////////////////////////////////////////
  const [watched, setWatched] = useLocalStorage([], "watched");
  ///////////////////
  const { movies, isLoading, error } = useMovie(query, handleCloseMovie);
  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <>
          {/* {isLoading ? (
            <Loader />
          ) : error ? (
            <Error message={error} />
          ) : (
            <MovieList movies={movies} />
          )} */}
          <Box>
            {!!isLoading && <Loader />}
            {!isLoading && !error && (
              <MovieList selectedMovie={handleSelectedMovie} movies={movies} />
            )}
            {!!error && <Error message={error} />}
          </Box>

          <Box>
            {selectedId ? (
              <MovieDetails
                onCloseMovie={handleCloseMovie}
                onAddWatch={handleAddWatch}
                selectedId={selectedId}
                watched={watched}
              />
            ) : (
              <>
                <WatchedSummary watched={watched} />

                <WatchedMoviesList
                  watched={watched}
                  onDeleteWatch={handleDeleteWatchMovie}
                />
              </>
            )}
          </Box>
        </>
      </Main>
    </>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);
  useKey("Enter", () => {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
      value={query}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}
function Loader() {
  return <p className="loader">Loading...</p>;
}
function Error({ message }) {
  return <p className="error">{message}</p>;
}
/*
function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>

      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </>
      )}
    </div>
  );
}
*/

function MovieList({ movies, selectedMovie }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} selectedMovie={selectedMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, selectedMovie }) {
  return (
    <li onClick={() => selectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatch, watched }) {
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const iswatched = watched.some((item) => item.imdbID === movie.imdbID);
  const userMovieRating = watched.find(
    (item) => item.imdbID === movie.imdbID
  )?.userRating;

  const {
    Title: title,
    Type: type,
    Poster: poster,
    Released: released,
    Plot: plot,
    Actors: actors,
    Director: director,
    Runtime: runtime,
    Genre: genre,
    imdbRating,
  } = movie;
  function hanleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      genre,
      runtime: Number(runtime.split(" ").at(0)),
      imdbRating: Number(imdbRating),
      userRating,
      counterUserRating: counterRef.current,
      poster,
    };

    onAddWatch(newWatchedMovie);
    onCloseMovie();
  }
  const counterRef = useRef(0);
  // useEffect(() => {
  //   counterRef.current = 0;
  // }, [selectedId]);
  ///////////////////////////////
  useEffect(() => {
    if (userRating) counterRef.current++;
  }, [userRating]);
  console.log({ counterRef });
  ////////////////////////////////////
  useEffect(() => {
    async function fetchMovieDetails() {
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      );
      const data = await res.json();

      setMovie(data);
    }
    fetchMovieDetails();
  }, [selectedId]);

  const isTop = imdbRating > 8;
  // console.log({ isTop });

  /////////////////////////
  useKey("Escape", onCloseMovie);
  ////////////////////
  useEffect(() => {
    console.log("before cleanup");
    if (!title) return;
    document.title = title;
    return () => {
      console.log("clean");
      document.title = "usePopCorn";

      console.log(`clean up ${title}`); //title can be printed because closure
    };
  }, [title]);
  if (isLoading) return <Loader />;
  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onCloseMovie}>
          &larr;
        </button>
        <img src={poster} alt="" />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released}&bull;{runtime}
          </p>
          <p>{genre}</p>
          <p>{imdbRating}⭐️ IMBD Rating</p>
        </div>
      </header>
      <section>
        <div className="rating">
          {!iswatched ? (
            <>
              <StarRating
                key={selectedId}
                maxRating={10}
                size={24}
                onSetRating={setUserRating}
                movie={movie}
              />

              {userRating > 0 && (
                <button className="btn-add" onClick={hanleAdd}>
                  +Add to list
                </button>
              )}
            </>
          ) : (
            <p>{`You are already rated this movie  ${userMovieRating}⭐️`}</p>
          )}
        </div>
      </section>
      <p>
        <em>{plot}</em>
      </p>
      <p>Starring {actors}</p>
      <p>Directed By {director}</p>
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie?.userRating));
  const avgRuntime = average(watched.map((movie) => movie?.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(1)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatch }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatch={onDeleteWatch}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatch }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatch(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
