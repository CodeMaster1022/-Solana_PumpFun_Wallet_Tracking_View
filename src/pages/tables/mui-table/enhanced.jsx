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
// table data
function createData(number,address, total, profit, rate, buy,token) {
  return {
    number,
    address,
    total,
    profit,
    rate,
    buy,
    token
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
  createData(1,'Cupcake', 305, 3.7, 67, 4.3,2),
  createData(2,'Donut', 452, 25.0, 51, 4.9,6),
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
    id: 'total',
    numeric: true,
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
    label: 'realized_profit'
  },
  {
    id: 'unrealized_profit',
    numeric: true,
    disablePadding: false,
    label: 'unrealized_profit'
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
    label: 'realized_roi'
  },
  {
    id: 'unrealized_roi',
    numeric: true,
    disablePadding: false,
    label: 'unrealized_roi'
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
    id: 'wintokens_tradedrate',
    numeric: true,
    disablePadding: false,
    label: 'Rate'
  },
  // {
  //   id: 'Avg_Buy_Price',
  //   numeric: true,
  //   disablePadding: false,
  //   label: 'Avg buy rate'
  // },
  {
    id: 'Token_Traded',
    numeric: true,
    disablePadding: false,
    label: 'Token traded'
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
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selectedValue, setSelectedValue] = React.useState([]);
  const [dexItem, setDexItem] = React.useState([]);
  const [dateItem, setDateItem] = React.useState('');
  const [viewIndex, setViewIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [today, setToday] = React.useState([]);
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  useEffect(() => {
    const fetchDexItem = async () => {
      try {
        setLoading(true);
        // const response = await axios.get('https://dex-backend.vercel.app/');  // Fetch the data
        const response = await axios.get('https://solana-pump-fun-wallet-tracking.vercel.app/');  // Fetch the data
        const responseDate = await axios.get('https://dex-backend.vercel.app/date');  // Fetch the dat
        const getToday = new Date();
        const getThreeDay = new Date(getToday); // Use getToday instead of today
        getThreeDay.setDate(getToday.getDate() + 3);
        
        const getThirtyDay = new Date(getToday); // Use getToday instead of today
        getThirtyDay.setDate(getToday.getDate() + 30);
        setToday([getToday, getThreeDay, getThirtyDay]);
        console.log(responseDate)
        if(response.data&&responseDate.data){
          setDexItem(response.data);
          setDateItem(responseDate.data);
          await delay(300);
          setLoading(false);
        }  // Update state with the fetched data
      } catch (err) {
        setLoading(false)
        alert("There is no any data");  // Set error state if the request fails
      } 
    };

    fetchDexItem();  // Call the function to fetch data
  }, []);  
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
    <TableContainer>
      <Box sx={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <ButtonGroup disableElevation variant="contained" aria-label="outlined primary button group">
          <Button key="one" onClick={()=>setViewIndex(0)} color={viewIndex == 0 ? "success" : "primary"}>1D</Button>
          <Button key="two" onClick={()=>setViewIndex(1)} color={viewIndex == 1 ? "success" : "primary"}>7D</Button>
          <Button key="three" onClick={()=>setViewIndex(2)} color={viewIndex == 2 ? "success" : "primary"}>30D</Button>
        </ButtonGroup>
        <Typography>
          {today[viewIndex]?.toLocaleDateString()}
        </Typography>
      </Box>

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
              const isItemSelected = isSelected(row.name);
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.id}
                  selected={isItemSelected}
                >
                  <TableCell align="center" width={"50px"} sx={{padding:'0px'}}>{(page)*rowsPerPage+index+1}</TableCell>
                  <TableCell align="center" component="th" id={labelId} scope="row" padding="none">
                      <Box sx={{display:'flex', justifyContent:'center',alignItems:'center'}}>
                        <Typography fontSize={12}>{row.wallet_address}</Typography>
                      </Box>
                  </TableCell>
                  <TableCell align="center">
                      {row.realized_profit[viewIndex] ? row.realized_profit[viewIndex].toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell align="center" ><Typography color='#D9A23B' fontSize={12}>{row.unrealized_profit[viewIndex] ? row.unrealized_profit[viewIndex].toFixed(2) : '0.00'}</Typography></TableCell>
                  <TableCell align="center">
                    <Typography fontSize={12}>
                    {row.combined_profit[viewIndex] ? row.combined_profit[viewIndex].toFixed(2) : '0.00'}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontSize={12}>
                    {row.realized_roi[viewIndex] ? row.realized_roi[viewIndex].toFixed(2) : '0.00'}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontSize={12}>
                    {row.unrealized_roi[viewIndex] ? row.unrealized_roi[viewIndex].toFixed(2) : '0.00'}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontSize={12}>
                    {row.combined_roi[viewIndex] ? row.combined_roi[viewIndex].toFixed(2) : '0.00'}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontSize={12}>
                    {row.winrate[viewIndex] ? row.winrate[viewIndex].toFixed(2) : '0.00'}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontSize={12}>
                    {row.tokens_traded[viewIndex] ? row.tokens_traded[viewIndex].toFixed(2) : '0.00'}%
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ pr: 3}} align="center">
                  <Typography fontSize={12}>{row.tokens_traded[0]}&nbsp;&nbsp;</Typography>
                      {/* <Button onClick={() => copyToClipboard(row.Address)}><Typography sx={{backgroundColor:'#141414',borderRadius:'10px',px:'2px',fontSize:'12px'}}>&nbsp;Copy&nbsp;</Typography></Button> */}
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
      rowsPerPageOptions={[5, 10, 25]}
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
