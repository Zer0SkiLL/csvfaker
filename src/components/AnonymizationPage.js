import React, { useState } from 'react';
import Papa from 'papaparse';
import './AnonymizationPage.css';
import { faker } from '@faker-js/faker';

const AnonymizationPage = () => {
    const [inputType, setInputType] = useState('text');
    const [csvData, setCsvData] = useState([]);
    const [csvDataOutput, setCsvDataOutput] = useState([]);
    const [columnManipulations, setColumnManipulations] = useState({});
    const [columnManupulationsCollection, setColumnManupulationsCollection] = useState([]);
  
    const handleToggle = () => {
      setInputType(inputType === 'text' ? 'file' : 'text');
      clearCsvData();
      clearCsvDataOutput();
      clearColumnManipulations();
      clearColumnManipulationsCollection();
    };
  
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
      columnManupulationsCollection && Object.keys(columnManupulationsCollection).forEach((col) => {
        console.log(columnManupulationsCollection[col])        
        const csvOutput = csvData.map(m => {       
          if (columnManupulationsCollection[col]) {
            if (columnManupulationsCollection[col].type === 'fake') {
              switch (columnManupulationsCollection[col].value) {
                case 'fullName':
                  return modifyObject(m, col, faker.person.fullName());
                  // m[col] = faker.person.fullName();
                case 'address':
                  return modifyObject(m, col, faker.location.city());
                case 'financeAccount':
                  return modifyObject(m, col, faker.finance.accountNumber());
                default:
                  break;
              }                  
            }
  
            if (columnManupulationsCollection[col].type === 'userInput') {
              return modifyObject(m, col, columnManupulationsCollection[col].value);
            }
          }   

          return m;
        })
        console.log(csvOutput)
        setCsvDataOutput(csvOutput);
      })    
    };

    const modifyObject = (originalObject, propertyName, newValue) => {
      return {...originalObject, [propertyName]: newValue};
    }
    
  
    // const handleAnonymizeText = () => {
    //   const manipulatedData = csvData.map((row) => {
    //     const manipulatedRow = { ...row };
    //     Object.keys(columnManipulations).forEach((column) => {
    //       const manipulation = columnManipulations[column];
    //       if (manipulation.type === 'fake') {
    //         manipulatedRow[column] = faker.fake(`{{${manipulation.value}}}`);
    //       } else if (manipulation.type === 'userInput') {
    //         manipulatedRow[column] = manipulation.value;
    //       }
    //     });
    //     return manipulatedRow;
    //   });
      
    //   setCsvData(manipulatedData);
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
            <h2>Output</h2>
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
    </div>
  );
};

export default AnonymizationPage;
