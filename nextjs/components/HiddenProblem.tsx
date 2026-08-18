import type { CSSProperties } from "react";

export default function HiddenProblem() {
  return (
    <>
      <section
        className="section dark-section hidden-problem-section"
        style={
          {
            "--hidden-problem-bg":
              "url('https://watersource.com.sg/wp-content/uploads/2022/09/SCCC-Talk-21-June-2015-05.jpg')",
          } as CSSProperties
        }
      >
        <div className="wrap split">
          <div>
            <p className="eyebrow">The hidden wellness problem</p>
            <h2>The breakthrough most people overlook.</h2>
            <p className="lead" style={{ marginTop: "22px" }}>
              People invest in upgrading their supplements, workouts, sleep
              routines, and health screenings—yet they still drink plain,
              ordinary water that only quenches thirst each day. However, every
              cell, organ, and system relies on vital, functional water to
              promote self-healing, fight oxidation, repair damaged cells, and
              restore internal balance.
            </p>
          </div>
          <div className="pain-list">
            <div className="icon-drop">
              <strong>Water is the foundation</strong>
              <span>Every cell, organ and system depends on it.</span>
            </div>
            <div className="icon-bin">
              <strong>Basic filtration focuses on</strong>
              <span>
                Removing harmful substances from water; beyond just purity,
                WaterSource further emphasizes combating oxidative damage and
                repairing the body’s innate self-healing ability.
              </span>
            </div>
            <div className="icon-glass">
              <strong>Your next wellness shift</strong>
              <span>
                May begin by understanding what makes your next glass of water
                different.
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
