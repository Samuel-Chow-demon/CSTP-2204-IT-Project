import { Box, Button, CircularProgress, Paper, styled, Tooltip } from '@mui/material'
import { blue, grey, indigo, pink, purple } from '@mui/material/colors'
import {Fragment, useState, useRef, useEffect, memo} from 'react'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useStreamDB } from '../contexts/StreamDBContext';
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


// Define the DataTable Column Setup
// field follow the database key
const DISPLAY_ID_LENGTH = 10

const columns = [
  { field: 'id',
    headerName: 'ID',
    width: 150,
    renderCell: (params)=> `${params.value.substring(0, DISPLAY_ID_LENGTH)}...` },
  { field: 'name', headerName: 'Stream Name', width: 200 },
  { field: 'devLocation', headerName: 'Device Location', width: 200 },
  { field: 'streamAPI', headerName: 'Stream API or Path', width: 400 }
  
];

const StreamResBoard = () => {

  const {
    alertStream, setAlertStream,
    isDBLoading, setDBIsLoading,
    currentUserOwnedStream,
    deleteStreamRes
  } = useStreamDB()

  const [selectedStreams, setSelectedStreams] = useState([])
  const [selectedDelStreamsName, setSelectedDelStreamsName] = useState([])

  const [openCreateEditDialog, setOpenCreateEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({})

  const [openDelDialog, setOpenDelDialog] = useState(false);

  const handleStreamSelection = (newSelection)=>{
    
    setSelectedStreams(newSelection);
  }

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

  const StreamResDialog = memo(() => {

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
        >
          <DialogTitle style={{ cursor: 'move', textAlign: 'center' }} id="draggable-dialog-title">
            {Object.keys(editForm).length <= 0 ? "Create" : "Edit"} Stream Resource
          </DialogTitle>
          <DialogContent>
            <Paper style={{
              height: '100%',
              width: '400px',
              display: 'flex',
              marginTop: '10px',
              flexDirection: 'column', gap: '20px',
              justifyContent: 'center', alignItems: 'center'
            }}
              elevation={0}>

              <StreamForm setOpenDialog={setOpenCreateEditDialog}
                          currentStreamForm={editForm}/>

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
                    Delete Stream Resources
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
                                await deleteStreamRes({idList:selectedStreams})
                                setSelectedStreams([]);
                              }}
                                    itemList={selectedDelStreamsName}
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

  const handleCreateNewStreamRes = ()=>{
 
    // Clear the edit form to set as a new Creation
    setEditForm({});
    setSelectedStreams([]);
    setOpenCreateEditDialog(true);
  }

  const handleEditStreamRes = ()=>{

    let errMsg = ""
    if (selectedStreams.length <= 0)
    {
      errMsg = "Please Select A Stream Before Edit";
    }
    else if (selectedStreams.length != 1)
    {
      errMsg = "Please Select Only One Stream To Edit";
    }

    if (errMsg)
    {
      setAlertStream({...alertStream,
                       toggle: !alertStream.toggle,
                       message:errMsg,
                       color: 'error',
                      isOpen: true, hideDuration: 2000,
                      handleCLose: ()=>{setAlertStream({isOpen: false, message:""})} });
    }
    else
    {
      const selectedForm = currentUserOwnedStream.filter((stream)=>stream.id == selectedStreams.at(-1))[0] // set the last one in the list into the edit form
      console.log(selectedForm);
      setEditForm(selectedForm);
      setSelectedStreams([]);
      setOpenCreateEditDialog(true);
    }
  }

  const handleDeleteStreamRes = ()=>{
 
    let errMsg = ""
    if (selectedStreams.length <= 0)
    {
      errMsg = "Please Select One or More Stream(s) Before Delete";
    }

    if (errMsg)
    {
      setAlertStream({...alertStream,
                       toggle: !alertStream.toggle,
                       message:errMsg,
                       color: 'error',
                      isOpen: true, hideDuration: 2000,
                      handleCLose: ()=>{setAlertStream({isOpen: false, message:""})} });
    }
    else
    {
      const selectedStreamName = currentUserOwnedStream
                                    .filter((stream)=>selectedStreams.includes(stream.id))
                                    .map((selectedStream)=>selectedStream.name)

      setSelectedDelStreamsName(selectedStreamName)
      setOpenDelDialog(true)
    }
  }

  return (
    <>
      {
        isDBLoading ?
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
          <StreamResDialog />
          <DeleteDialog />
          <Box sx={{
              backgroundColor: purple[50],
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
                  backgroundColor: purple[700],
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover' : {
                    color: 'white',
                    backgroundColor: purple[400],
                    transform: 'scale(1.1)'
                  }
                }}
                onClick={handleCreateNewStreamRes}
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
                onClick={handleEditStreamRes}
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
                onClick={handleDeleteStreamRes}
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
                  backgroundColor: "#d4c1e3",
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: 'lightblue',
                  },
                  ".MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel": {
                    "marginTop": "1em",
                    "marginBottom": "1em"
                  }
                }}
                rows={currentUserOwnedStream}
                columns={columns}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
                pageSizeOptions={[5, 10, 15]}
                checkboxSelection
                // isRowSelectable={(params) => }
                rowSelectionModel={selectedStreams}
                onRowSelectionModelChange={handleStreamSelection}  // Updates selected stream IDs
              />
            </Box>

          </Box>
        </>
      }
    </>

  )
}

export default StreamResBoard