import React, { useState, useContext, useEffect } from "react";
import TinderCard from "react-tinder-card";
import axios from "axios";

import "./ShowCards.css";
import { ShowContext } from "../../context/ShowContext";
import { UserContext } from "../../context/UserContext";
import io from "socket.io-client";

const ShowCards = (props) => {
  const { showData, setShowData } = useContext(ShowContext);
  const { userData } = useContext(UserContext);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [lastDirection, setLastDirection] = useState();
  const [error, setError] = useState();
  const ENDPOINT = "localhost:5000";
  const { roomCode, creator } = props;

  let socket;

  const initializeDisplayedShowData = async () => {
    setDisplayedResults(showData.results);

    if (creator === "true") {
      let data = showData.results;
      socket.emit("addResults", { data, roomCode, creator });
    }
  };
  useEffect(() => {
    socket = io(ENDPOINT);
    initializeDisplayedShowData();
  }, [showData]);

  let swipedShowIds = [];
  let resultsArr = displayedResults;

  const swiped = async (direction, id) => {
    try {
      console.log("You swiped: " + direction);
      setLastDirection(direction);

      swipedShowIds.push(id);
      let swipedShowData = showData.results.find(
        (show) => show.netflixid === id
      );
      swipedShowData.roomid = roomCode;
      swipedShowData.userid = userData.user.id;
      console.log(swipedShowData);
      if (direction === "right") {
        await axios.post(
          "http://localhost:5000/api/shows/accepted",
          swipedShowData
        );
      } else if (direction === "left") {
        await axios.post(
          "http://localhost:5000/api/shows/rejected",
          swipedShowData
        );
      }
    } catch (err) {
      if (err.response.data.msg) {
        setError(err.response.data.msg);
      }
    }
  };

  const outOfFrame = (id) => {
    resultsArr = resultsArr.filter((show) => show.netflixid !== id);
    console.log(resultsArr);
    setDisplayedResults(resultsArr);
  };

  return (
    <div className="cards">
      {displayedResults.map((show) => {
        return (
          <TinderCard
            className="cards--swipe"
            key={show.netflixid}
            preventSwipe={["up", "down"]}
            onSwipe={(dir) => swiped(dir, show.netflixid)}
            onCardLeftScreen={() => outOfFrame(show.netflixid)}
          >
            <div
              style={{ backgroundImage: `url(${show.image})` }}
              className="cards__card"
            >
              <div className="cards__card-content">
                {/* Use dangerouslySetInnerHTML since otherwise JSX escapes the HTML and displays the tag */}
                {/* Note: May want to change in the future, creates possibility for XSS attack */}
                <div
                  className="cards__card-title"
                  dangerouslySetInnerHTML={{
                    __html: `<h3>${show.title}</h3>`,
                  }}
                />
                <div
                  className="cards__card-synopsis"
                  dangerouslySetInnerHTML={{
                    __html: `<p>${show.synopsis}</p>`,
                  }}
                />
                <div className="cards__card-tags">
                  {show.type ? <p>{show.type}</p> : null}
                  {show.released ? <p>{show.released}</p> : null}
                  {show.runtime ? <p>{show.runtime}</p> : null}
                </div>
              </div>
            </div>
          </TinderCard>
        );
      })}
      {lastDirection ? (
        <h2 key={lastDirection} className="cards__swipe-direction">
          You swiped {lastDirection}
        </h2>
      ) : (
        <h2 className="cards__swipe-direction">Swipe a card to get started!</h2>
      )}
      {/* {error && (
        <ErrorNotice message={error} clearError={() => setError(undefined)} />
      )} */}
    </div>
  );
};

export default ShowCards;
