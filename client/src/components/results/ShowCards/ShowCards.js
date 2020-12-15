import React, { useState } from "react";
import TinderCard from "react-tinder-card";

import "./ShowCards.css";

const ShowCards = (props) => {
  const onSwipe = (direction) => {
    console.log("You swiped: " + direction);
  };

  const outOfFrame = (name) => {
    console.log(name + " left the screen!");
  };

  return (
    <div className="show-card">
      <div className="container">
        {props.results.map((show) => {
          return (
            <TinderCard
              className="swipe"
              key={show.title}
              preventSwipe={["up", "down"]}
              onSwipe={onSwipe}
              onCardLeftScreen={() => outOfFrame(show.title)}
            >
              <div
                style={{ backgroundImage: `url(${show.image})` }}
                className="card"
              >
                <div className="show-info">
                  <h2>{show.title}</h2>
                  <h3>{show.synopsis}</h3>
                  <div className="extra-info">
                    <h3>{show.type}</h3>
                    <h3>{show.released}</h3>
                    <h3>{show.runtime}</h3>
                  </div>
                </div>
              </div>
            </TinderCard>
          );
        })}
      </div>
    </div>
  );
};

export default ShowCards;
