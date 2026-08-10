css = """
/* About History Timeline - Elegant & Grand */
.about-history {
  max-width: 1000px;
  margin: 0 auto;
}
.about-history .section-heading {
  margin-bottom: 4rem;
}
.about-history .eyebrow {
  color: var(--primary);
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.about-history h2 {
  font-size: 2.8rem;
  color: var(--text-dark);
  font-weight: 800;
  margin: 1rem 0;
  line-height: 1.3;
}
.about-history .lead {
  font-size: 1.25rem;
  color: var(--text);
  line-height: 1.8;
  max-width: 800px;
  margin: 0 auto;
}

/* The vertical line container */
.history-timeline {
  position: relative;
  padding: 2rem 0;
}
/* The central vertical line */
.history-timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 2rem;
  width: 3px;
  background: linear-gradient(to bottom, transparent, var(--primary), var(--primary), transparent);
}

.history-chapter {
  margin-bottom: 5rem;
  position: relative;
}
.chapter-header {
  margin-bottom: 2rem;
  padding-left: 5rem;
  position: relative;
}
/* Chapter dot on the line */
.chapter-header::before {
  content: '';
  position: absolute;
  left: 1.25rem;
  top: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: white;
  border: 4px solid var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 0 6px rgba(18,124,209,0.1);
  z-index: 2;
}

.chapter-subtitle {
  color: var(--primary);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}
.chapter-header h3 {
  font-size: 2rem;
  color: var(--text-dark);
  margin-bottom: 1rem;
  font-weight: 700;
}
.chapter-body {
  font-size: 1.15rem;
  color: var(--text);
  line-height: 1.8;
}

.chapter-events {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-left: 5rem;
}
.event-item {
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.06);
  border-left: 4px solid var(--primary);
  transition: transform 0.3s ease;
}
.event-item:hover {
  transform: translateX(5px);
}
/* Event dot on the line */
.event-item::before {
  content: '';
  position: absolute;
  left: -3.8rem;
  top: 2rem;
  width: 1rem;
  height: 1rem;
  background: var(--primary);
  border-radius: 50%;
  z-index: 2;
}
/* Connecting line from dot to card */
.event-item::after {
  content: '';
  position: absolute;
  left: -3.3rem;
  top: 2.45rem;
  width: 3.3rem;
  height: 2px;
  background: var(--primary);
  opacity: 0.3;
  z-index: 1;
}

.event-year {
  display: inline-block;
  background: var(--primary);
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
}
.event-content h4 {
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  color: var(--text-dark);
  font-weight: 700;
}
.event-content p {
  color: var(--text);
  line-height: 1.7;
  font-size: 1.05rem;
}

/* Epilogue */
.epilogue-section {
  text-align: center;
  margin-top: 5rem;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, rgba(18,124,209,0.05) 0%, rgba(18,124,209,0.01) 100%);
  border-radius: 20px;
  position: relative;
}
.epilogue-section::before {
  content: '”';
  position: absolute;
  top: -2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 8rem;
  color: var(--primary);
  opacity: 0.1;
  font-family: serif;
}
.epilogue-section h3 {
  font-size: 2.2rem;
  color: var(--primary);
  margin-bottom: 1.5rem;
}
.epilogue-section .epilogue-body {
  font-size: 1.25rem;
  line-height: 1.9;
  color: var(--text-dark);
  max-width: 800px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .history-timeline::before {
    left: 1rem;
  }
  .chapter-header {
    padding-left: 3rem;
  }
  .chapter-header::before {
    left: 0.25rem;
  }
  .chapter-events {
    padding-left: 3rem;
  }
  .event-item::before {
    left: -2.4rem;
    width: 0.8rem;
    height: 0.8rem;
    top: 2.1rem;
  }
  .event-item::after {
    left: -2rem;
    width: 2rem;
  }
  .about-history h2 {
    font-size: 2rem;
  }
}
"""

with open("src/styles.css", "a") as f:
    f.write(css)
