import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { ButtonGroup } from '@mui/material';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableRow from '@mui/material/TableRow';
import { visuallyHidden } from '@mui/utils';
import { CopyOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toast } from 'react-toastify';
// project imports
import MainCard from 'components/MainCard';
import Typography from '@mui/material/Typography';
// import { CSVExport, RowSelection } from 'components/third-party/react-table';
import "../../../CSS/loading.css"
import "../../../CSS/copybutton.css"
import "../../../CSS/spinNumber.css"
import { filter } from 'lodash';
import { Link } from 'react-router-dom';
// table data
function createData(_id,wallet_address, realized_profit, unrealized_profit, combined_profit, realized_roi,unrealized_roi,combined_roi,winrate,tokens_traded) {
  return {
    _id,
    wallet_address,
    realized_profit,
    unrealized_profit,
    combined_profit,
    realized_roi,
    unrealized_roi,
    combined_roi,
    winrate,
    tokens_traded
  };
}
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
};
// table data
const rows = [
  createData('325345','325345xsdfwertwerwerwe',2, 4, 5,6,3,6,2,3),
];

// table filter
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// table header
const headCells = [
  {
    id: '_id',
    numeric: false,
    disablePadding: false,
    label: '#'
  },
  {
    id: 'wallet_address',
    numeric: false,
    disablePadding: true,
    label: 'wallet_address'
  },
  {
    id: 'realized_profit',
    numeric: true,
    disablePadding: false,
    label: 're_profit'
  },
  {
    id: 'unrealized_profit',
    numeric: true,
    disablePadding: false,
    label: 'un_profit'
  },
  {
    id: 'combined_profit',
    numeric: true,
    disablePadding: false,
    label: 'combined_profit'
  },
  {
    id: 'realized_roi',
    numeric: true,
    disablePadding: false,
    label: 're_roi'
  },
  {
    id: 'unrealized_roi',
    numeric: true,
    disablePadding: false,
    label: 'un_roi'
  },
  {
    id: 'combined_roi',
    numeric: true,
    disablePadding: false,
    label: 'combined_roi'
  },
  {
    id: 'winrate',
    numeric: true,
    disablePadding: false,
    label: 'winrate'
  },
  {
    id: 'tokens_traded',
    numeric: true,
    disablePadding: false,
    label: 'Token traded'
  },
  {
    id: 'average_traded_time',
    numeric: true,
    disablePadding: false,
    label: 'Avg_Time'
  }
];

// ==============================|| MUI TABLE - HEADER ||============================== //

function EnhancedTableHead({ onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort }) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <>
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'left' : 'left'}
            // padding={headCell.disablePadding ? 'none' : 'none'}
            sortDirection={orderBy === headCell.id ? order : undefined}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box sx={visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
    </>
  );
}

// ==============================|| TABLE - ENHANCED ||============================== //

