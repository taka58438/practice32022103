
import { useEffect, useState } from "react";
import { render } from "react-dom";

import './style.css';

function Header() {
    return (
      <header className="hero is-dark is-bold">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">Guess The Same Artist</h1>
            <p>作者が同じ作品を当てるゲーム</p>
          </div>
        </div>
      </header>
    );
  }

function Footer() {
    return (
      <footer className="footer">
        <div className="content has-text-centered">
          <p>The Metropolitan Museum of Art Collection API</p>
            <a href="https://github.com/metmuseum/openaccess"></a>
            <p>日本大学文理学部 情報科学科 Webプログラミング演習課題</p>
            <p>5420015 高見之斗</p>
        </div>
      </footer>
    );
}

async function getIDList(){
  const response = await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?artistOrCulture=true&hasImages=true&q=`
);
  const data = await response.json();
  return data.objectIDs;
}

async function getDataFromID(ID){
  const response = await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/objects/${ID}`
  );
  const data = await response.json();
  return data;
}

async function getSameArtistList(name){
  const responce = await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${name}`
  );
  const data = await responce.json();
  return data.objectIDs;
}

async function getURLFromSameArtist(List){
  const ListLength = List.length -1;
  let min = 0;
  for( let c  = 0; c < 20 ;c ++){
    let random_ID = Math.floor( Math.random() * (ListLength + 1 - min) ) + min ;
    const ID_data = await getDataFromID(List[random_ID]);
    const ID_url = ID_data.primaryImage;
    if(ID_url != "" && typeof ID_url != "undefined" ){
      return ID_url;
    }
    if(c == 19){
      console.log("getDataFailure");
        return "failure";
    }
  }
}



async function getTwoCards(props){
  //ランダムに2つの同じ作者のURLを返す
  const IDList = props;
  let IDList_array = JSON.parse(JSON.stringify(IDList));
  let ID_count = IDList_array.length;
  let min = 0;
  const random_ID = Math.floor( Math.random() * (ID_count + 1 - min) ) + min ;
  const Data = await getDataFromID(random_ID);
  //名前が無い場合失敗
  if(Data.artistDisplayName == ""){
    console.log("miss");
    return "failure";
  }
  const artistDisplayName = Data.artistDisplayName;
  //同じ作者ののIDListを取得する
  const sameNameIDList = await getSameArtistList(artistDisplayName);
  let sameNameIDList_array = JSON.parse(JSON.stringify(sameNameIDList));
  let sameNameCount = sameNameIDList_array.length;
  //同じ作者の作品が２個未満の場合失敗
  if(sameNameCount < 2){
    return "failure";
  }
  //同じ作者の作品一覧からランダムに2つのデータを取ってくる
  //最大5回まで再試行(関数化してPromise.allしたほうが良い)
  const two_of_urls = Array(2);
  for(let i = 0; i < 2 ; i++){
      two_of_urls[i] = getURLFromSameArtist(sameNameIDList_array);
  }
  const two_of_urls_res =  await Promise.all(two_of_urls);
  const response = [
    {
      url: two_of_urls_res[0],
      clicked: false,
      artistDisplayName: artistDisplayName,
      status: "normal"
    },
    {
      url: two_of_urls_res[1],
      clicked: false,
      artistDisplayName: artistDisplayName
    }
  ];
  return response;
}

function Loading() {
  return <p>Loading...</p>;
}

function shuffleArray(array){
  let new_array = array;
  let length = array.length-1;
  let shuffle = 10;
  let min = 0;
  for(let i = 0; i < shuffle ; i++){
    const random1 = Math.floor( Math.random() * (length + 1 - min) ) + 0 ;
    const random2= Math.floor( Math.random() * (length + 1 - min) ) + 0 ;
    let tmp = new_array[random1];
    new_array[random1] = new_array[random2];
    new_array[random2] = tmp;
  }

  return new_array;
}

async function generateCard(props){
  //2枚セットで取得し,２枚取れなければ取得できるまで繰り返す.
  const IDList = props;
  for(let i = 0; i < 20; i++){//最大i回まで再試行
    const twoCards = await getTwoCards(IDList);
    if(twoCards != "failure"){
      return twoCards;
    }else{
      console.log("failure");
    }

  }
  return "ALLfailure";
}

async function getCards(count , IDList){
  const Cards = Array(count);
  for(let i = 0; i < count; i++){
    const response = generateCard(IDList);
    Cards[i] = response;
  }
  //nowStudying:Promise.allは揃えるだけawaitで揃えたのを待つ
  const response_all = await Promise.all(Cards);
  return response_all;
}

function Main(){
  const [hasImageObjectList , sethasImageObjectList ] = useState(null);
  const [cards , setCards] = useState(null);
  const [nowSelect, setNowSelect] = useState(null);
  const [game , setGame] = useState(null);
  useEffect( ()=>{
    getIDList().then( (IDs)=>{
      sethasImageObjectList(IDs);
      console.log("IDs",IDs);
    });
  } , [] );

  useEffect( ()=> {
    getCards(4 , hasImageObjectList).then( (data)=>{
      console.log(data);
      //２枚ずつ得たカードを切り分ける
      //配列中の配列をバラバラにする方法はmapをさらにmapしてpushする.
      const sliced_data = [];
      data.map( (value)=>{
        value.map( (one_of_card)=>{
          sliced_data.push(one_of_card);
        });
      });
      //得たカードの順番をランダムにする
      let sliced_data_shuffled = shuffleArray(sliced_data);
     //非同期？
      setCards(sliced_data_shuffled);
      console.log("cards",sliced_data);
    });
  },[hasImageObjectList]);

  useEffect( ()=> {
    let clear = true;
    if(cards != null){
      cards.map(  (card)=>{
        if(card.status != "clear"){
          clear =false;
        }
      });
      if(clear == true){
        setGame("clear");
        console.log("clear");
      }
    }
  } , [cards]);

  function searchSameArtist(num){
    let response = null;
    cards.map( (card, index)=>{
      if(card.artistDisplayName == cards[num].artistDisplayName && index != num){
        response = index;
      }
    });
    return response;
  }

  function Judge(num){
    let tmp_cards = [...cards];
    if(nowSelect == null){
      setNowSelect(num);
    }else{
      if(cards[num].artistDisplayName == cards[nowSelect].artistDisplayName){
        
        tmp_cards[num].status = "clear";
        tmp_cards[nowSelect].status = "clear";
        console.log("clear");
      }else{
        tmp_cards[nowSelect].status = "failure";
        const sameArtistNum =  searchSameArtist(nowSelect);
        tmp_cards[sameArtistNum].status = "failure";
        console.log("reject");
      }
      tmp_cards[num].clicked = false;
      tmp_cards[nowSelect].clicked = false;
      setCards(tmp_cards);
      setNowSelect(null);
    }

  }
  

  function RenderCards(props){
    //nowStudying一度スプレッド構文を使用すると再レンダリングされるようになる
    function clickedPanel(num){
      let new_cards= [...cards];
      if(new_cards[num].clicked == false){
        new_cards[num].clicked = true;
        Judge(num);
      }else if(new_cards[num].clicked == true){
        new_cards[num].clicked =false;
        setNowSelect(null);
      }
      
      setCards(new_cards);
      console.log("clicked",new_cards[num]);
    }

    
    const {cards} = props;
    if(cards == null){
      return <Loading />;
    }
    //return (<div><img src ={cards[0].url1} alt="pic"/></div>);
    return(
      <div className ="panels">
        {
          cards.map( (card,index)=>{
            if(card.status == "clear" ){
              return(
                <div className="clear">
                  <img src = {card.url}  alt= "noImage"  />
                  <p>correct</p>
                </div>
              );
            }else if(card.status == "failure"){
              return(
                <div className="failure">
                <img src = {card.url}  alt= "noImage" />
                <p>incorrect</p>
              </div>
              );
            }
            if(card.clicked ==true){
              return(
                <div className="clicked">
                <img src = {card.url}  alt= "noImage" 
                onClick = { ()=>{
                  clickedPanel(index);
                }
                } />
              </div>
              );
            }
            return (
              <div>
                <img src = {card.url}  alt= "noImage" 
                onClick = { ()=>{
                  clickedPanel(index);
                }
                } />
              </div>
            );
            
          })
        }
      </div>
    );
  
  }

  

  return (
    <main>
      <div>
        <RenderCards cards={cards} />
      </div>
    </main>
  );
}


function App(){
    return(
        <div>
            <Header />
            <Main />
            <Footer />
        </div>
    );
}

export default App;