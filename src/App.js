import React,{useState,useEffect} from "react"
import axios from 'axios'
import { TextField,MenuItem } from '@material-ui/core';
import AutoComplete from './components/AutoComplete';
import {
  withGoogleMap,
  GoogleMap,
  Marker,
} from "react-google-maps"
import {  FaMapMarkerAlt } from 'react-icons/fa';

// import {FaMapMarker} from 'react-icons/fa'
import './styles.css'
import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles((theme) => ({
  inputs: {
    margin: '10px 0',
    height: '50px',
    width: '100%',
    borderRadius: '15px'
  },
  inputs2:{
    width: '35%',
    borderRadius: '15px'
  },
  inputs1:{
    height: '50px',
    width: '60%',
    borderRadius: '15px'
  }
}));
export default function App() {
  const classes = useStyles();
  const currencies = [
    {
      value: 'Masculino',
    },
    {
      value: 'Feminino',
    },
  ];
  const [initialPosition, setInitialPOsition] = useState({})
  const [coordinates, setCoordinates] = useState({
    lat: null,
    lng: null
  });
  const [formattedAddress,setFormattedAddress] = useState('')
  const [currency, setCurrency] = React.useState('Selecione');
  const [complementos, setComplementos] = useState({
    numero: null,
    rua: '',
    bairro: '',
    cidade:  '',
    estado: '',
    cep: null
  });
  const Endereços = `${complementos.rua}-${complementos.cep}, ${complementos.numero} - ${complementos.bairro}, ${complementos.cidade} - ${complementos.estado}`
  
  const [cpf, setCpf] = useState('')
  const  [isOpen,setIsOpen] = useState(true)
  const API_KEY = 'AIzaSyDnbHQ_2Q9POiAFe6k6D0iW3XiNicNNvdE'

  function cpfMask(value){
    return value
      .replace(/\D/g, '') // substitui qualquer caracter que nao seja numero por nada
      .replace(/(\d{3})(\d)/, '$1.$2') // captura 2 grupos de numero o primeiro de 3 e o segundo de 1, apos capturar o primeiro grupo ele adiciona um ponto antes do segundo grupo de numero
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1') // captura 2 numeros seguidos de um traço e não deixa ser digitado mais nada
  }
  function handleChangeCpf(e){
      e.preventDefault();
      setCpf(cpfMask(e.target.value))
  }
  function handleDragCoords(e){
    const latlong =  e.latLng;
    const lat =   latlong.lat();
    const lng =  latlong.lng();

    setCoordinates({
      lat,
      lng
    });

    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`)
         .then((res)=>{
          setFormattedAddress(res.data.results[0].formatted_address)
          const arrayResults = res.data.results[0].address_components
          setComplementos({
            numero: arrayResults[0].long_name,
            rua:arrayResults[1].long_name,
            bairro: arrayResults[2].long_name,
            cidade:  arrayResults[3].long_name,
            estado: arrayResults[4].long_name,
            cep: arrayResults[6] ? arrayResults[6].long_name : null
          })
    })
  }
  const MapWithAMarker = React.useCallback( withGoogleMap(props => 
      <GoogleMap 
          defaultOptions={{ 
            mapTypeControl: false,
            zoomControl: true,
            draggableCursor: 'default',
            draggingCursor: 'move',
            scrollwheel: false,
            streetViewControl: false,
          }}
        defaultZoom={18}
        defaultCenter={coordinates}
      >
        <Marker
            draggable={true}
            onDragEnd={handleDragCoords}
            position={coordinates}
        />
      </GoogleMap>
  ),[coordinates])
  useEffect(() => {
    if(formattedAddress === ''){
      setIsOpen(false)
      console.log(isOpen)
    }
    else{
      setIsOpen(true)
    }
  },[formattedAddress, isOpen]);


   navigator.geolocation.getCurrentPosition((position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      setInitialPOsition(pos)
    });
  
 

  function handleMatrixDistance(){
   

    var origin1 = new window.google.maps.LatLng(initialPosition.lat,initialPosition.lng);
    var destinationB = new window.google.maps.LatLng(coordinates.lat, coordinates.lng);

    var service = new window.google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
      {
        origins: [origin1],
        destinations:  [destinationB],
        travelMode: 'DRIVING',
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidTolls: false,
        avoidHighways: false
      }, callback);

      function callback(response, status) {
        console.log('callback',response)
        const {distance, duration} = response.rows[0].elements[0] ;
        console.log('distancia', distance);
        console.log('duration', duration)

        if(distance.value <= 100 ){
          console.log('Estou no local ')
        }
        else{
          console.log('não estou no local')
        }

        // See Parsing the Results for
        // the basics of a callback function.
      }
  } 
  
  function handleSubmitForm(e){
    console.log('entrous')
  }
  return (
    <div className="conteudo-center">
          <h1>CADASTRO GESTOR FOOD</h1>   
          <div className="auto-Complete"> 
            <form action={handleSubmitForm}>
              <TextField className={classes.inputs} id="outlined-basic" label="Nome" variant="outlined" />
              <div className="data-sexo">
                <TextField className={classes.inputs1} type="date" id="outlined-date"  variant="outlined" />
                <TextField
                  className={classes.inputs2} 
                  id="outlined-select-currency"
                  select
                  label="selecione"
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value);
                  }}
                  variant="outlined"
                >
                  {currencies.map((option) => (
                    <MenuItem key={option.value} value={option.value}>                   
                      {option.value}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
             
              <TextField className={classes.inputs} id="outlined-basic" label="CPF" onChange={handleChangeCpf} value={cpf} variant="outlined" />
              <TextField className={classes.inputs} id="outlined-basic" type="Email" label="E-Mail" variant="outlined" />
              <AutoComplete
                setFormattedAddress={setFormattedAddress}
                setComplementos={setComplementos}
                setCoordinates={setCoordinates}
              />
            </form> 
          </div>
          { complementos.cep &&
            <div className="AddressFormated" >
              <FaMapMarkerAlt size={20} color="red" style={{marginRight: '5px'}}/>
              <h1>{Endereços}</h1> 
            </div>
          } 
            <MapWithAMarker
              containerElement={       
                <div style={{  height: `400px`, borderRadius: '20%' }} />
              }
              mapElement={
                <div style={{   height: `100%`, width: '100%', borderRadius: '15px',  boxShadow: '9px 9px 5px 0px rgba(44, 50, 50, 0.14)'  }} />
              }
            />
            <button onClick={handleMatrixDistance}>ver distancia</button>
    </div>
  );
}
