import { Box, Button, CircularProgress, Paper, styled, Tooltip } from '@mui/material'
import { blue, blueGrey, grey, indigo, pink, purple } from '@mui/material/colors'
import {Fragment, useState, useRef, useEffect, memo} from 'react'
import LocationForm from '../components/LocationForm'
import { useLocationDB } from '../contexts/LocationDBContext'

import AddCircleIcon from '@mui/icons-material/AddCircle';

import Alert from '../components/Alert'
import { DataGrid } from '@mui/x-data-grid';
import Draggable from 'react-draggable';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import StreamForm from '../components/StreamForm';
import EditIcon from '@mui/icons-material/Edit';
import RemoveForm from '../components/RemoveForm';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useStreamDB } from '../contexts/StreamDBContext'


// Define the DataTable Column Setup
// field follow the database key
const DISPLAY_ID_LENGTH = 10

const columns = [
  { field: 'id',
    headerName: 'ID',
    width: 150,
    renderCell: (params)=> `${params.value.substring(0, DISPLAY_ID_LENGTH)}...` },
  { field: 'name', headerName: 'Location Name', width: 200 },
  { field: 'address', headerName: 'Address', width: 200 },
  { field: 'parkingSiteInfoJSON', headerName: 'Parking Site Info', width: 500 }
  
];


