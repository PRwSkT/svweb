const fs = require('fs');
let css = fs.readFileSync('src/css/components.css', 'utf8');

const newCSS = `

/* Cookie Banner */
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--white);
  padding: 16px;
  box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  display: flex;
  justify-content: center;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}
.cookie-banner.show {
  transform: translateY(0);
}
.cookie-banner-content {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: var(--max);
  width: 100%;
  justify-content: space-between;
}
.cookie-banner-content p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-dark);
}
@media (max-width: 600px) {
  .cookie-banner-content {
    flex-direction: column;
    text-align: center;
  }
}

/* Mega Menu */
.nav-item-dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.mega-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  opacity: 0;
  visibility: hidden;
  background: var(--white);
  box-shadow: 0 10px 30px rgba(9, 27, 48, 0.15);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 24px;
  min-width: 250px;
  transition: all 0.2s ease;
  z-index: 100;
}
.nav-item-dropdown:hover .mega-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}
.mega-menu-content {
  display: flex;
  gap: 32px;
}
.mega-column h4 {
  font-size: 1rem;
  color: var(--sv-crimson);
  margin-bottom: 12px;
  white-space: nowrap;
}
.mega-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.mega-column ul li a {
  display: block;
  padding: 8px 0;
  color: var(--sv-deep);
  text-decoration: none;
  font-weight: 500;
  min-height: auto;
}
.mega-column ul li a::after { display: none !important; }
.mega-column ul li a:hover {
  color: var(--sv-crimson);
}
`;

fs.writeFileSync('src/css/components.css', css + newCSS);