export default function EnhancedTable() {

  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(15);
  const [selectedValue, setSelectedValue] = React.useState([]);
  const [dexItem, setDexItem] = React.useState([]);
  const [dateItem, setDateItem] = React.useState('');
  const [viewIndex, setViewIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [temp, setTemp] = React.useState([]);
  const [saveData, setSaveData] = React.useState([]);

  const [searchValue, setSearchValue] = React.useState('');

  const handleApply = () => {
    if(searchValue !== ''){
      const filterItems = saveData.filter((value) => value.realized_roi >= searchValue);
      setDexItem(filterItems);
    } else {
      setDexItem(saveData);
    }
    console.log(searchValue,"value========>", filterItems)
    
  }
  const handleReset = () => {
    setDexItem(saveData);
    setSearchValue('');
  }
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
        handleApply(); // Call handleApply when Enter is pressed
    }
};

  const [today, setToday] = React.useState([]);
  // const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  useEffect(() => {
    const fetchDexItem = async () => {
      try {
        setLoading(true);
        // const response = await axios.get('https://dex-backend.vercel.app/');  // Fetch the data
        const response = await axios.get('https://solana-pump-fun-wallet-tracking.vercel.app/');  // Fetch the data
        const responseDate = await axios.get('https://dex-backend.vercel.app/date');  // Fetch the dat
        const getToday = new Date();
        const getThreeDay = new Date(getToday); // Use getToday instead of today
        getThreeDay.setDate(getToday.getDate() - 7);
        
        const getThirtyDay = new Date(getToday); // Use getToday instead of today
        getThirtyDay.setDate(getToday.getDate() - 30);
        const covertThreeDay =getThreeDay.toLocaleDateString() + '~' + getToday.toLocaleDateString();
        const convertThirtyDay =getThirtyDay.toLocaleDateString() + '~' + getToday.toLocaleDateString() ;
        setToday([getToday.toLocaleDateString(), covertThreeDay, convertThirtyDay]);
        console.log(responseDate)
        if(response.data&&responseDate.data){
          setTemp(response.data);
          console.log(dexItem,'dex===>')
          setDateItem(responseDate.data);
          // await delay(300);
          setLoading(false);
        }  // Update state with the fetched data
      } catch (err) {
        setLoading(false)
        alert("There is no any data");  // Set error state if the request fails
      } 
    };

    fetchDexItem();  // Call the function to fetch data
  }, []);  

  useEffect(()=>{
    if(temp){
    const indexValues = temp.map(data => ({
      _id: data._id,
      wallet_address: data.wallet_address,
      realized_profit: data.realized_profit[viewIndex],
      unrealized_profit: data.unrealized_profit[viewIndex],
      combined_profit: data.combined_profit[viewIndex],
      realized_roi: data.realized_roi[viewIndex],
      unrealized_roi: data.unrealized_roi[viewIndex],
      combined_roi: data.combined_roi[viewIndex],
      winrate: data.winrate[viewIndex],
      tokens_traded: data.tokens_traded[viewIndex],
      average_traded_time: data.average_traded_time[viewIndex]
  }));
    setSaveData(indexValues);
    setDexItem(indexValues)
  }
  },[viewIndex, temp])
  const handleSearchValue = (e) => {
    setSearchValue(e.target.value);
  }
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event?.target.value, 10));
    setPage(0);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - dexItem.length) : 0;

  return ( 
  <>
    {loading?
      <div class="loader">Loading
        <span></span>
      </div>:    
    <MainCard
      content={false}
    >
      <Box sx={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <ButtonGroup disableElevation variant="contained" aria-label="outlined primary button group">
          <Button key="one" onClick={()=>{setViewIndex(0);handleReset();}} color={viewIndex == 0 ? "success" : "primary"}>1D</Button>
          <Button key="two" onClick={()=>{setViewIndex(1);handleReset();}} color={viewIndex == 1 ? "success" : "primary"}>7D</Button>
          <Button key="three" onClick={()=>{setViewIndex(2);handleReset();}} color={viewIndex == 2 ? "success" : "primary"}>30D</Button>
        </ButtonGroup>
        <Typography>
          {today[viewIndex]}
        </Typography>
          <div class="number-control">
            <Typography color="gray">Realized_Roi&nbsp;</Typography>
          {/* <Button onClick={handleReset}>Reset</Button> */}
          <div class="number-left"></div>
            <input type="number" onKeyDown={handleKeyDown} value={searchValue} name="number" className="number-quantity" onChange={handleSearchValue}/>
          <div class="number-right"></div> 
          <Button onClick={handleApply} disabled={searchValue === ''}>Search</Button>
          </div>
      </Box>
    <TableContainer>
      <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={dense ? 'small' : 'medium'}>
        <EnhancedTableHead
          numSelected={selected.length}
          order={order}
          orderBy={orderBy}
          onRequestSort={handleRequestSort}
          rowCount={dexItem.length}
        />
        <TableBody>
          {stableSort(dexItem, getComparator(order, orderBy))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, index) => {
              if (typeof row === 'number') return null;
              // const isItemSelected = isSelected(row.id);
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={row.id}
                >
                  <TableCell align="center" sx={{padding:'0px'}}>{(page)*rowsPerPage+index+1}</TableCell>
                  <TableCell align="center" component="th" id={labelId} scope="row" padding="none">
                      <Box sx={{display:'flex', justifyContent:'left',alignItems:'center'}}>
                      <a href={`https://gmgn.ai/sol/address/${row.wallet_address}`} target="_blank" rel="noopener noreferrer">
                        <Typography fontSize={12}>{row.wallet_address}</Typography>
                      </a>
                      </Box>
                  </TableCell>
                  <TableCell align="center">
                  <Typography fontSize={12}>{row.realized_profit ? row.realized_profit.toFixed(2)  : '0.00'}</Typography>
                  </TableCell>
                  <TableCell align="center" ><Typography fontSize={12}>{row.unrealized_profit ? row.unrealized_profit.toFixed(2) : '0.00'}</Typography></TableCell>
                  <TableCell align="center">
                    <Typography fontSize={12}>
                    {row.combined_profit ? row.combined_profit.toFixed(2)  : '0.00'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography color='#D9A23B' fontSize={12}>
                    {row.realized_roi ? row.realized_roi.toFixed(2)  : '0.00'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontSize={12}>
                    {row.unrealized_roi ? row.unrealized_roi.toFixed(2)  : '0.00'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontSize={12}>
                    {row.combined_roi ? row.combined_roi.toFixed(2)  : '0.00'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontSize={12}>
                    {row.winrate ? row.winrate.toFixed(2)  : '0.00'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontSize={12}>
                    {row.tokens_traded ? row.tokens_traded.toFixed(2)  : '0.00'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ pr: 3}} align="center">
                    <Typography fontSize={12}>{row.average_traded_time.toFixed(2) }&nbsp;&nbsp;</Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          {emptyRows > 0 && (
            <TableRow sx={{ height: (dense ? 33 : 53) * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
    <Divider />

    {/* table pagination */}
    <TablePagination
      rowsPerPageOptions={[10, 15, 25,50,100]}
      component="div"
      count={dexItem.length}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
    </MainCard>}   
</>
  );

}

EnhancedTableHead.propTypes = {
  onSelectAllClick: PropTypes.any,
  order: PropTypes.any,
  orderBy: PropTypes.any,
  numSelected: PropTypes.any,
  rowCount: PropTypes.any,
  onRequestSort: PropTypes.any
};