const LocationResBoard = () => {

    const {
        alertStream,
        isDBLoading : isStreamDBLoading,
        currentUserOwnedStream
      } = useStreamDB()

    const {

        alertLocationDB, setAlertLocationDB,
        isDBLoading : isLocationDBLoading, 
        setDBIsLoading,
        currentUserOwnedLocation,
        deleteLocationRes
    } = useLocationDB()


    const [selectedLocations, setSelectedLocations] = useState([])
    const [selectedDelLocationsName, setSelectedDelLocationsName] = useState([])

    const [openCreateEditDialog, setOpenCreateEditDialog] = useState(false);
    const [editForm, setEditForm] = useState({})

    const [openDelDialog, setOpenDelDialog] = useState(false);

    const handleLocationSelection = (newSelection)=>{

        setSelectedLocations(newSelection);
    }

    useEffect(()=>{
        setAlertLocationDB({isOpen: false, message: ""})
    }, [])

    const HtmlTooltip = styled(({ className, ...props }) => (
        <Tooltip {...props} classes={{ popper: className }} />
      ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
          backgroundColor: grey[100], //'#f5f5f9',
          color: 'rgba(0, 0, 0, 0.9)',
          maxWidth: 150,
          fontSize: theme.typography.pxToRem(12),
          border: '0px solid',
        },
      }));
    
      const PaperComponent = memo(({ nodeRef, ...props }) => {
        return (
          <Draggable nodeRef={nodeRef}
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
          >
            <Paper ref={nodeRef} sx={{ borderRadius: '8px' }} {...props} />
          </Draggable>
        );
      });

      const LocationResDialog = memo(() => {

        const dialogNodeRef = useRef(null);
    
        return (
          <Fragment>
            <Dialog
              open={openCreateEditDialog}
              onClose={() => setOpenCreateEditDialog(false)}
              PaperComponent={(props) => (
                <PaperComponent {...props} nodeRef={dialogNodeRef} />
              )}
              aria-labelledby="draggable-dialog-title"
              sx={{
                "& .MuiDialog-paper": {
                    maxWidth: "800px", // Set your desired max width
                },
              }}
            >
              <DialogTitle style={{ cursor: 'move', textAlign: 'center' }} id="draggable-dialog-title">
                {Object.keys(editForm).length <= 0 ? "Create" : "Edit"} Location Resources
              </DialogTitle>
              <DialogContent>
                <Paper style={{
                  height: '100%',
                  width: '600px',
                  display: 'flex',
                  marginTop: '10px',
                  flexDirection: 'column', gap: '20px',
                  justifyContent: 'center', alignItems: 'center'
                }}
                  elevation={0}>
    
                  <LocationForm setOpenDialog={setOpenCreateEditDialog}
                                currentAllStreamResObj={currentUserOwnedStream}
                                currentLocationForm={editForm}/>
    
                </Paper>
              </DialogContent>
            </Dialog>
          </Fragment >
        );
      });

      const DeleteDialog = memo(() => {

        const dialogNodeRef = useRef(null);
    
        return (
            <Fragment>
                <Dialog
                    open={openDelDialog}
                    onClose={()=>setOpenDelDialog(false)}
                    PaperComponent={(props) => (
                        <PaperComponent {...props} nodeRef={dialogNodeRef} />
                    )}
                    aria-labelledby="draggable-dialog-title"
                >
                    <DialogTitle style={{ cursor: 'move', textAlign: 'center' }}
                                 sx={{color:pink[800]}}
                                 id="draggable-dialog-title">
                        Delete Location Resources
                    </DialogTitle>
                    <DialogContent>
                        <Paper style={{
                            height: '100%',
                            display: 'flex',
                            marginTop: '10px',
                            flexDirection: 'column', gap: '20px',
                            justifyContent: 'center', alignItems: 'center'
                        }}
                            elevation={0}>
    
                            <RemoveForm removeFromDB={async()=>{
                                    await deleteLocationRes({idList:selectedLocations})
                                    setSelectedLocations([]);
                                  }}
                                        itemList={selectedDelLocationsName}
                                        setDBIsLoading={setDBIsLoading}
                                        categoryName={'confirm delete'}
                                        targetName={'confirm delete'}
                                        setOpenDialog={setOpenDelDialog}/>
    
                        </Paper>
                    </DialogContent>
                </Dialog>
            </Fragment >
        );
    });

    const handleCreateNewLocationRes = ()=>{
 
        // Clear the edit form to set as a new Creation
        setEditForm({});
        setSelectedLocations([]);
        setOpenCreateEditDialog(true);
    }

    const handleEditLocationRes = ()=>{

        let errMsg = ""
        if (selectedLocations.length <= 0)
        {
            errMsg = "Please Select A Location Before Edit";
        }
        else if (selectedLocations.length != 1)
        {
            errMsg = "Please Select Only One Location To Edit";
        }

        if (errMsg)
        {
            setAlertLocationDB({...alertLocationDB,
                            toggle: !alertLocationDB.toggle,
                            message: errMsg,
                            color: 'error',
                            isOpen: true, hideDuration: 2000,
                            handleCLose: ()=>{setAlertLocationDB({isOpen: false, message:""})} });
        }
        else
        {
            const selectedForm = currentUserOwnedLocation.filter((location)=>location.id == selectedLocations.at(-1))[0] // set the last one in the list into the edit form
            console.log(selectedForm);
            setEditForm(selectedForm);
            setSelectedLocations([]);
            setOpenCreateEditDialog(true);
        }
    }

    const handleDeleteLocationRes = ()=>{
 
        let errMsg = ""
        if (selectedLocations.length <= 0)
        {
          errMsg = "Please Select One or More Location(s) Before Delete";
        }
    
        if (errMsg)
        {
            setAlertLocationDB({...alertLocationDB,
                            toggle: !alertLocationDB.toggle,
                            message: errMsg,
                            color: 'error',
                            isOpen: true, hideDuration: 2000,
                            handleCLose: ()=>{setAlertLocationDB({isOpen: false, message:""})} });
        }
        else
        {
          const selectedLocationName = currentUserOwnedLocation
                                        .filter((location)=>selectedLocations.includes(location.id))
                                        .map((selectedLocation)=>selectedLocation.name)
    
          setSelectedDelLocationsName(selectedLocationName)
          setOpenDelDialog(true)
        }
      }
    

  return (
    <>
        {
            isStreamDBLoading || isLocationDBLoading ?
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: purple[50],
                width: '100%',
                height: '100%',
            }}>
                <CircularProgress sx={{ size: 50 }} />
            </Box>
            :
            <>
                <Alert alertConfig={alertStream}/>
                <Alert alertConfig={alertLocationDB}/>
                <LocationResDialog />
                <DeleteDialog />

                <Box sx={{
                    backgroundColor: blue[50],
                    width: '100%',
                    height: '100%',
                    padding: '20px',
                    display: 'flex',
                    gap: '20px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                }}>
              
                    <Box sx={{
                        display: 'flex',
                        width: '500px',
                        justifyContent:'flex-start',
                        alignItems:'center',
                        gap:'20px'
                    }}>
                        <Button sx={{
                            width: '100px',
                            padding: '10px',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '10px',
                            color: grey[200],
                            backgroundColor: blue[700],
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover' : {
                                color: 'white',
                                backgroundColor: blue[400],
                                transform: 'scale(1.1)'
                            }
                            }}
                            onClick={handleCreateNewLocationRes}
                        >

                            Add <AddCircleIcon sx={{ color: 'inherit'}}/>
                        </Button>

                        <Button sx={{
                            width: '100px',
                            padding: '10px',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '10px',
                            color: grey[200],
                            backgroundColor: indigo[400],
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover' : {
                                color: 'white',
                                backgroundColor: indigo[300],
                                transform: 'scale(1.1)'
                            }
                            }}
                            onClick={handleEditLocationRes}
                        >

                            Edit <EditIcon sx={{ color: 'inherit'}}/>
                        </Button>

                        <Button sx={{
                            width: '110px',
                            padding: '10px',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '10px',
                            color: grey[200],
                            backgroundColor: pink[500],
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover' : {
                                color: 'white',
                                backgroundColor: pink[300],
                                transform: 'scale(1.1)'
                            }
                            }}
                            onClick={handleDeleteLocationRes}
                        >

                            Delete <DeleteForeverIcon sx={{ color: 'inherit'}}/>
                        </Button>

                    </Box>

                    {/* Add the List here */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%' }}>
                        <DataGrid
                        sx={{
                            width: '1000px',
                            border: 0,
                            backgroundColor: "#86b6c2",
                            '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'lightblue',
                            },
                            ".MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel": {
                            "marginTop": "1em",
                            "marginBottom": "1em"
                            }
                        }}
                        rows={currentUserOwnedLocation}
                        columns={columns}
                        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
                        pageSizeOptions={[5, 10, 15]}
                        checkboxSelection
                        // isRowSelectable={(params) => }
                        rowSelectionModel={selectedLocations}
                        onRowSelectionModelChange={handleLocationSelection}  // Updates selected location IDs
                        />
                    </Box>
                </Box>
            </>
        }
    </>
  )
}

export default LocationResBoard