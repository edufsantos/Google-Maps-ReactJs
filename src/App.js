import React,{useState, useEffect} from "react";
import axios from 'axios'
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";

import {
  withGoogleMap,
  GoogleMap,
  Marker,
} from "react-google-maps";


export default function App() {
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState({
    lat: -20.4997288,
    lng: -54.6441306
  });

  useEffect(() => {
      // navigator.geolocation.getCurrentPosition(position => {
      //   console.log(position)
      //   setCoordinates({
      //           lat: position.coords.latitude,
      //           lng: position.coords.longitude,
      //   })
      // })
      
  },[])
  const [complementos, setComplementos] = useState({
    numero: null,
    rua: '',
    bairro: '',
    cidade:  '',
    estado: '',
    cep: null
  })
  const API_KEY = 'AIzaSyDnbHQ_2Q9POiAFe6k6D0iW3XiNicNNvdE'
  const MapWithAMarker = withGoogleMap(props =>
    <GoogleMap
      defaultZoom={17}
      defaultCenter={{ lat:coordinates.lat, lng: coordinates.lng }}
      
    >
      <Marker
        draggable={true}
        onDragEnd={(e) => {
          const latlong = e.latLng,
                lat = latlong.lat(),
                lng = latlong.lng();
          setCoordinates({
            lat,
            lng
          })
          axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${API_KEY}`)
               .then((res)=>{
                const arrayResults = res.data.results[0].address_components
                console.log(arrayResults)
                setComplementos({
                  numero: arrayResults[0].long_name,
                  rua:arrayResults[1].long_name,
                  bairro: arrayResults[2].long_name,
                  cidade:  arrayResults[3].long_name,
                  estado: arrayResults[4].long_name,
                  cep: arrayResults[6] ? arrayResults[6].long_name : null
                })
          })
          
        }}
        position={{ lat:coordinates.lat, lng: coordinates.lng }}
      />
    </GoogleMap>
  );


  const handleSelect = async value => {
    const results = await geocodeByAddress(value);
    const latLng = await getLatLng(results[0]);
    const abvResults = results[0].address_components;
    console.log(abvResults[0])
    console.log('results', results[0].address_components)

    setAddress(value);

    setComplementos({
      numero: abvResults[0].long_name,
      rua:abvResults[1].long_name,
      bairro: abvResults[2].long_name,
      cidade:  abvResults[3].long_name,
      estado: abvResults[4].long_name,
      cep: abvResults[6] ? abvResults[6].long_name : null
    })
    setCoordinates(latLng);
  };

  return (
    <div>
      <MapWithAMarker
          containerElement={<div style={{ height: `400px` }} />}
          mapElement={<div style={{ height: `100%` }} />}
        />

          <div className="auto-Complete">
          <PlacesAutocomplete
            value={address}
            onChange={setAddress}
            onSelect={handleSelect}
          >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
              <div>
                <p>Latitude: {coordinates.lat}</p>
                <p>Longitude: {coordinates.lng}</p>
                <p>rua: {complementos.rua}</p>
                <p>bairro: {complementos.bairro}</p> 
                <p>numero: {complementos.numero}</p> 
                <p>cidade: {complementos.cidade}</p> 
                <p>estado: {complementos.estado}</p> 
                <p>cep: {complementos.cep}</p>   

                
                        
            <input {...getInputProps({ placeholder: "Type address" })} />

                <div style={{width: '500px'}}>
                  {loading ? <div>...loading</div> : null}

                  {suggestions.map(suggestion => {
                    const style = {
                      backgroundColor: suggestion.active ? "#41b6e6" : "#fff"
                    };

                    return (
                      <div {...getSuggestionItemProps(suggestion, { style })}>
                        {suggestion.description}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </PlacesAutocomplete>
          </div>
        
    </div>
  );
}
