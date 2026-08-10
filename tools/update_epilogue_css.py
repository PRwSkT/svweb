css = """
.epilogue-body strong {
  color: var(--primary);
  font-weight: 800;
}
.epilogue-body strong:first-of-type {
  display: block;
  font-size: 1.6rem;
  margin: 1.5rem 0;
  line-height: 1.4;
}
"""
with open("src/styles.css", "a") as f:
    f.write(css)
