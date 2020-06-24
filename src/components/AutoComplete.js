import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import parse from 'autosuggest-highlight/parse';
import throttle from 'lodash/throttle';
import  { getLatLng, geocodeByAddress} from "react-places-autocomplete";
import axios from 'axios'
const autocompleteService = { current: null };
const API_KEY = 'AIzaSyDnbHQ_2Q9POiAFe6k6D0iW3XiNicNNvdE'

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
  },
  inputs: {
    margin: '10px 0',
    height: '50px',
    width: '100%',
  },
}));


export default function GoogleMaps({setCoordinates, setComplementos,setFormattedAddress }) {
  const classes = useStyles();
  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState([]);
  const fetch = React.useMemo(
    () =>
      throttle((request, callback) => {
        autocompleteService.current.getPlacePredictions(request, callback);
      }, 200),
    [],
  );

  React.useEffect(() => {
    let active = true;
    if (!autocompleteService.current && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }
    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }
    fetch({ input: inputValue }, (results) => {
      if (active) {
        let newOptions = [];

        if (value) {
          newOptions = [value];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
    
  }, [value, inputValue, fetch]);

  return (
    <Autocomplete
      id="google-map-demo"
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.description)}
      filterOptions={(x) => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value}
      onChange={ async (event, newValue) => {
        const value = await geocodeByAddress(newValue ? newValue.description : '');
        const latLng = await getLatLng(value[0])
        await setCoordinates(latLng)
        const lat = latLng.lat,
              lng = latLng.lng
        axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`)
         .then((res)=>{
          console.log(res)
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
        


        // const addressComponent = value[0].address_components;
        setFormattedAddress(newValue ? newValue.description : '');
        
        // if(addressComponent.length === 7 ){
        //   console.log('7')
        //   setComplementos({
        //     numero: addressComponent[0].long_name,
        //     rua:addressComponent[1].long_name,
        //     bairro: addressComponent[2].long_name,
        //     cidade:  addressComponent[3].long_name,
        //     estado: addressComponent[4].long_name,
        //     cep: addressComponent[6] ? addressComponent[6].long_name : null
        //   })
        // }
        // else if(addressComponent.length === 6 ){
        //   console.log('6')
        //   setComplementos({
        //     numero: null,
        //     rua: addressComponent[0].long_name,
        //     bairro: addressComponent[1].long_name,
        //     cidade:  addressComponent[2].long_name,
        //     estado: addressComponent[3].long_name,
        //     cep: addressComponent[5] ? addressComponent[5].long_name : null
        //   })
        // }else {
        //   console.log('4')

        //   setComplementos({
        //     numero: null,
        //     bairro: addressComponent[0].long_name,
        //     cidade:  addressComponent[1].long_name,
        //     estado: addressComponent[2].long_name,
        //   })
        // }
        
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue ? newInputValue : null);
      }}
      renderInput={(params) => (
        <TextField className={classes.inputs} {...params} label="Informe seu endereço" variant="outlined" fullWidth />
      )}
      renderOption={(option) => {
        const matches = option.structured_formatting.main_text_matched_substrings;
        const parts = parse(
          option.structured_formatting.main_text,
          matches.map((match) => [match.offset, match.offset + match.length]),
        );

        return (
          <Grid container alignItems="center">
            <Grid item>
              <LocationOnIcon className={classes.icon} />
            </Grid>
            <Grid item xs>
              {parts.map((part, index) => (
                <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                  {part.text}
                </span>
              ))}

              <Typography variant="body2" color="textSecondary">
                {option.structured_formatting.secondary_text}
              </Typography>
            </Grid>
          </Grid>
        );
      }}
    />
  );
}











