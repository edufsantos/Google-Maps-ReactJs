import React,{useState} from "react"
import axios from 'axios'
import { TextField,MenuItem } from '@material-ui/core';
import AutoComplete from './components/AutoComplete';
import {
  withGoogleMap,
  GoogleMap,
  Marker,
} from "react-google-maps"
import './styles.css'
import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles((theme) => ({
  inputs: {
    margin: '10px 0',
    height: '50px',
    width: '100%'
  },
  inputs2:{
    width: '35%',
  },
  inputs1:{
    width: '60%',
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
  const [coordinates, setCoordinates] = useState({
    lat: -20.4997288,
    lng: -54.6441306
  });
  const [currency, setCurrency] = React.useState('Selecione');
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
        onDragEnd={async (e) => {
          const latlong =  e.latLng;
          const lat =   latlong.lat(),
                lng =  latlong.lng();
          await setCoordinates({
            lat,
            lng
          })
          axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${API_KEY}`)
               .then((res)=>{
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
          
        }}
        position={{ lat:coordinates.lat, lng: coordinates.lng }}
      />
    </GoogleMap>
  );
  // const handleSelect = async value => {
  //   const results = await geocodeByAddress(value);
  //   console.log('value', value)
  //   console.log('results', results)

  //   const latLng = await getLatLng(results[0]);

  //   const abvResults = results[0].address_components;

  //   setAddress(value);

  //   setComplementos({
  //     numero: abvResults[0].long_name,
  //     rua:abvResults[1].long_name,
  //     bairro: abvResults[2].long_name,
  //     cidade:  abvResults[3].long_name,
  //     estado: abvResults[4].long_name,
  //     cep: abvResults[6] ? abvResults[6].long_name : null
  //   })
  //   setCoordinates(latLng);
  // };
 
  return (
    <div className="conteudo-center">
          <h1>CADASTRO GESTOR FOOD</h1>    
          <div className="auto-Complete"> 
            <form action="">
              <TextField className={classes.inputs} id="outlined-basic" label="Nome" variant="outlined" />
              <div className="data-sexo">
                <TextField className={classes.inputs1} type="date" id="outlined-date"  variant="outlined" />
                <TextField
                  className={classes.inputs2} 
                  id="outlined-select-currency"
                  select
                  label="Select"
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
             
              <TextField className={classes.inputs}id="outlined-basic" label="CPF" variant="outlined" />
              <TextField className={classes.inputs} id="outlined-basic" type="Email" label="E-Mail" variant="outlined" />
              <div className="data-sexo">
                <TextField className={classes.inputs1} id="outlined-basic" type="text" label="Rua" value={complementos.rua === null ?  '' : complementos.rua  } variant="outlined" />
                <TextField className={classes.inputs2} id="outlined-basic" type="text" label="Número" value={complementos.numero === null ?  '' : complementos.numero  } variant="outlined" />
              </div>
              <TextField className={classes.inputs} id="outlined-basic" type="text" label="Bairro" value={complementos.bairro === null ?  '' : complementos.bairro  } variant="outlined" />
             
              <AutoComplete
                setComplementos={setComplementos}
                setCoordinates={setCoordinates}
              />
              {/* <PlacesAutocomplete
                value={address}
                onChange={setAddress}
                onSelect={handleSelect}
                >
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                  <div className="">
                
                    <input className="AutoCompleteInput" {...getInputProps({ placeholder: "Informe seu endereço..." })} />
                      <div style={{width: '100%'}}>
                        {loading ? <div>...Carregando</div> : null}
                        {suggestions.map(suggestion => {
                          const style = {
                            position: 'relative',
                            zIndex: '1000',
                            boxSizing: 'border-box',
                            padding: '5px',
                            width: '300px',
                            maxWidth: '300px',
                            border: '1px solid #333',
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
                </PlacesAutocomplete> */}
            </form> 
            </div>
            <MapWithAMarker
              containerElement={
                <div style={{ position: 'relative', height: `400px` }} />
              }
              mapElement={
                <div style={{   height: `100%`, width: '100%' }} />
              }
            />
    </div>
  );
}
