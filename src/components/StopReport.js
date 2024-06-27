import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 function from uuid library

const StopReport = ({ dataEmit }) => {
    // Initialize state with local storage data or default
    const [data, setData] = useState(() => {
        const savedData = localStorage.getItem('realTimeTableData');
        return savedData ? JSON.parse(savedData) : [];
    });
    const [textInputs, setTextInputs] = useState({});

    // Update local storage whenever 'data' changes
    useEffect(() => {
        localStorage.setItem('realTimeTableData', JSON.stringify(data));
    }, [data]);

    useEffect(() => {
        if (dataEmit.isMoving === 'Stopped') {
            const newDataObject = {
                id: uuidv4(),
                timestamp: dataEmit.timestamp ? new Date(dataEmit.timestamp).toLocaleString() : '',
                remarks: '', // Initialize remarks as empty string
                date: new Date().toLocaleDateString(), // Current date
                time: new Date().toLocaleTimeString() // Current time
            };

            // Update state to include the new data object
            setData(prevData => [...prevData, newDataObject]);
        }
    }, [dataEmit]);

    const handleText = (e, id) => {
        setTextInputs({
            ...textInputs,
            [id]: e.target.value
        });
    };

    const handleClick = (id) => {
        setData(prevData =>
            prevData.map(item =>
                item.id === id ? { ...item, remarks: textInputs[id] || '' } : item
            )
        );
    };

    const handleClearData = () => {
        setData([]); // Clear all data
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Generate a binary string of the workbook
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

        // Convert the binary string to a Blob
        const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });

        // Save the file using FileSaver.js
        saveAs(blob, "data.xlsx");
    };

    // Utility function to convert a string to an ArrayBuffer
    const s2ab = (s) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    };

    return (
        <Wrapper>
            <div className='table'>
                <div className='nav'>
                    <div className='nav-inner'>
                        Real Time Stoppage Report
                    </div>
                </div>
                <div className='cell serial'>S.No</div>
                <div className='cell id'>ID</div>
                <div className='cell date'>Date</div>
                <div className='cell time'>Time</div>
                <div className='cell remark'>Remarks</div>
                {data.map((el, index) => (
                    <React.Fragment key={index}>
                        <div className='cell serial'>{index + 1}</div>
                        <div className='cell id'>{el.id}</div>
                        <div className='cell date'>{el.date}</div>
                        <div className='cell time'>{el.time}</div>
                        <div className='cell remark'>
                            {el.remarks !== '' ? (
                                el.remarks
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        onChange={(e) => handleText(e, el.id)}
                                        value={textInputs[el.id] || ''}
                                        placeholder="Add remark"
                                    />
                                    <button onClick={() => handleClick(el.id)}>Add</button>
                                </>
                            )}
                        </div>
                    </React.Fragment>
                ))}
            </div>
            <div className="buttons">

                <button onClick={exportToExcel}>Export to Excel</button>
                <button onClick={handleClearData}>Clear Data</button>
            </div>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    color: #4deeea;
    background-color: #0e254a;
    nav-inner{
    text-align: center;
    color: #4deeea;
    }
    .nav{
    background-color: #0e254a;
    display: flex;
    justify-content: space-evenly;
    font-size: 2.8rem;
    }

    .buttons button{
        padding: 0.3rem;
    }
    .nav{
    grid-column:1/-1;
    }
    .buttons{
        display: flex;
        width: 100%;
        height: 100px;
        justify-content: space-evenly;
        align-items: center;
    }
    button{
        background-color: #82ca9d;
        width: 10%;
        border: none;
    }   
    .table {
        display: grid;
        grid-template-columns: 0.1fr 0.2fr 0.4fr 0.4fr 1fr;
        gap: 3.5px;
        border: 1px solid #ccc;
         max-height: 65vh; /* Adjust based on the height of your rows */
        overflow-y: auto;
    }

    .cell {
        padding: 10px;
        border: 1px solid #ccc;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .cell.serial {
        grid-column: 1/2;
    }

    .cell.id {
        grid-column: 2/3;
    }

    .cell.date {
        grid-column: 3/4;
        color: #82ca9d;
    }

    .cell.time {
        grid-column: 4/5;
        color: #8884d8;
    }

    .cell.remark {
        grid-column: 5/6;
        display: flex;
        justify-content: space-evenly;
    }
    input{
        width: 50%;
        padding: 0.3rem;
    }
    input:focus {
		outline: none;
	}
    
    
`;

export default StopReport;
