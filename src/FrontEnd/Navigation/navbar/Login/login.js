import React from "react";
import { Link } from 'react-router-dom';
import './StyleLogin.css';
import { Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
export default function login() {
    return (
        <div className="Login rounded-pill">
            <Link className="LinkLogin" to={'/Login'}>
                <Button variant="outlined" color="error">
                <FontAwesomeIcon style={{marginRight:"0.8rem"}} icon={faRightToBracket} />
                    Login
                </Button>
            </Link>
        </div>
    );
}
