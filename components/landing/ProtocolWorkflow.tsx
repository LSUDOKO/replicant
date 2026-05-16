"use client";

const phases = [
  {
    phase: "Phase 01",
    title: "Genesis",
    subtitle: "Birth of an agent species",
    description:
      "Deploy your agent species. Configuration encrypted and uploaded to 0G Storage. Gen-0 Agent ID minted on-chain.",
    location: "0G Storage Layer",
    date: "Genesis Block",
    bg: "/evolution/genesis.png",
  },
  {
    phase: "Phase 02",
    title: "Life",
    subtitle: "Runtime performance loop",
    description:
      "Agent performs its task. Performance metrics logged to 0G Storage KV layer. Users subscribe to outputs.",
    location: "0G KV Layer",
    date: "Runtime",
    bg: "/evolution/life.avif",
  },
  {
    phase: "Phase 03",
    title: "Evolution",
    subtitle: "TEE mutation chamber",
    description:
      "Performance drops? Agent enters TEE Evolution Chamber. 50 mutations tested. Best child minted. Memory transferred.",
    location: "TEE Evolution Chamber",
    date: "Mutation Cycle",
    bg: "/Scene-ezgif.com-crop.gif",
  },
  {
    phase: "Phase 04",
    title: "Commerce",
    subtitle: "Sealed marketplace handoff",
    description:
      "Child agent listed on marketplace. Sealed handover — strategy never exposed. Royalties flow to original creator.",
    location: "Agent Marketplace",
    date: "Perpetual",
    bg: "/evolution/commerse.webp",
  },
];

export function ProtocolWorkflow() {
  return (
    <section className="relative overflow-hidden border-t border-violet-500/20 bg-black py-32 text-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[1100px] -translate-x-1/2 -translate-y-1/2 bg-violet-500/10 blur-[160px]" />

      <div className="mx-auto max-w-7xl px-8 lg:px-16">
        <div className="mx-auto mb-20 max-w-5xl text-center">
          <h2 className="text-5xl font-black uppercase leading-[0.9] text-white sm:text-6xl lg:text-8xl">
            The Protocol <br />
            <span className="text-violet-500 font-sniglet font-normal">Workflow</span>
          </h2>

          <div className="mx-auto mt-10 flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
                From Genesis <br />
                <span className="text-violet-400 font-sniglet font-normal">to Commerce</span>
              </p>
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-lg font-normal leading-relaxed text-white/80 md:text-xl font-sniglet">
            Four phases of autonomous agent evolution &mdash; fully on-chain,
            fully sealed, fully safe.
          </p>
        </div>

        <div className="relative">
          <ul className="workflow-cards">
            {phases.map((p) => (
              <li key={p.title} className="booking-card">
                <div
                  className="card-image"
                  style={{ backgroundImage: `url(${p.bg})` }}
                />
                <div className="informations-container">
                  <p className="phase-label">{p.phase}</p>
                  <h3 className="title">{p.title}</h3>
                  <p className="sub-title">{p.subtitle}</p>
                  <div className="more-information">
                    <div className="info-and-date-container">
                      <div className="box">{p.location}</div>
                      <div className="box">{p.date}</div>
                    </div>
                    <p className="disclaimer">{p.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        .workflow-cards {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 24px;
        }

        .booking-card {
          position: relative;
          width: 380px;
          flex: 0 0 380px;
          display: flex;
          flex-direction: column;
          border-radius: 14px;
          overflow: hidden;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          transition: all 0.45s cubic-bezier(0.23, 1, 0.32, 1);
          will-change: transform;
          background: #0a0a0f;
        }

        .booking-card .card-image {
          height: 240px;
          background-position: center center;
          background-size: cover;
          transition: 0.45s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
        }

        .booking-card .card-image::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(to top, #0a0a0f 0%, transparent 100%);
          pointer-events: none;
        }

        .booking-card .informations-container {
          padding: 20px 20px 20px;
          background: #0a0a0f;
          transition: 0.45s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          z-index: 2;
          margin-top: -40px;
        }

        .booking-card .informations-container .phase-label {
          font-size: 0.7em;
          font-weight: 400;
          font-family: var(--font-sniglet), "Sniglet", system-ui;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(167,139,250,0.5);
          margin: 0 0 4px;
        }

        .booking-card .informations-container .title {
          position: relative;
          padding-bottom: 10px;
          margin-bottom: 4px;
          font-weight: 900;
          font-size: 1.5em;
          letter-spacing: -0.01em;
          color: #f0f0ff;
        }

        .booking-card .informations-container .title::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          height: 2.5px;
          width: 36px;
          border-radius: 2px;
          background: linear-gradient(90deg, #a78bfa, #2dd4bf);
        }

        .booking-card .informations-container .sub-title {
          font-size: 0.78em;
          font-weight: 400;
          font-family: var(--font-sniglet), "Sniglet", system-ui;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(167,139,250,0.6);
          margin: 8px 0 0;
        }

        .booking-card .informations-container .more-information {
          opacity: 0;
          max-height: 0;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .booking-card .informations-container .more-information .info-and-date-container {
          display: flex;
          gap: 8px;
          margin-top: 14px;
        }

        .booking-card .informations-container .more-information .info-and-date-container .box {
          flex: 1;
          padding: 8px 10px;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          font-weight: 400;
          font-family: var(--font-sniglet), "Sniglet", system-ui;
          font-size: 0.68em;
          color: rgba(255,255,255,0.5);
          line-height: 1.3;
        }

        .booking-card .informations-container .more-information .disclaimer {
          margin-top: 14px;
          font-size: 0.72em;
          font-weight: 400;
          font-family: var(--font-sniglet), "Sniglet", system-ui;
          line-height: 1.6;
          color: rgba(255,255,255,0.4);
        }

        .booking-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 60px rgba(139,92,246,0.25), 0 0 40px rgba(139,92,246,0.1);
        }

        .booking-card:hover .card-image {
          height: 160px;
        }

        .booking-card:hover .informations-container {
          margin-top: 0;
        }

        .booking-card:hover .informations-container .more-information {
          opacity: 1;
          max-height: 300px;
        }

        @media (max-width: 768px) {
          .booking-card {
            width: 100%;
            flex: 0 0 100%;
          }

          .booking-card .card-image {
            height: 200px;
          }

          .booking-card .informations-container .more-information {
            opacity: 1;
            max-height: 300px;
          }
        }
      `}</style>
    </section>
  );
}
