import React, { useEffect, useRef, useState } from "react";
import { FaVolumeUp, FaCopy, FaCheck, FaExchangeAlt } from "react-icons/fa";
import countries from "../assets/data";
import './translate.css';

const Translate = () => {
  const fromTextRef = useRef(null);
  const toTextRef = useRef(null);
  const fromSelectRef = useRef(null);
  const toSelectRef = useRef(null);

  const [copyState, setCopyState] = useState({
    from: { copied: false, label: "Copy" },
    to: { copied: false, label: "Copy" },
  });

  useEffect(() => {
    const fromTxt = fromTextRef.current;
    const toTxt = toTextRef.current;
    const translateBtn = document.querySelector("button");
    const selectTag = [fromSelectRef.current, toSelectRef.current];

    // Populate the language dropdowns
    selectTag.forEach((tag, id) => {
      for (let country_code in countries) {
        let selected =
          id === 0
            ? country_code === "en-GB"
              ? "selected"
              : ""
            : country_code === "hi-IN"
            ? "selected"
            : "";
        let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option);
      }
    });

    translateBtn.addEventListener("click", () => {
      let text = fromTxt.value.trim();
      let translateFrom = fromSelectRef.current.value; // Correct reference
      let translateTo = toSelectRef.current.value; // Correct reference

      if (!text) return;

      toTxt.setAttribute("placeholder", "Translating...");
      let apiURL = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;
      fetch(apiURL)
        .then((res) => res.json())
        .then((data) => {
          toTxt.value = data.responseData.translatedText || "Translation unavailable";
        })
        .catch((err) => {
          console.error("Translation Error:", err);
          toTxt.value = "Error occurred!";
        })
        .finally(() => {
          toTxt.setAttribute("placeholder", "Translation");
        });
    });
  }, []);

  const handleCopy = (text, type) => {
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      setCopyState((prevState) => ({
        ...prevState,
        [type]: { copied: true, label: "Copied!" },
      }));

      // Revert back to copy icon and label after 1 second
      setTimeout(() => {
        setCopyState((prevState) => ({
          ...prevState,
          [type]: { copied: false, label: "Copy" },
        }));
      }, 1000);
    });
  };

  const handleSound = (text, lang) => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
  };

  const handleExchange = () => {
    // Swap text areas
    const fromText = fromTextRef.current.value;
    const toText = toTextRef.current.value;
    fromTextRef.current.value = toText;
    toTextRef.current.value = fromText;

    // Swap language selections
    const fromLang = fromSelectRef.current.value;
    const toLang = toSelectRef.current.value;
    fromSelectRef.current.value = toLang;
    toSelectRef.current.value = fromLang;
  };

  return (
    <div className="container">
      <div className="wrapper">
        <div className="text-input">
          <textarea
            spellCheck="false"
            className="from-text"
            placeholder="Enter Text"
            ref={fromTextRef}
          ></textarea>
          <textarea
            readOnly
            spellCheck="false"
            className="to-text"
            placeholder="Translation"
            ref={toTextRef}
          ></textarea>
        </div>
        <ul className="controls">
          <li className="row from">
            <div className="icons">
              <FaVolumeUp
                id="from-sound"
                className="icon"
                onClick={() =>
                  handleSound(fromTextRef.current.value, fromSelectRef.current.value)
                }
              />
              <div className="copy-container">
                {copyState.from.copied ? (
                  <FaCheck className="icon" />
                ) : (
                  <FaCopy
                    id="from-copy"
                    className="icon"
                    onClick={() => handleCopy(fromTextRef.current.value, "from")}
                  />
                )}
                <span className="copy-label">{copyState.from.label}</span>
              </div>
            </div>
            <select ref={fromSelectRef}></select>
          </li>
          <li className="exchange" onClick={handleExchange}>
            <FaExchangeAlt />
          </li>
          <li className="row to">
            <select ref={toSelectRef}></select>
            <div className="icons">
              <FaVolumeUp
                id="to-sound"
                className="icon"
                onClick={() =>
                  handleSound(toTextRef.current.value, toSelectRef.current.value)
                }
              />
              <div className="copy-container">
                {copyState.to.copied ? (
                  <FaCheck className="icon" />
                ) : (
                  <FaCopy
                    id="to-copy"
                    className="icon"
                    onClick={() => handleCopy(toTextRef.current.value, "to")}
                  />
                )}
                <span className="copy-label">{copyState.to.label}</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <button>Translate Text</button>
    </div>
  );
};

export default Translate;
