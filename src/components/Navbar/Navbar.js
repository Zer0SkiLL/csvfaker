import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();

    return (
      <div className="navbar">
        <Link to="/csv" className="title-link">
            <div className="page-title">Anonymization Tool</div>
        </Link>
        <ul>
          <li>
            <Link to="/csv" className={location.pathname === '/csv' ? 'active' : ''}>
                Csv
            </Link>
          </li>
          <li>
            <Link to="/xml" className={location.pathname === '/xml' ? 'active' : ''}>
                Xml
            </Link>
          </li>
          <li>
            <Link to="/help" className={location.pathname === '/help' ? 'active' : ''}>
                Help
            </Link>
          </li>
        </ul>
      </div>
    );
  }

export default Navbar;