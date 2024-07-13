import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

const StopReport = ({ dataEmit }) => {
    const [data, setData] = useState(() => {
        const savedData = localStorage.getItem('realTimeTableData');
        return savedData ? JSON.parse(savedData) : [];
    });
    const [textInputs, setTextInputs] = useState({});
    const [editing, setEditing] = useState({});
    const [currentStoppage, setCurrentStoppage] = useState(null);

    useEffect(() => {
        localStorage.setItem('realTimeTableData', JSON.stringify(data));
    }, [data]);

    useEffect(() => {
        if (dataEmit.isMoving === 'Stopped' && currentStoppage==null) {
            const startTime = dataEmit.timestamp ? new Date(dataEmit.timestamp).getTime() : Date.now();
            const newStoppage = {
                id: uuidv4(),
                timestamp: dataEmit.timestamp ? new Date(dataEmit.timestamp).toLocaleString() : '',
                startTime: startTime,
                remarks: '',
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                stoppageTime: 0
            };

            setCurrentStoppage(newStoppage);
            setData(prevData => [...prevData, newStoppage]);
        } else if (dataEmit.isMoving === 'Moving' && currentStoppage) {
            const endTime = dataEmit.timestamp ? new Date(dataEmit.timestamp).getTime() : Date.now();
            const stoppageTime = endTime - currentStoppage.startTime;
            if (stoppageTime > 0) {
                const updatedStoppage = {
                    ...currentStoppage,
                    stoppageTime: formatStoppageTime(stoppageTime)
                };

                setData(prevData =>
                    prevData.map(item =>
                        item.id === currentStoppage.id ? updatedStoppage : item
                    )
                );
            }
            setCurrentStoppage(null);
        }
        
    }, [dataEmit]);

    useEffect(() => {
        const saveAndClearData = () => {
            exportToExcel();
            setData([]);
        };

        const timeout = setTimeout(saveAndClearData, 24 * 60 * 60 * 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    const formatStoppageTime = (timeInMilliseconds) => {
        if (timeInMilliseconds <= 0) {
            return '0 ms';
        } else if (timeInMilliseconds < 1000) {
            return `${timeInMilliseconds} ms`;
        } else if (timeInMilliseconds < 60000) {
            return `${(timeInMilliseconds / 1000).toFixed(2)} s`;
        } else if (timeInMilliseconds < 3600000) {
            return `${(timeInMilliseconds / 60000).toFixed(2)} min`;
        } else {
            return `${(timeInMilliseconds / 3600000).toFixed(2)} h`;
        }
    };

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
        setEditing({ ...editing, [id]: false });
    };

    const handleEdit = (id) => {
        setEditing({ ...editing, [id]: true });
        setTextInputs({ ...textInputs, [id]: data.find(item => item.id === id).remarks });
    };

    const handleClearData = () => {
        setData([]);
        setTextInputs({});
        setEditing({});
    };

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Real Time Stoppage Report');

        // Define column headers and their styling
        worksheet.columns = [
            { header: 'S.No', key: 'sNo', width: 10 },
            { header: 'ID', key: 'id', width: 36 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Time', key: 'time', width: 15 },
            { header: 'Stoppage Time', key: 'stoppageTime', width: 20 },
            { header: 'Remarks', key: 'remarks', width: 50 }
        ];

        // Add header styling
        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '4472C4' },
            };
        });

        // Add rows
        data.forEach((item, index) => {
            worksheet.addRow({
                sNo: index + 1,
                id: item.id,
                date: item.date,
                time: item.time,
                stoppageTime: item.stoppageTime,
                remarks: item.remarks
            });
        });

        // Apply styling to data rows
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            }
        });

        // Generate the Excel file and trigger the download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        saveAs(blob, "RealTimeStoppageReport.xlsx");
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
                <div className='cell stoppage-time'>Stoppage Time</div>
                <div className='cell remark'>Remarks</div>
                {data.map((el, index) => (
                    <React.Fragment key={el.id}>
                        <div className='cell serial'>{index + 1}</div>
                        <div className='cell id'>{el.id}</div>
                        <div className='cell date'>{el.date}</div>
                        <div className='cell time'>{el.time}</div>
                        <div className='cell stoppage-time'>{el.stoppageTime}</div>
                        <div className='cell remark'>
                            {editing[el.id] ? (
                                <div className='edit'>
                                    <input
                                        type="text"
                                        onChange={(e) => handleText(e, el.id)}
                                        value={textInputs[el.id] || ''}
                                        placeholder="Edit remark"
                                    />
                                    <button onClick={() => handleClick(el.id)}>Save</button>
                                </div>
                            ) : (
                                <div className='edit'>
                                    <div className='text'>{el.remarks}</div>
                                    <button onClick={() => handleEdit(el.id)}>Edit</button>
                                </div>
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
    .edit {
        display: flex;
        flex-direction: column;
    }

    .nav-inner {
        text-align: center;
        color: #4deeea;
    }

    .nav {
        background-color: #0e254a;
        display: flex;
        justify-content: space-evenly;
        font-size: 2.8rem;
    }

    .buttons button {
        padding: 0.3rem;
    }

    .nav {
        grid-column: 1/-1;
    }

    .buttons {
        display: flex;
        width: 100%;
        height: 100px;
        justify-content: space-evenly;
        align-items: center;
    }

    button {
        background-color: #82ca9d;
        border: none;
    }

    .table {
        display: grid;
        grid-template-columns: 0.1fr 0.3fr 0.4fr 0.4fr 0.6fr 1fr;
        gap: 3.5px;
        border: 1px solid #ccc;
        max-height: 65vh;
        overflow-y: auto;
    }

    .cell {
        padding: 10px;
        border: 1px solid #ccc;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .cell.serial { grid-column: 1/2; }
    .cell.id { grid-column: 2/3; }
    .cell.date { grid-column: 3/4; color: #82ca9d; }
    .cell.time { grid-column: 4/5; color: #8884d8; }
    .cell.stoppage-time { grid-column: 5/6; color: #d88484; }
    .cell.remark { grid-column: 6/7; display: flex; justify-content: space-evenly; }
`;

export default StopReport;
