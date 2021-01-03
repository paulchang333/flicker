import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useHistory } from "react-router-dom";

import "./OptionSelect.css";
import { ShowContext } from "../../context/ShowContext";
import TypeSelect from "../TypeSelect/TypeSelect";
import GenreSelect from "../GenreSelect/GenreSelect";

let socket;

const OptionSelect = (props) => {
  const { setShowData } = useContext(ShowContext);
  const [genreListDefault, setGenreListDefault] = useState([]);
  const [genreList, setGenreList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const history = useHistory();
  // const ENDPOINT = "localhost:5000";
  const ENDPOINT = "https://flicker-paul-will.herokuapp.com:38207";

  const fetchGenres = async () => {
    const options = {
      method: "GET",
      url: "https://unogs-unogs-v1.p.rapidapi.com/api.cgi",
      params: { t: "genres" },
      headers: {
        "x-rapidapi-key": process.env.REACT_APP_UNOGS_KEY,
        "x-rapidapi-host": "unogs-unogs-v1.p.rapidapi.com",
      },
    };

    let genresArr = [];

    axios
      .request(options)
      .then((response) => {
        for (let item of response.data.ITEMS) {
          // Only include specific genres, not parent genres (parent genres contain the keyword "All")
          if (!Object.keys(item)[0].includes("All")) {
            genresArr.push({
              id: Object.values(item)[0][0],
              name: Object.keys(item)[0],
            });
          }
        }
        setGenreListDefault(genresArr);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    socket = io(ENDPOINT);

    // Clear movie/show checkboxes and selected genres list
    setShowData({ isMovie: false, isSeries: false, selectedGenres: [] });

    fetchGenres();
  }, []);

  const join = async (e) => {
    e.preventDefault();
    socket.emit("readyNow", props.room);
    history.push(`/results?creator=true&&roomCode=${props.room}`);
  };

  return (
    <div className="option-select">
      <h1>Choose your group's filters</h1>
      <TypeSelect />
      <GenreSelect
        genreListDefault={genreListDefault}
        setGenreListDefault={setGenreListDefault}
        genreList={genreList}
        setGenreList={setGenreList}
        keyword={keyword}
        setKeyword={setKeyword}
      />
      <div className="option-select__start-button">
        <form className="form" onSubmit={join}>
          <input type="submit" value="Start" />
        </form>
      </div>
    </div>
  );
};
export default OptionSelect;
