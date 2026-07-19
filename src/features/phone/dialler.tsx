import { useEffect, useState } from "react";
import { useTwilioPhone } from "./use-twilio-phone";

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
const activeStates = [
  "connected",
  "muted",
  "connecting",
  "ringing",
  "disconnecting",
];

export function Dialler() {
  const [number, setNumber] = useState("");
  const [seconds, setSeconds] = useState(0);
  const phone = useTwilioPhone();
  const isOnCall = activeStates.includes(phone.state);
  useEffect(() => {
    if (!["connected", "muted"].includes(phone.state)) return;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [phone.state]);
  useEffect(() => {
    if (phone.state === "idle" || phone.state === "completed") setSeconds(0);
  }, [phone.state]);
  const heading = isOnCall
    ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
    : "Ready when you are";
  return (
    <section className="dialler-shell">
      <div className="dialler-intro">
        <p className="eyebrow">YOUR CALLING DESK</p>
        <h1>Make the distance feel a little smaller.</h1>
        <p>
          Use your browser and microphone to place a secure call anywhere your
          work takes you.
        </p>
        <div className="desk-detail">
          <span>MICROPHONE</span>
          <strong>{phone.state.replaceAll("-", " ")}</strong>
        </div>
      </div>
      <section className="dialler">
        <div className="dialler-head">
          <p className="eyebrow">
            {isOnCall ? "CALL IN PROGRESS" : "NEW CALL"}
          </p>
          <span className="signal" aria-label="Connection ready">
            <i />
            <i />
            <i />
          </span>
        </div>
        <h2>{heading}</h2>
        <input
          aria-label="Telephone number"
          inputMode="tel"
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          placeholder="+1 555 123 4567"
        />
        <div className="keypad">
          {keys.map((key) => (
            <button
              type="button"
              key={key}
              onClick={() => setNumber((value) => value + key)}
            >
              {key}
            </button>
          ))}
        </div>
        {phone.error && (
          <p role="alert" className="error">
            {phone.error}
          </p>
        )}
        {isOnCall ? (
          <div className="actions">
            <button
              type="button"
              className="button secondary"
              onClick={phone.toggleMute}
            >
              {phone.muted ? "Unmute" : "Mute"}
            </button>
            <button
              type="button"
              className="button danger"
              onClick={phone.hangup}
            >
              Hang up
            </button>
          </div>
        ) : (
          <div className="actions">
            <button
              type="button"
              className="icon-button"
              aria-label="Backspace"
              onClick={() => setNumber((value) => value.slice(0, -1))}
            >
              ⌫
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() => setNumber("")}
            >
              Clear
            </button>
            <button
              type="button"
              className="button"
              disabled={!number}
              onClick={() => phone.start(number)}
            >
              Call <span aria-hidden="true">↗</span>
            </button>
          </div>
        )}
      </section>
    </section>
  );
}
