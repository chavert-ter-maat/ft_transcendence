// src/components/Register.tsx
import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import './Register.css';

const REGISTER_URL = '/users/register';
const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const Register: React.FC = () => {
    const userRef = useRef<HTMLInputElement>(null);

    const [user, setUser] = useState<string>('');
    const [validName, setValidName] = useState<boolean>(false);
    const [pwd, setPwd] = useState<string>('');
    const [validPwd, setValidPwd] = useState<boolean>(false);
    const [matchPwd, setMatchPwd] = useState<string>('');
    const [validMatch, setValidMatch] = useState<boolean>(false);
    const [formValid, setFormValid] = useState<boolean>(false);
    const [showUserInfo, setShowUserInfo] = useState<boolean>(false);
    const [showPwdInfo, setShowPwdInfo] = useState<boolean>(false);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [errMsg, setErrMsg] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        userRef.current?.focus();
    }, []);

    useEffect(() => {
        setValidName(USER_REGEX.test(user));
    }, [user]);

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
    }, [pwd]);

    useEffect(() => {
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd]);

    useEffect(() => {
        setFormValid(validName && validPwd && validMatch);
    }, [validName, validPwd, validMatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrMsg('');
        if (!formValid) return;

        try {
            const response = await axios.post(REGISTER_URL, { username: user, password: pwd });
            if (response.status === 201) {
                setUser('');
                setPwd('');
                setMatchPwd('');
                setShowPopup(true);
            }
        } catch (err: any) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Username Taken');
            } else {
                setErrMsg('Registration Failed');
            }
        }
    };

    const handleClose = () => {
        setShowPopup(false);
        navigate('/login');
    };

    return (
        <div>
            <h1>Register</h1>
            {errMsg && <p className="error-msg" aria-live="assertive">{errMsg}</p>}
            <form onSubmit={handleSubmit}>
                {/* Username */}
                <label htmlFor="username">
                    Username:
                    <FontAwesomeIcon icon={faCheck} className={validName ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={validName || !user ? "hide" : "invalid"} />
                </label>
                <input
                    type="text"
                    id="username"
                    ref={userRef}
                    autoComplete="off"
                    onChange={(e) => setUser(e.target.value)}
                    value={user}
                    required
                    aria-invalid={!validName}
                />
                <FontAwesomeIcon
                    icon={faInfoCircle}
                    onClick={() => setShowUserInfo((prev) => !prev)}
                    className="info-icon"
                />
                <p id="uidnote" className={showUserInfo ? "instructions" : "offscreen"}>
                    4 to 24 characters. Must begin with a letter. Letters, numbers, underscores, hyphens allowed.
                </p>

                {/* Password */}
                <label htmlFor="password">
                    Password:
                    <FontAwesomeIcon icon={faCheck} className={validPwd ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hide" : "invalid"} />
                </label>
                <input
                    type="password"
                    id="password"
                    onChange={(e) => setPwd(e.target.value)}
                    value={pwd}
                    required
                    aria-invalid={!validPwd}
                />
                <FontAwesomeIcon
                    icon={faInfoCircle}
                    onClick={() => setShowPwdInfo((prev) => !prev)}
                    className="info-icon"
                />
                <p id="pwdnote" className={showPwdInfo ? "instructions" : "offscreen"}>
                    8 to 24 characters. Must include uppercase and lowercase letters, a number, and a special character.
                    Allowed special characters: ! @ # $ %
                </p>

                {/* Confirm Password */}
                <label htmlFor="confirm_pwd">
                    Confirm Password:
                    <FontAwesomeIcon icon={faCheck} className={validMatch && matchPwd ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={validMatch || !matchPwd ? "hide" : "invalid"} />
                </label>
                <input
                    type="password"
                    id="confirm_pwd"
                    onChange={(e) => setMatchPwd(e.target.value)}
                    value={matchPwd}
                    required
                    aria-invalid={!validMatch}
                />
                <p id="confirmnote" className="offscreen">
                    Must match the first password input field.
                </p>

                <button type="submit" disabled={!formValid}>Register</button>
            </form>
            {showPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <h1>Success</h1>
                        <p>Your form has been submitted!</p>
                        <button onClick={handleClose}>Return</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
