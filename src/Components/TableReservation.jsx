import React, { useEffect, useState,  } from "react";
import ContainerComponent from "./ContainerComponent";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  ButtonGroup,
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  Select,
  InputLabel
} from "@mui/material";
import TableComponent from "./TableComponent";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { useTheme } from "@emotion/react";
import PropTypes from "prop-types";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import QueueIcon from '@mui/icons-material/Queue';
import FlakyIcon from '@mui/icons-material/Flaky';
import EditCalendarRoundedIcon from '@mui/icons-material/EditCalendarRounded';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import BadgeIcon from '@mui/icons-material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import SearchBarAd from "./SearchBarAd";

export default function TableReservation() {

  const server = "localhost:1060"

  useEffect(() => {
    getAllReservations()
    getRoomAvailable()
  }, []);

  const header = [
    "ID",
    "NUMERO DE CHAMBRE",
    "NOM ET PRENOMS",
    "NUMERO",
    "DATE DE RESERVATION",
    "DATE D'ARRIVEE",
    "DATE DE SORTIE",
    "STATUS",
    "ACTIONS"
  ];

  const [rows, setRows] = useState([]);

  const getAllReservations = async () => {
    const response = await axios.get(`http://${server}/api/handles.php?action=getAllRes`);
    const data = response.data[0].reservations;
    const roomObjects = Object.values(data).filter(obj => typeof obj === 'object');
    setRows(roomObjects);
    setFilteredRows(roomObjects)
  };

  function toFormData(f){
    const fd = new FormData();
    for (let key in f){
        if(f.hasOwnProperty(key)){
            fd.append(key,f[key])
        }
    }
    return fd;
}

const [openA,setOpenA] = useState(false)

const [fullName, setFullName] = useState('');
const [isValidName, setIsValidName] = useState(true);

const handleInputNameChange = (event) => {
    const inputValue = event.target.value;
    setFullName(inputValue.trim());
    if (inputValue.trim() === '') {
        setIsValidName(true);
    } else {
        setIsValidName(/^[A-Za-z\s-]+$/.test(inputValue));
    }
};

const [phoneNumber, setPhoneNumber] = useState('');
const [isValidPhone, setIsValidPhone] = useState(true);

const handleInputPhoneChange = (event) => {
    const inputValue = event.target.value;
    setPhoneNumber(inputValue);

    if(inputValue.trim()=== ''){
        setIsValidPhone(true);
    }else if (inputValue.length < 10){
        if((/^\d+$/.test(inputValue))){
            setIsValidPhone(true);
        }else{
            setIsValidPhone(false);
        }
    }else{
        setIsValidPhone(/^03[23489]\d{7}$/.test(inputValue));
    }
};

const [titre, setTitre] = useState('');
const handleSelectChange = (event) => {
    const selectedItem = event.target.value;
    setTitre(selectedItem);
};

const [arrivalDate,setArrivalDate] = useState('')
const [setOffDate,setSODate] = useState('')

const handleArrivalDateChange = (event) => {
  const selectedDate = event.target.value;
  setArrivalDate(selectedDate);
}

const handleSODateChange = (event) => {
  const selectedDate = event.target.value;
  setSODate(selectedDate);
}

const [roomAvailable,setRoomAvailable] = useState([])

const getRoomAvailable = async () =>{
    const response = await axios.get("http://"+server+"/api/handles.php?action=getRoomDet");
        const data = response.data;
        const roomArray = Object.values(data[0]).filter(
            (item) => typeof item === "object"
        );
    setRoomAvailable(roomArray)
}

const validerClick = async ()=>{
    const fd = {
        "fullName": fullName,
        "room_number": titre,
        "phone": phoneNumber,
        "dateA": arrivalDate,
        "dateS": setOffDate
    }

    const postForm = toFormData(fd)
    

    const response = await axios.post("http://localhost:1060/api/handles.php?action=postReservation", postForm);
    if(response.data[0].info === 'success'){
        toast.success(response.data[0].message +' a '+response.data[0].time+". Vous avez 6h pour annuler votre reservation");

    }else{
      console.log("error")
      toast.error(response.data[0].message);
    }
    getAllReservations()
    getRoomAvailable()
    setOpenA(false)
}

const [openM,setOpenM] = useState(false)
const [idRes, setIdRes] = useState('')

const [radioValue, setRadioValue] = useState('Ended');

const handleRadioChange = (event) => {
  setRadioValue(event.target.value);
};

const validerMarque = async ()=>{
  const fd = {
    "id" : idRes,
    "radioValue" : radioValue
  }
  const f = toFormData(fd)
  const response = await axios.post(`http://${server}/api/handles.php?action=marqueRes`,f);
  const data = response.data
  getAllReservations()
  getRoomAvailable()
  setOpenM(false)
  setRadioValue('Ended')
}

const [searchText,setSearchText] = useState('')

const [filteredRows, setFilteredRows] = useState([]);

const handleSearch = (searchText) => {
  const filteredRows = rows.filter((row) =>
      row.full_name.includes(searchText) ||
      row.phone.includes(searchText) ||
      row.stat.includes(searchText)
  );
  setFilteredRows(filteredRows);
};


  return (
    <>
      <ContainerComponent >
        <Card>
          <CardContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              color="#660B32"
              gutterBottom
              variant="h5"
              component="div"
            >
              Reservations
            </Typography>
            <SearchBarAd onSearch={handleSearch}/>
            <Button onClick={()=>{setOpenA(true)}} variant="contained" color="primary" startIcon={<QueueIcon/>} style={{fontWeight:'bolder'}}>Ajouter</Button>
          </CardContent>

          <TableComponent>
            <TableHead>
              <TableRow>
                {header.map((column) => (
                  <TableCell key={column}><b>{column}</b></TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {
                filteredRows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      {row.id}
                    </TableCell>
                    <TableCell>
                      {row.id_room}
                    </TableCell>
                    <TableCell>
                      {row.full_name}
                    </TableCell>
                    <TableCell>
                      {row.phone}
                    </TableCell>
                    <TableCell>
                      {row.reservation_date}
                    </TableCell>
                    <TableCell>
                      {row.check_in_date}
                    </TableCell>
                    <TableCell>
                      {row.check_out_date}
                    </TableCell>
                    <TableCell>
                      {row.stat}
                    </TableCell>
                    <TableCell>
                      <ButtonGroup>
                        <Button onClick={()=>{setOpenM(true);setIdRes(row.id)}} startIcon={<FlakyIcon/>} variant='contained' color="primary" style={{fontWeight:'bolder'}}>
                          Marquer
                        </Button>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </TableComponent>
        </Card>
      </ContainerComponent>
      <ToastContainer/>
      <Dialog open={openA}>
        <DialogContent>
            <h3>Ajouter une reservation</h3>
            <div>
                <InputLabel>Selectionner une chambre</InputLabel>
                <Select fullWidth value={titre} onChange={handleSelectChange}>
                    {
                        roomAvailable.map((room,i)=>(
                          <MenuItem key={i} value={room.room_number.toUpperCase()}>{room.room_number.toUpperCase()}</MenuItem>
                        ))
                    }
                </Select>
                <TextField style={{ marginTop: 15, color: 'whitesmoke'}}
                    label="Nom complet"
                    fullWidth
                    required
                    placeholder='Ex: John Doe'
                    size="medium"
                    value={fullName}
                    onChange={handleInputNameChange}
                    error={!isValidName}
                    helperText={!isValidName ? 'Veuillez entrer un nom valide' : ''}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="start">
                                <BadgeIcon/>
                            </InputAdornment>
                        ),
                    }}
                    
                />
                    <TextField style={{ marginTop: 15, color: 'whitesmoke'}}
                    label="Téléphone"
                    fullWidth
                    required
                    placeholder='Ex: 03X XX XXX XX'
                    size="medium"
                    value={phoneNumber}
                    onChange={handleInputPhoneChange}
                    error={!isValidPhone}
                    helperText={!isValidPhone && phoneNumber !== '' ? 'Veuillez entrer un numéro de téléphone valide' : ''}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="start">
                                <SmartphoneIcon/>
                            </InputAdornment>
                        ),
                    }}
                    inputProps={{
                        maxLength: 10,
                    }}
                    />
                    <TextField style={{ marginTop: 15, color: 'whitesmoke'}}
                        label="Date d'arrivee"
                        type="date"
                        fullWidth
                        required
                        size="medium"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="start">
                                    <EditCalendarRoundedIcon/>
                                </InputAdornment>
                            ),
                        }}
                        value={arrivalDate}
                        onChange={handleArrivalDateChange}
                        
                    />
                
                    <TextField style={{ marginTop: 15, color: 'whitesmoke'}}
                    label="Date de sortie"
                    type="date"
                    fullWidth
                    required
                    size="medium"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="start">
                                <EditCalendarRoundedIcon />
                            </InputAdornment>
                        ),
                    }}
                    value={setOffDate}
                    onChange={handleSODateChange}
                    />
                    <div style={{display:'flex', justifyContent:'end', alignItems:'center'}}>
                        <Button variant='contained' onClick={validerClick} size="large" style={{background:'green', fontWeight:'bold', marginTop: '15px'}}>
                            VALIDER
                        </Button>
                        <Button variant='outlined' onClick={()=>{setOpenA(false)}} color="error" size="large" style={{fontWeight:'bold', marginTop: '15px',marginLeft:'15px'}}>
                            FERMER
                        </Button>
                    </div>
                                
                            
                        </div>
        </DialogContent>
    </Dialog>
    <Dialog open={openM}>
        <DialogContent>
            <h3>Marquer le status une reservation</h3>
            <RadioGroup
              defaultValue="Ended"
              onChange={handleRadioChange}
            >
            <FormControlLabel value="Ended" control={<Radio />} label="Marquer 'Fin de sejours'" />
            <FormControlLabel value="Cancelled" control={<Radio />} label="Marquer 'Annulee'" />
            <FormControlLabel value="On going" control={<Radio />} label="Marquer 'En cours'" />
            </RadioGroup>
              <div style={{display:'flex', justifyContent:'end', alignItems:'center'}}>
                  <Button variant='contained' onClick={()=>{validerMarque()}} size="medium" style={{background:'green', fontWeight:'bold', marginTop: '15px'}}>
                      VALIDER
                  </Button>
                  <Button variant='outlined' onClick={()=>{setOpenM(false)}} color="error" size="medium" style={{fontWeight:'bold', marginTop: '15px',marginLeft:'15px'}}>
                      FERMER
                  </Button>
              </div>
        </DialogContent>
    </Dialog>

    </>
  );
}
function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <>
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
    </>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
}
