import { useEffect, useState } from "react";

import { fetchData, fetchImages, getIDs } from "./api";
import {fetchArtist, fetchPaint} from "./api";
import './style.css';

function Header() {
    return (
      <header className="hero is-dark is-bold">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">Memory game</h1>
          </div>
        </div>
      </header>
    );
  }
  
 

  function Loading() {
    return <p>Loading...</p>;
  }
  
  function Card(url){
    if (urls == null) {
      return <Loading />;
    }
    return (
      <img src="url" />
    )
  }

  function Gallery(props) {
    const urls = props.urls;
    const num = props.value;
    if(urls == null){
      return <Loading />
    }
    return(
      <div>
        <img src={urls[num]} alt="Image"/>
      </div>
    );
  }

  
  async function DecideIDs(props){
    let IDs_array1 = props;
    let IDs_array = JSON.parse(JSON.stringify(IDs_array1));
    let ID_count = IDs_array.length;
    const min = 0;
    let tmp_array = Array(8);
    for(let i = 0; i < 8 ; i++){
        const random_ID = Math.floor( Math.random() * (ID_count + 1 - min) ) + min ;
        const Name = await fetchData(IDs_array[random_ID]);
        tmp_array.unshift(Name);
    }
    const responce = Promise.all(tmp_array);
    return responce;
  }

  

  async function getPaintURLs(props){
    const objectIDs = props;
    let tmp_URLs = Array(16);
    console.log(objectIDs);
    for(let i = 0; i <16; i++ ){
      if(isNaN(objectIDs[i]) == false){
        console.log(objectIDs[i]);
        const URL = await fetchPaint(objectIDs[i]);
        tmp_URLs.unshift(URL);
      }
    }
    const responce = Promise.all(tmp_URLs);
    return responce;
  }

  

  async function getListofSameName(props){
    const names = props;
    let list = Array(8);
    for(let i =0 ; i < 8; i++){
      const responce = await fetchArtist(names[i]);
      list[i] = responce;
    }
    const responce =Promise.all(list);
    return responce;
  }

  function Decide_two_IDs(props){
    const sameNameIDList = props;
    const tmp_IDs = Array(16);
      for( let i = 0; i < 8 ; i++ ){
        if(sameNameIDList[i] == null){
          tmp_IDs[2*i] = "nothing"
          tmp_IDs[2*i +1 ] = "nothing";
        }else{
          let tmp_array = JSON.parse(JSON.stringify(sameNameIDList[i]));
          const max = tmp_array.length;
          const min = 0;
          const Random_element1 = Math.floor( Math.random() * (max + 1 - min) ) + min ;
          const Random_element2 = Math.floor( Math.random() * (max + 1 - min) ) + min ;
          tmp_IDs[2*i] = tmp_array[Random_element1];
          tmp_IDs[2*i +1 ] = tmp_array[Random_element2];
        }
      }
      return tmp_IDs;

    }

  
  function Main() {
    const [IDs, setIDs] = useState(null);
    const [cards, setCards] =useState(null);
    const [names , setNames] = useState(null);
    const [sameNameIDList , setIDList] = useState(null);
    const [objectIDs, setObjectIDs] = useState(null);
    const [paintURLs, setPaintURLs] =useState(null);
    useEffect( ()=> {
      getIDs().then( (IDs) => { 
      setIDs(IDs);

    });
   } ,[] );

   useEffect( ()=> { 
     DecideIDs(IDs).then( (names) => {
       setNames(names);
       
      });
     }, [IDs]);

     useEffect( ()=> {
      getListofSameName(names).then( (sameNameIDList)=>{
        console.log(names);
        setIDList(sameNameIDList);
        const responce = Decide_two_IDs(sameNameIDList);
        setObjectIDs(responce);
      });
    },[names] );

    useEffect(  ()=> {
      getPaintURLs(objectIDs).then( (paintURLs)=>{
        setPaintURLs(paintURLs);
        console.log(paintURLs);
      });
    },[objectIDs]);

    

    

    return (
      <main>
        <div>
          <div className="board-row">
            <Gallery urls={paintURLs} value = {0} />
            <Gallery urls={paintURLs} value = {1} />
            <Gallery urls={paintURLs} value = {2} />
            <Gallery urls={paintURLs} value = {3} />
          </div>
          <div className="board-row">
          <Gallery urls={paintURLs} value = {4} />
          <Gallery urls={paintURLs} value = {5} />
          <Gallery urls={paintURLs} value = {6} />
          <Gallery urls={paintURLs} value = {7} />
          </div>
          <div className="board-row">
        
          </div>
          <div className="board-row">
          
          </div>
        </div>
      </main>
    );
  }
  
  function Footer() {
    return (
      <footer className="footer">
        <div className="content has-text-centered">
          <p>The Metropolitan Museum of Art Collection API</p>
          <p>
            <a href="https://github.com/metmuseum/openaccess"></a>
          </p>
        </div>
      </footer>
    );
  }
  
  function App() {
    return (
      <div>
        <Header />
        <Main />
        <Footer />
      </div>
    );
  }
  
  export default App;