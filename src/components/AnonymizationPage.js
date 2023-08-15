import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './AnonymizationPage.css';
import { faker } from '@faker-js/faker';

const AnonymizationPage = () => {
    const [inputType, setInputType] = useState('text');
    const [csvData, setCsvData] = useState([]);
    const [csvDataOutput, setCsvDataOutput] = useState([]);
    const [columnManipulations, setColumnManipulations] = useState({});
    const [columnManupulationsCollection, setColumnManupulationsCollection] = useState([]);
    const [exportData, setExportData] = useState('');
    const [exportDataFile, setExportDataFile] = useState(null);
    const [outputType, setOutputType] = useState('text');
  
    const handleToggle = () => {
      setInputType(inputType === 'text' ? 'file' : 'text');
      setOutputType(outputType === 'text' ? 'file' : 'text');
      clearCsvData();
      clearCsvDataOutput();
      clearColumnManipulations();
      clearColumnManipulationsCollection();
    };

    const handleToggleOutput = () => {
      setOutputType(outputType === 'text' ? 'file' : 'text');
    }
  
    const handleTextInput = () => {
      const textarea = document.querySelector('textarea');
      
      Papa.parse(textarea.value, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          setCsvData(result.data);
          clearColumnManipulations();
          clearColumnManipulationsCollection();
        },
      });
    };
  
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
  
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          setCsvData(result.data);
          clearColumnManipulations();          
          clearColumnManipulationsCollection();
        },
      });
    };

    const handleColumnManipulationChange = (column, manipulationType, value) => {
      // check if this particular entry is already in the collection - if so, update this entry, else add it
      const columnManupulationsCollectionTmp = columnManupulationsCollection;
      if (columnManupulationsCollectionTmp[column]) {
        columnManupulationsCollectionTmp[column].type = manipulationType;
        columnManupulationsCollectionTmp[column].value = value;
      } else {
        columnManupulationsCollectionTmp[column] = { type: manipulationType, value };
      }

      // when we get a specific manipulation type / value, we add it into a collection, in order to map it later on
      setColumnManupulationsCollection((prevCollection) => ({
        ...prevCollection,
        [column]: { type: columnManupulationsCollectionTmp[column].type, value: columnManupulationsCollectionTmp[column].value },
      }))

      console.log(columnManupulationsCollection)

    }
  
    const handleColumnManipulation = (column, manipulationType) => {
      if (columnManupulationsCollection[column]?.type !== manipulationType) {
        // remove this object from the array
        columnManupulationsCollection[column] = null;
      }

      console.log(column, manipulationType)
      console.log(columnManupulationsCollection)
  
      setColumnManipulations((prevManipulations) => ({
        ...prevManipulations,
        [column]: { type: manipulationType },
      }));
    };

    const handleColManipulationValue = () => {
      // iterate over columnManupulationsCollection in order to create new values for a new dataset if needed
      console.log(columnManupulationsCollection)
             
      let csvOutput = [];
      csvData.forEach(element => {
        columnManupulationsCollection && Object.keys(columnManupulationsCollection).forEach((col) => {
          console.log(columnManupulationsCollection[col]) 
          if (columnManupulationsCollection[col].type === 'fake') {
            switch (columnManupulationsCollection[col].value) {
              case 'fullName':
                element = modifyObject(element, col, faker.person.fullName());
                // m[col] = faker.person.fullName();
              break;
              case 'address':
                element = modifyObject(element, col, faker.location.city());
              break;
              case 'financeAccount':
                element = modifyObject(element, col, faker.finance.accountNumber());
              break;
              default:
                break;
            }                  
          }

          if (columnManupulationsCollection[col].type === 'userInput') {
            element = modifyObject(element, col, columnManupulationsCollection[col].value);
          }   
        });
        csvOutput.push(element);    
      });
      
      console.log(csvOutput)
      setCsvDataOutput(csvOutput);

      // handleExport();
    };

    const modifyObject = (originalObject, propertyName, newValue) => {
      return {...originalObject, [propertyName]: newValue};
    }

    useEffect(() => {
      console.log(csvDataOutput)
      const csvString = Papa.unparse(csvDataOutput);
      console.log(csvString)
      setExportData(Papa.unparse(csvDataOutput));
      setExportDataFile(new Blob([csvString], { type: 'text/csv;charset=utf-8' }));
    }, [csvDataOutput]);

    // const handleExport = () => {
    //   console.log(csvDataOutput)
    //   let dataToExport = '';
    //   if (inputType === 'text') {
    //     // Use original CSV data if input is text
    //     dataToExport = Papa.unparse(csvDataOutput);
    //   } else {
    //     // Use manipulated data if input is file
    //     dataToExport = new Blob(Papa.unparse(csvDataOutput));
    //   }
    //   setExportData(dataToExport);
    //   console.log(exportData)
    // };
  
    const handleCopyToClipboard = () => {
      navigator.clipboard.writeText(exportData).then(() => {
        alert('Data copied to clipboard');
      });
    };
    
  
    // const handleExport = () => {
    //   let exportData = [];
    //   if (inputType === 'text') {
    //     // Use original CSV data if input is text
    //     exportData = csvDataOutput;
    //   } else {
    //     // Use manipulated data if input is file
    //     exportData = manipulatedData.length > 0 ? manipulatedData : csvData;
    //   }
  
    //   const csv = Papa.unparse(csvDataOutput);
      
    //   if (inputType === 'text') {
    //     // Export as text
    //     const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });
    //     saveAs(blob, 'data.txt');
    //   } else {
    //     // Export as CSV file
    //     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    //     saveAs(blob, 'manipulated_data.csv');
    //   }
    // };
  
    const clearCsvData = () => {
      setCsvData([]);
    };

    const clearCsvDataOutput = () => {
      setCsvDataOutput([]);
    };
  
    const clearColumnManipulations = () => {
      setColumnManipulations({});
    };

    const clearColumnManipulationsCollection = () => {
      setColumnManupulationsCollection([]);
    }
  
    const renderTable = () => {
      if (csvData.length > 0) {
        const header = Object.keys(csvData[0]);
        const rows = csvData.slice(0, 5);
  
        return (
          <div className="table-container">
            <h2>Input</h2>
            <table className="csv-table">
              <thead>
                <tr>
                  {header.map((column, index) => (
                    <th key={index}>
                      
                      <select
                        value={columnManipulations[column]?.type || ''}
                        onChange={(e) =>
                          handleColumnManipulation(column, e.target.value)
                        }
                      >
                        <option value="">No Manipulation</option>
                        <option value="fake">Fake Data</option>
                        <option value="userInput">User Input</option>
                      </select>
                      {columnManipulations[column]?.type === 'fake' && (
                        <select
                          value={columnManupulationsCollection[column]?.value || ''}
                          onChange={(e) =>
                            handleColumnManipulationChange(column, 'fake', e.target.value)
                          }
                        >
                          <option value="">Choose Fake Data</option>
                          <option value="fullName">Name</option>
                          <option value="address">Address</option>
                          <option value="financeAccount">Account</option>
                        </select>
                      )}
                      {columnManipulations[column]?.type === 'userInput' && (
                        <input
                          type="text"
                          value={columnManupulationsCollection[column]?.value || ''}
                          onChange={(e) =>
                            handleColumnManipulationChange(column, 'userInput', e.target.value)
                          }
                        />
                      )}
                      <br />
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {header.map((column, columnIndex) => (
                      <td key={columnIndex}>{row[column]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {csvData.length > 5 && (
              <p className="message">This is a sample display. There is more data available.</p>
            )}
          </div>
        );
      }
    };

    const renderTableOutput = () => {
      if (csvDataOutput.length > 0) {
        const header = Object.keys(csvDataOutput[0]);
        const rows = csvDataOutput.slice(0, 5);
  
        return (
          <div className="table-container">
            <h2>Output Preview</h2>
            <table className="csv-table">
              <thead>
                <tr>
                  {header.map((column, index) => (
                    <th key={index}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {header.map((column, columnIndex) => (
                      <td key={columnIndex}>{row[column]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {csvDataOutput.length > 5 && (
              <p className="message">This is a sample display. There is more data available.</p>
            )}
          </div>
        );
      }
    };

  const renderInput = () => {
    if (inputType === 'text') {
      return (
        <div>
          <textarea className="csv-textarea" placeholder="Enter CSV data..." rows="5" />
          <button className="anonymize-button" onClick={handleTextInput}>Anonymize Text</button>
        </div>
      );
    } else {
      return (
        <div>
          <input className="file-input" type="file" onChange={handleFileUpload} />
        </div>
      );
    }
  };

  

  return (
    <div>
      <h1>Anonymization Tool</h1>
      <button className="toggle-button" onClick={handleToggle}>
        {inputType === 'text' ? 'Switch to File Input' : 'Switch to Text Input'}
      </button>
      {renderInput()}
      <button className="clear-button" onClick={clearCsvData}>Clear Data</button>
      {renderTable()}
      {csvData.length > 0 ? <button className='clear-button' onClick={handleColManipulationValue}>Run</button> : ''}
      {renderTableOutput()}
      {exportData.length > 0 && (
      <div>
        <button className="toggle-button" onClick={handleToggleOutput}>
          {outputType === 'text' ? 'Switch to File Output' : 'Switch to Text Output'}
        </button>
        {outputType === 'text' ? (
          <div>
            <textarea value={exportData} readOnly rows="5" cols="50" />
            <button onClick={handleCopyToClipboard}>Copy to Clipboard</button>
          </div>
        ) : (
          <a
            // href={`data:text/csv;charset=utf-8,${encodeURIComponent(exportDataFile)}`}
            href={URL.createObjectURL(exportDataFile)}
            download={`manipulated_data_${Date.now().toString()}.csv`}
          >
            Export CSV
          </a>
        )}
      </div>
    )}
    </div>
  );
};

export default AnonymizationPage;
