import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
const key = "http://khu-project.herokuapp.com/";
let baseURL;

if(process.env.NODE_ENV === "production") {
    baseURL = key;
} else {
    baseURL = "http://localhost:9000";
}

const Users = () => {
    const { nickname } = useParams();
    const [ loading, setLoading ]               = useState(false);
    const [ matchList, setMatchList ]           = useState([]);
    const [ gameList, setGameList ]             = useState([]);
    const [ champions, setChampions ]           = useState({});
    const [ items, setItems ]                   = useState({});
    let index        = useRef(0);
    let scrolling    = useRef(false);
    let accountId    = useRef("");
    let summonerId   = useRef("");
    let summonerInfo = useRef({});
    let leagueInfo   = useRef([]);

    useEffect(() => {
        axios.get(`${baseURL}/users/${nickname}`)
            .then(({ data }) => {
                console.log("[사용자 정보]", data);
                summonerInfo.current = data;
                accountId.current = data.accountId;
                summonerId.current = data.id;
                console.log("[사용자 ID]", accountId.current);
                const url = 'http://ddragon.leagueoflegends.com/cdn/10.23.1/data/en_US/champion.json';
                axios.get(url).then(({data}) => {
                    for(let idx in data.data) {
                        const value = String(data.data[idx].key);
                        setChampions((state) => {
                            return { ...state, [value] : idx };
                        });
                    }
                }).then(() => {
                    loadMatchList(accountId, index);
                });
            });

            axios.get('http://ddragon.leagueoflegends.com/cdn/10.24.1/data/en_US/item.json')
                .then(data => {
                    setItems(data.data.data);
                });
        
        //window.addEventListener('scroll', scrollHandler, true);
    }, []);

    const loadMatchList = (accountId, index, callback) => {
        const url = `${baseURL}/matchelists/${accountId.current}`;
        console.log(`[전적 정보 검색] URL : ${url}`);

        axios.get(url, { params : { beginIndex: index.current, endIndex: index.current+10 } })
            .then(({ data }) => {
                index.current += 10;
                console.log("index :", index.current);
                setLoading(true);
                setMatchList(prev => [...prev, ...data.matches]);
                data.matches.forEach(match => {
                    const url = `${baseURL}/match/${match.gameId}`;
                    axios.get(url)
                        .then(({data}) => {
                            setGameList(prev => [...prev, data]);
                        });
                });
                if(callback) callback();
            });

        
        axios.get(`${baseURL}/league/${summonerId.current}`)
            .then(({data}) => {
                if(data.data.length > 0) {
                    data.data.forEach(e => {
                        console.log(e.queueType);
                        if(e.queueType == "RANKED_SOLO_5x5") leagueInfo.current = e;
                    });
                    
                }
            })
    }

    const containerStyle = {
        width : "100%",
        height : "100%",
    }

    const profileStyle = {
        width : "100%",
        height : "100px",
        display : "inline-flex",
        zIndex : "0",
    }

    const profileIconStyle = {
        width : "100px",
        height : "100px",
    }

    const ProfileLevelStyle = {
        position : "relative",
        bottom : "0",
        left : "-50%",
        backgroundColor : "white",
        zIndex : "2",
    }
    
    const matchesStyle = {
        margin : "10px",
        border : "2px solid #D3DEE9",
    }

    const loadButtonStyle = {
        width: "100%",
    }

    const loadButtonHandler = (event) => {
        /*
        let scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        let scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
        let clientHeight = document.documentElement.clientHeight;
        if(scrollTop + clientHeight === scrollHeight) {
            if(!scrolling.current) {
                scrolling.current = !scrolling.current;
                loadMatchList(accountId, index, () => {
                    scrolling.current = !scrolling.current;
                });
            }
        }*/
        if(!scrolling.current) {
            scrolling.current = !scrolling.current;
            loadMatchList(accountId, index, () => {
                scrolling.current = !scrolling.current;
            });
        }
    }

    return(
        loading === true
        ?
        <div id="container" style={containerStyle}>
            <div id="top" style={profileStyle}>
                <div>
                    <img src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/profileicon/${summonerInfo.current.profileIconId}.png`}
                        style={profileIconStyle} alt={summonerInfo.current.profileIconId}/>
                    <span style={ProfileLevelStyle}>{summonerInfo.current.summonerLevel}</span>
                </div>
                <span>{summonerInfo.current.name}</span>
                {leagueInfo.current === undefined ?
                <div></div>
                :
                <div>
                    <div>
                        <img src={`../../images/${leagueInfo.current.tier}.png`}
                            alt="티어"
                            width="75px"
                            height="75px" />
                    </div>
                    <div>
                        {`${leagueInfo.current.tier} ${leagueInfo.current.rank}`}
                    </div>
                </div>
                }
            </div>

            <div id="matches" style={matchesStyle}>
                {matchList.map(_element => {
                    return(
                        <div>
                            <Match
                                key={_element.gameId}
                                gameId={_element.gameId}
                                element={_element}
                                gameList={gameList}
                                champions={champions}
                                items={items}
                                nickname={nickname}/>
                        </div>
                    )
                })}
            </div>

            <div >
                <button style={loadButtonStyle} onClick={loadButtonHandler}>로딩</button>
            </div>
        </div>
        :
        <div>
            <img src="../../images/loading.gif" alt="loading..."/>
        </div>   
    )
}

const Match = ({ gameId, element, gameList, champions, items, nickname }) => {
    const [ loaded, setLoaded ]     = useState(false);
    const [ clicked, setClicked ]   = useState(false);
    const [ spell1Id, setSpell1Id ] = useState(0);
    const [ spell2Id, setSpell2Id ] = useState(0);
    const date   = new Date(element.timestamp);
    let gameInfo = useRef({});
    let playerInfo = useRef({});
    let teamInfo = useRef({});
    const summonerSpell = {
        "1": "SummonerBoost",
        "3": "SummonerExhaust",
        "4": "SummonerFlash",
        "6": "SummonerHaste",
        "7": "SummonerHeal",
        "11": "SummonerSmite",
        "12": "SummonerTeleport",
        "13": "SummonerMana",
        "14": "SummonerDot",
        "21": "SummonerBarrier",
        "30": "SummonerPoroRecall",
        "31": "SummonerPoroThrow",
        "32": "SummonerSnowball",
        "39": "SummonerSnowURFSnowball_Mark",
    }
    const gameMode = {
        "CLASSIC": "소환사의 협곡",
        "ODIN": "수정의 상처",
        "ARAM": "우르프",
        "TUTORIAL": "튜토리얼",
        "URF": "우르프",
        "DOOMBOTSTEEMO": "봇전",
        "ONEFORALL": "단일모드",
        "ASCENSION": "ascension",
        "FIRSTBLOOD": "firstblood",
        "KINGPORO": "킹포로",
        "SIEGE": "넥서스모드",
        "ASSASSINATE": "assassinate",
        "ASAR": "랜덤모드",
        "DARKSTAR": "darkstar",
        "STARGUARDIAN": "스타가디언",
        "PROJECT": "PROJECT",
        "GAMEMODEX": "GAMEMODEX",
        "ODYSSEY": "오디세이모드",
    }

    useEffect(() => {
        gameList.forEach(game => {
            if(game.gameId === gameId) {
                gameInfo.current = game;
                teamInfo.current = game.participantIdentities;
                game.participantIdentities.forEach(pidt => {
                    if(pidt.player.summonerName === nickname) {
                        game.participants.forEach(p => {
                            if(p.participantId === pidt.participantId) {
                                playerInfo.current = p.stats;
                                setSpell1Id(p.spell1Id);
                                setSpell2Id(p.spell2Id);
                                setLoaded(true);
                            }
                        });
                    }
                });
            }
        });
    });

    const timeForToday = value => {
        const today = new Date();
        const timeValue = new Date(value);

        const betweenTime = Math.floor((today.getTime() - timeValue.getTime()) / 1000 / 60);
        if (betweenTime < 1) return '방금 전';
        if (betweenTime < 60) {
            return `${betweenTime}분 전`;
        }

        const betweenTimeHour = Math.floor(betweenTime / 60);
        if (betweenTimeHour < 24) {
            return `${betweenTimeHour}시간 전`;
        }

        const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
        if (betweenTimeDay < 365) {
            return `${betweenTimeDay}일 전`;
        }

        return `${Math.floor(betweenTimeDay / 365)}년 전`;
    }

    const clickHandler = () => {
        setClicked(!clicked);
        if(clicked) console.log("펼쳐짐");
        else console.log("닫힘");
    }

    const matchStyle = {
        height: "100px",
        border: "1px solid #D3DEE9",
        display: "flex",
        backgroundColor: playerInfo.current.win ? "#a3cfec" : "#e2b6b3",
    }

    const championIconStyle = {
        width: "100px",
        height: "100px",
    }

    const spellDivStyle = {
        width: "18%",
        marginLeft: "5px",
    }

    const kdaDivStyle = {
        width: "13%",
        marginLeft: "5px",
        fontSize: "140%",
    }

    const tableStyle = {
        height: "100%",
        verticalAlign: "center",
        textAlign: "center",
        margin: "0 auto",
    }

    const statDivStyle = {
        width: "13%",
        marginLeft: "5px",
    }

    const spellDiv2Style = {
        height: "100%",
    }

    const spellDivBottomStyle = {
        display: "flex",
        marginTop: "7px",
    }

    const spellTimeDivStyle = {
        margin: "23px auto",
    }

    const itemDivStyle = {
        width: "20%",
    }

    const itemEmptyStyle = {
        width: "35px",
        height: "35px",
        marginTop: "-5px",
        backgroundColor: "rgba(0,0,0,0.2)",
    }

    const teamDivStyle = {
        width: "200px",
        fontSize: "80%",
        display: "block",
    }

    const teamTableStyle = {
        width: "200px",
        height: "90px",
        tableLayout: "fixed",
        border: "0",
        borderCollapse: "collapse",
    }

    const teamTdStyle = {
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
        margin: "0px",
        padding: "0px",
        borderCollapse: "collapse",
    }

    const teamImgStyle = {
        display: "block",
    }

    return(
        loaded === true
        ?
        <div>
            <div style={matchStyle} onClick={clickHandler}>
                <img src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[element.champion]}.png`}
                    style={championIconStyle}
                    alt="챔피언초상화"/>
                <div style={spellDivStyle}>
                    <div>{gameMode[gameInfo.current.gameMode]}·{timeForToday(date)}</div>
                    <div style={spellDivBottomStyle}>
                        <div style={spellDiv2Style}>
                            <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/spell/${summonerSpell[spell1Id]}.png`}
                            width="30px" height="30px" alt="소환사 스펠1" /><br/>
                            <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/spell/${summonerSpell[spell2Id]}.png`}
                            width="30px" height="30px" alt="소환사 스펠2" />
                        </div>
                        <div style={spellTimeDivStyle}>
                            {`${(gameInfo.current.gameDuration/60).toFixed(0)}분 ${gameInfo.current.gameDuration%60}초`}
                        </div>
                    </div>
                    
                </div>

                <div style={kdaDivStyle}>
                    <table style={tableStyle}>
                        <thead></thead>
                        <tbody>
                            <tr></tr>
                            <tr>
                                <td>{playerInfo.current.kills}</td>
                                <td>/</td>
                                <td>{playerInfo.current.deaths}</td>
                                <td>/</td>
                                <td>{playerInfo.current.assists}</td>
                            </tr>
                            <tr>
                                <td colSpan='5'>{playerInfo.current.deaths === 0 ? "Perfect" : ((playerInfo.current.kills + playerInfo.current.assists) / playerInfo.current.deaths).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colSpan='5'>{playerInfo.current.largestMultiKill === 2 && "더블킬"}{playerInfo.current.largestMultiKill === 3 && "트리플킬"}{playerInfo.current.largestMultiKill === 4 && "쿼드라킬"}{playerInfo.current.largestMultiKill === 5 && "펜타킬"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={statDivStyle}>
                    <table style={tableStyle}>
                        <thead></thead>
                        <tbody>
                            <tr><td>{"레벨 "+playerInfo.current.champLevel}</td></tr>
                            <tr><td>{`${playerInfo.current.totalMinionsKilled} (${(playerInfo.current.totalMinionsKilled/(gameInfo.current.gameDuration/60)).toFixed(1)}) CS`}</td></tr>
                            <tr><td></td></tr>
                        </tbody>
                    </table>
                </div>
                <div style={itemDivStyle}>
                    <table style={tableStyle}>
                        <thead></thead>
                        <tbody>
                            <tr>
                                <td>{Object.keys(items).includes((String)(playerInfo.current.item0)) ? <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/item/${playerInfo.current.item0}.png`} width="35px" height="35px" alt="아이템" /> : <div style={itemEmptyStyle}></div>}</td>
                                <td>{Object.keys(items).includes((String)(playerInfo.current.item1)) ? <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/item/${playerInfo.current.item1}.png`} width="35px" height="35px" alt="아이템" /> : <div style={itemEmptyStyle}></div>}</td>
                                <td>{Object.keys(items).includes((String)(playerInfo.current.item2)) ? <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/item/${playerInfo.current.item2}.png`} width="35px" height="35px" alt="아이템" /> : <div style={itemEmptyStyle}></div>}</td>
                                <td>{Object.keys(items).includes((String)(playerInfo.current.item6)) ? <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/item/${playerInfo.current.item6}.png`} width="35px" height="35px" alt="아이템" /> : <div style={itemEmptyStyle}></div>}</td>
                            </tr>
                            <tr>
                                <td>{Object.keys(items).includes((String)(playerInfo.current.item3)) ? <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/item/${playerInfo.current.item3}.png`} width="35px" height="35px" alt="아이템" /> : <div style={itemEmptyStyle}></div>}</td>
                                <td>{Object.keys(items).includes((String)(playerInfo.current.item4)) ? <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/item/${playerInfo.current.item4}.png`} width="35px" height="35px" alt="아이템" /> : <div style={itemEmptyStyle}></div>}</td>
                                <td>{Object.keys(items).includes((String)(playerInfo.current.item5)) ? <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/item/${playerInfo.current.item5}.png`} width="35px" height="35px" alt="아이템" /> : <div style={itemEmptyStyle}></div>}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={teamDivStyle}>
                    <table style={teamTableStyle}>
                        <thead></thead>
                        <tbody>
                            <tr>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.current.participants[0].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo.current[0].player.summonerName}</td>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.current.participants[5].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td width="65px" style={teamTdStyle}>{teamInfo.current[5].player.summonerName}</td>
                            </tr>
                            <tr>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.current.participants[1].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo.current[1].player.summonerName}</td>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.current.participants[6].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo.current[6].player.summonerName}</td>
                            </tr>
                            <tr>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.current.participants[2].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo.current[2].player.summonerName}</td>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.current.participants[7].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo.current[7].player.summonerName}</td>
                            </tr>
                            <tr>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.current.participants[3].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo.current[3].player.summonerName}</td>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.current.participants[8].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo.current[8].player.summonerName}</td>
                            </tr>
                            <tr>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.current.participants[4].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo.current[4].player.summonerName}</td>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.current.participants[9].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo.current[9].player.summonerName}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        {clicked === true
        ?
            <div>펼쳐진 상태</div>
        :
            <></>
        }
        </div>
        :
        <div><img src="../../images/loading.gif" alt="loading..."/></div>
    )
}

export default Users;