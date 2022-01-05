
  export async function getIDs() {
    const response = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?artistOrCulture=true&hasImages=true&q=`
    );
    const data = await response.json();
    return data.objectIDs;
  }

 

  export async function fetchData(ID){
    const response = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${ID}`
    );
    const data = await response.json();
    return data.artistDisplayName;
  }

  export async function fetchArtist(name){
    const responce = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${name}`
    );
    const data = await responce.json();
    return data.objectIDs;
  }

  export async function fetchPaint(ID){
    const responce = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${ID}`
      );
    const data = await responce.json();
    return data.primaryImage;
  }