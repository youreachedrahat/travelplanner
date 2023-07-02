import React, { useState, useEffect } from "react";
import { getItinerary } from "./apis/getitinerary";
import { getPointsOfInterest } from "./apis/getpoints";
import getdata from "./apis/getdata";
import axios from "axios";
import { EmailShareButton, WhatsappShareButton } from "react-share";
const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function Inputtt() {
  const [request, setRequest] = useState({ days: "", city: "" });
  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [daysArray, setDaysArray] = useState([]);
  const [sharedContent, setSharedContent] = useState("");
const [shareOption, setShareOption] = useState("");


  useEffect(() => {
    checkRedirect();
  }, []);

  function checkRedirect() {
    if (window.location.hostname === "gpt-tour-planner.vercel.app") {
      window.location.replace("https://www.tinycoders.io/");
    }
  }

  async function hitAPI() {
    try {
      if (!request.city || !request.days) return;
      setMessage("Building itinerary...");
      setLoading(true);
      setItinerary("");

      setTimeout(() => {
        if (!loading) return;
        setMessage("Getting closer ...");
      }, 7000);

      setTimeout(() => {
        if (!loading) return;
        setMessage("Almost there ...");
      }, 15000);

      const {
        pointsOfInterestPrompt,
        itinerary,
        morningPrompt,
        afternoonPrompt,
        eveningPrompt,
      } = await getItinerary(request.days, request.city);

      const pointsOfInterest = await getPointsOfInterest(
        pointsOfInterestPrompt
      );
      console.log("potttt", pointsOfInterest);

      const extractedData = await getdata(
        morningPrompt,
        eveningPrompt,
        afternoonPrompt
      );
      console.log("heheh", extractedData);

      let updatedItinerary = itinerary;

      pointsOfInterest.forEach((point) => {
        const link = `[${point}](https://www.google.com/search?q=${encodeURIComponent(
          point + " " + request.city
        )})`;
        updatedItinerary = updatedItinerary.replace(point, link);
      });

      setItinerary(updatedItinerary);
      setSharedContent(updatedItinerary);

      // Backend API call
      const data = {
        days: request.days,
        city: request.city,
        itinerary: updatedItinerary,
      };

      // Send the data to the backend
      const response = await axios.post(`${BASE_URL}/api/saveItinerary`, data);
      console.log("Response from backend:", response.data);

      setLoading(false);
    } catch (err) {
      console.log("error: ", err);
      setMessage("");
    }
  }

  useEffect(() => {
    let days = itinerary.split("Day");
    if (days.length > 1) {
      days.shift();
    } else {
      days[0] = "1" + days[0];
    }
    setDaysArray(days);
  }, [itinerary]);

  return (
    <main>
      <div className="app-container">
        <h1 style={styles.header} className="hero-header">
          Tiny Travelers
        </h1>
        <div style={styles.formContainer} className="form-container">
          <input
            style={styles.input}
            placeholder="City"
            onChange={(e) =>
              setRequest((request) => ({ ...request, city: e.target.value }))
            }
          />
          <input
            style={styles.input}
            placeholder="Days"
            onChange={(e) =>
              setRequest((request) => ({ ...request, days: e.target.value }))
            }
          />
          <button className="button" style={styles.button} onClick={hitAPI}>
            Build Itinerary
          </button>
        </div>
        <div className="results-container" style={styles.resultsContainer}>
          {loading && <p>{message}</p>}
          {itinerary &&
            daysArray.map((day, index) => (
              <div style={styles.dayContainer} key={index}>
                <h2 style={styles.dayHeading}>{`Day ${index + 1}`}</h2>
                <div style={styles.activitiesContainer}>
                  {day
                    .trim()
                    .split(".")
                    .map((item, i) => (
                      <div key={i} style={styles.activity}>
                        {item.trim()}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
        <div>

        {sharedContent && (
  <div style={styles.shareOptions}>
    <h2>Share Trip Details</h2>
    <div style={styles.shareButtons}>
      <EmailShareButton
        subject={`${request.city} Trip Details`}
        body={sharedContent}
        separator="\n\n"
      >
        <button className="button" style={styles.button}>
          Share via Email
        </button>
      </EmailShareButton>
      <WhatsappShareButton title={`${request.city} Trip Details`} url={sharedContent}>
        <button className="button" style={styles.button}>
          Share via WhatsApp
        </button>
      </WhatsappShareButton>
    </div>
  </div>
)}
        </div>
      </div>
    </main>
  );
}

const styles = {
  header: {
    textAlign: "center",
    marginTop: "60px",
    color: "#333",
    fontWeight: "900",
    fontFamily: "Poppins",
    fontSize: "40px",
  },
  input: {
    padding: "10px 14px",
    marginBottom: "10px",
    outline: "none",
    fontSize: "16px",
    borderRadius: "8px",
    width: "90%",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    boxShadow: "0px 0px 12px rgba(0, 0, 0, 0.2)",
    borderRadius: "10px",
    width: "40rem",
    margin: "auto",
  },
  button: {
    width: "90%",
    padding: "0.7rem",
    innerHeight: "10rem",
  },
  resultsContainer: {
    width: "40rem",
    margin: "auto",
  },
  dayContainer: {
    marginBottom: "30px",
  },
  dayHeading: {
    fontSize: "24px",
    marginBottom: "10px",
  },
  activitiesContainer: {
    textAlign: "left",
  },
  activity: {
    marginBottom: "10px",
    fontSize: "16px",
    color: "#333",
  },
};