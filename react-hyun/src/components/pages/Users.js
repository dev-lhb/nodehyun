import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
const key = "http://nodehyun.herokuapp.com/";
let baseURL;

if(process.env.NODE_ENV === "production") {
    baseURL = key;
} else {
    baseURL = "http://localhost:9000";
}

const Users = () => {
    const { nickname } = useParams();
    const [ loading, setLoading ]           = useState(false);
    const [ matchList, setMatchList ]       = useState([]);
    const [ gameList, setGameList ]         = useState([]);
    const [ champions, setChampions ]       = useState({});
    const [ items, setItems ]               = useState({});
    const [ index, setIndex ]               = useState(0);
    const [ isMoreLoading, setMoreLoading ] = useState(false);
    const [ accountId, setAccountId ]       = useState("");
    const [ summonerInfo, setSummonerInfo ] = useState({});
    const [ soloLeagueInfo, setSoloLeagueInfo ] = useState({});
    const [ teamLeagueInfo, setTeamLeagueInfo ] = useState({});

    useEffect(() => {
        axios.get(`${baseURL}/users/${nickname}`)
            .then(({ data }) => {
                /*
                    accountId, profileIconId, revisionDate, name, id, puuid, summonerLevel
                */
                const _accountId  = data.accountId;
                const _summonerId = data.id;
                setSummonerInfo(data);
                setAccountId(data.accountId);
                console.log("[data]", data);
                console.log("[accountId]", _accountId);
                console.log("[summonerId]", data.id);
                const url = 'http://ddragon.leagueoflegends.com/cdn/10.23.1/data/en_US/champion.json';
                axios.get(url).then(({data}) => {
                    for(let idx in data.data) {
                        const value = String(data.data[idx].key);
                        setChampions((state) => {
                            return { ...state, [value] : idx };
                        });
                    }
                }).then(() => {
                    loadMatchList(_accountId, _summonerId, index);
                });
            });

            axios.get('http://ddragon.leagueoflegends.com/cdn/10.24.1/data/en_US/item.json')
                .then(data => {
                    setItems(data.data.data);
                });
        
        //window.addEventListener('scroll', scrollHandler, true);
    }, []);

    const loadMatchList = (_accountId, _summonerId, index, callback) => {
        const url = `${baseURL}/matchelists/${_accountId}`;
        console.log(`[전적 정보 검색] URL : ${url}`);

        axios.get(url, { params : { beginIndex: index, endIndex: index+10 } })
            .then(({ data }) => {
                /*
                    matches : [{platformId, gameId, champion, queue, season, timestamp, role, lane}]
                */
                setIndex(prev => prev + 10);
                console.log(`[게임 정보 검색] useState:index : ${index}`);
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

        
        axios.get(`${baseURL}/league/${_summonerId}`)
            .then(({data}) => {
                /*
                    leagueId, summonerId, summonerName, queueType, tier, rank, leaguePoints,
                    wins, losses, hotStreak, veteran, freshBlood, inactive, miniSeries
                */
                if(data.data.length > 0) {
                    data.data.forEach(e => {
                        if(e.queueType === "RANKED_SOLO_5x5") {
                            setSoloLeagueInfo(e);
                        } else if(e.queueType === "RANKED_FLEX_SR") {
                            setTeamLeagueInfo(e);
                        }
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
        height : "120px",
        display : "inline-flex",
        zIndex : "0",
    }

    const profileIconStyle = {
        width : "120px",
        height : "120px",
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

    const tierDivStyle = {
        width: "50%",
        display: "flex",
        marginLeft: "10px",
        textAlign: "center",
    }

    const loadButtonHandler = (event) => {
        if(!isMoreLoading) {
            setMoreLoading(prev => !prev);
            loadMatchList(accountId, index, () => {
                setMoreLoading(prev => !prev);
            });
        }
    }

    return(
        loading === true
        ?
        <div id="container" style={containerStyle}>
            <div id="top" style={profileStyle}>
                <div>
                    <img src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/profileicon/${summonerInfo.profileIconId}.png`}
                        style={profileIconStyle} alt={summonerInfo.profileIconId}/>
                    <span style={ProfileLevelStyle}>{summonerInfo.summonerLevel}</span>
                </div>
                <div>
                    <span>{summonerInfo.name}</span>
                </div>
                <div style={tierDivStyle}>
                    <div>
                        <table>
                            <thead></thead>
                            <tbody>
                                <tr>솔로 랭크</tr>
                                <tr>
                                    <img src={`../../images/${Object.keys(soloLeagueInfo).length === 0 ? "UNRANKED" : soloLeagueInfo.tier}.png`}
                                        alt="티어" width="50px" height="50px" />
                                </tr>
                                <tr>
                                    {Object.keys(soloLeagueInfo).length === 0 ? <></> : `${soloLeagueInfo.tier} ${soloLeagueInfo.rank} (${soloLeagueInfo.leaguePoints}P)`}
                                </tr>
                                <tr>
                                    {Object.keys(soloLeagueInfo).length === 0
                                    ?
                                    <></>
                                    :
                                    <td>
                                        <font color="blue">{soloLeagueInfo.wins} Wins</font> <font color="red">{soloLeagueInfo.losses} Loses</font> ({(soloLeagueInfo.wins / (soloLeagueInfo.wins+soloLeagueInfo.losses) * 100).toFixed(1)}%)
                                    </td>
                                    }
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <table>
                            <thead></thead>
                            <tbody>
                                <tr>자유 랭크</tr>
                                <tr>
                                    <img src={`../../images/${Object.keys(teamLeagueInfo).length === 0 ? "UNRANKED" : teamLeagueInfo.tier}.png`}
                                        alt="티어" width="50px" height="50px" />
                                </tr>
                                <tr>
                                    {Object.keys(teamLeagueInfo).length === 0 ? <></> : `${teamLeagueInfo.tier} ${teamLeagueInfo.rank} (${teamLeagueInfo.leaguePoints}P)`}
                                </tr>
                                <tr>
                                    {Object.keys(soloLeagueInfo).length === 0
                                    ?
                                    <></>
                                    :
                                    <td>
                                        <font color="blue">{teamLeagueInfo.wins} Wins</font> <font color="red">{teamLeagueInfo.losses} Loses</font> ({(teamLeagueInfo.wins / (teamLeagueInfo.wins+teamLeagueInfo.losses) * 100).toFixed(1)}%)
                                    </td>
                                    }
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
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
            <img src="../../images/loading.gif" weight="100px" height="100px" alt="loading..."/>
        </div>   
    )
}

const Match = ({ gameId, element, gameList, champions, items, nickname }) => {
    const [ loaded, setLoaded ]         = useState(false);
    const [ clicked, setClicked ]       = useState(false);
    const [ spell1Id, setSpell1Id ]     = useState(0);
    const [ spell2Id, setSpell2Id ]     = useState(0);
    const [ gameInfo, setGameInfo ]     = useState({});
    const [ playerInfo, setPlayerInfo ] = useState({});
    const [ teamInfo, setTeamInfo ]     = useState({});

    const date   = new Date(element.timestamp);
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
                setGameInfo(game);
                setTeamInfo(game.participantIdentities);
                game.participantIdentities.forEach(pidt => {
                    if(pidt.player.summonerName === nickname) {
                        game.participants.forEach(p => {
                            if(p.participantId === pidt.participantId) {
                                setPlayerInfo(p.stats);
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
        backgroundColor: playerInfo.win ? "#a3cfec" : "#e2b6b3",
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
                    <div>{gameMode[gameInfo.gameMode]}·{timeForToday(date)}</div>
                    <div style={spellDivBottomStyle}>
                        <div style={spellDiv2Style}>
                            <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/spell/${summonerSpell[spell1Id]}.png`}
                            width="30px" height="30px" alt="소환사 스펠1" /><br/>
                            <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/spell/${summonerSpell[spell2Id]}.png`}
                            width="30px" height="30px" alt="소환사 스펠2" />
                        </div>
                        <div style={spellTimeDivStyle}>
                            {`${(gameInfo.gameDuration/60).toFixed(0)}분 ${gameInfo.gameDuration%60}초`}
                        </div>
                    </div>
                    
                </div>

                <div style={kdaDivStyle}>
                    <table style={tableStyle}>
                        <thead></thead>
                        <tbody>
                            <tr></tr>
                            <tr>
                                <td>{playerInfo.kills}</td>
                                <td>/</td>
                                <td>{playerInfo.deaths}</td>
                                <td>/</td>
                                <td>{playerInfo.assists}</td>
                            </tr>
                            <tr>
                                <td colSpan='5'>{playerInfo.deaths === 0 ? "Perfect" : ((playerInfo.kills + playerInfo.assists) / playerInfo.deaths).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colSpan='5'>{playerInfo.largestMultiKill === 2 && "더블킬"}{playerInfo.largestMultiKill === 3 && "트리플킬"}{playerInfo.largestMultiKill === 4 && "쿼드라킬"}{playerInfo.largestMultiKill === 5 && "펜타킬"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={statDivStyle}>
                    <table style={tableStyle}>
                        <thead></thead>
                        <tbody>
                            <tr><td>{"레벨 " + playerInfo.champLevel}</td></tr>
                            <tr><td>{`${playerInfo.totalMinionsKilled} (${(playerInfo.totalMinionsKilled/(gameInfo.gameDuration/60)).toFixed(1)}) CS`}</td></tr>
                            <tr><td></td></tr>
                        </tbody>
                    </table>
                </div>
                <div style={itemDivStyle}>
                    <table style={tableStyle}>
                        <thead></thead>
                        <tbody>
                            <tr>
                                <td>{Object.keys(items).includes((String)(playerInfo.item0)) ? <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/item/${playerInfo.item0}.png`} width="35px" height="35px" alt="아이템" /> : <div style={itemEmptyStyle}></div>}</td>
                                <td>{Object.keys(items).includes((String)(playerInfo.item1)) ? <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/item/${playerInfo.item1}.png`} width="35px" height="35px" alt="아이템" /> : <div style={itemEmptyStyle}></div>}</td>
                                <td>{Object.keys(items).includes((String)(playerInfo.item2)) ? <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/item/${playerInfo.item2}.png`} width="35px" height="35px" alt="아이템" /> : <div style={itemEmptyStyle}></div>}</td>
                                <td>{Object.keys(items).includes((String)(playerInfo.item6)) ? <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/item/${playerInfo.item6}.png`} width="35px" height="35px" alt="아이템" /> : <div style={itemEmptyStyle}></div>}</td>
                            </tr>
                            <tr>
                                <td>{Object.keys(items).includes((String)(playerInfo.item3)) ? <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/item/${playerInfo.item3}.png`} width="35px" height="35px" alt="아이템" /> : <div style={itemEmptyStyle}></div>}</td>
                                <td>{Object.keys(items).includes((String)(playerInfo.item4)) ? <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/item/${playerInfo.item4}.png`} width="35px" height="35px" alt="아이템" /> : <div style={itemEmptyStyle}></div>}</td>
                                <td>{Object.keys(items).includes((String)(playerInfo.item5)) ? <img src={`http://ddragon.leagueoflegends.com/cdn/10.24.1/img/item/${playerInfo.item5}.png`} width="35px" height="35px" alt="아이템" /> : <div style={itemEmptyStyle}></div>}</td>
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
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.participants[0].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td width="65px" style={teamTdStyle}>{teamInfo[0].player.summonerName}</td>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.participants[5].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td width="65px" style={teamTdStyle}>{teamInfo[5].player.summonerName}</td>
                            </tr>
                            <tr>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.participants[1].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo[1].player.summonerName}</td>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.participants[6].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo[6].player.summonerName}</td>
                            </tr>
                            <tr>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.participants[2].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo[2].player.summonerName}</td>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.participants[7].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo[7].player.summonerName}</td>
                            </tr>
                            <tr>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.participants[3].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo[3].player.summonerName}</td>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.participants[8].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo[8].player.summonerName}</td>
                            </tr>
                            <tr>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.participants[4].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo[4].player.summonerName}</td>
                                <td width="18px"><img style={teamImgStyle} src={`http://ddragon.leagueoflegends.com/cdn/10.23.1/img/champion/${champions[gameInfo.participants[9].championId]}.png`} width="18px" height="18px" alt="플레이어"></img></td><td style={teamTdStyle}>{teamInfo[9].player.summonerName}</td>
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
        <div><img src="../../images/loading.gif" weight="100px" height="100px" alt="loading..."/></div>
    )
}

export default Users;