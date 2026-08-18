export default function Topbar() {
  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <strong>
            Limited WaterSource Wellness Consultation Slots Closing Soon
          </strong>
          <div aria-label="countdown timer" className="timer">
            <div className="timebox">
              <span id="d">06</span>
              <small>DAYS</small>
            </div>
            <div className="timebox">
              <span id="h">23</span>
              <small>HRS</small>
            </div>
            <div className="timebox">
              <span id="m">59</span>
              <small>MIN</small>
            </div>
            <div className="timebox">
              <span id="s">59</span>
              <small>SEC</small>
            </div>
          </div>
          <em>Reserve your place before the next intake closes.</em>
        </div>
      </div>
    </>
  );
}
