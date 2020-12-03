import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const Home = () => {
    const history = useHistory();

    const onKeyPressHandler = (e) => {
        const nickname = e.target.value;
        if (e.which == 13) {
            history.push(`/users/${nickname}`);
        }
    };

    const divStyle = {
        width : "100%",
        height : "100%",
        textAlign : "center"
    };

    const pStyle = {
        fontSize : "24px",
    }

    return(
        <div style={divStyle}>
            <p style={pStyle}>닉네임을 입력해라.</p>
            <input type="text" onKeyPress={e => onKeyPressHandler(e) } placeholder="닉네임"/>
        </div>
    );
}

export default Home;