import React, { useState } from 'react';
import Papa from 'papaparse';
import './AnonymizationPage.css';
import { faker } from '@faker-js/faker';

const AnonymizationPage = () => {
    const [inputType, setInputType] = useState('text');
    const [csvData, setCsvData] = useState([]);
    const [columnManipulations, setColumnManipulations] = useState({});
  
    const handleToggle = () => {
      setInputType(inputType === 'text' ? 'file' : 'text');
      clearCsvData();
      clearColumnManipulations();
    };
  
    const handleTextInput = () => {
      const textarea = document.querySelector('textarea');
      
      Papa.parse(textarea.value, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          setCsvData(result.data);
          clearColumnManipulations();
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
        },
      });
    };
  
    const handleColumnManipulation = (column, manipulationType, value) => {
      if (manipulationType === 'fake') {
        switch (value) {
          case 'fullName':
            value = faker.person.fullName();
            break;
          case 'address':
            value = faker.location.city();
            break;
          case 'financeAccount':
            value = faker.finance.accountNumber();
            break;
          default:
            break;
        }
      }
  
      setColumnManipulations((prevManipulations) => ({
        ...prevManipulations,
        [column]: { type: manipulationType, value },
      }));
    };
  
    const handleAnonymizeText = () => {
      const manipulatedData = csvData.map((row) => {
        const manipulatedRow = { ...row };
        Object.keys(columnManipulations).forEach((column) => {
          const manipulation = columnManipulations[column];
          if (manipulation.type === 'fake') {
            manipulatedRow[column] = faker.fake(`{{${manipulation.value}}}`);
          } else if (manipulation.type === 'userInput') {
            manipulatedRow[column] = manipulation.value;
          }
        });
        return manipulatedRow;
      });
      
      setCsvData(manipulatedData);
    };
  
    const clearCsvData = () => {
      setCsvData([]);
    };
  
    const clearColumnManipulations = () => {
      setColumnManipulations({});
    };
  
    const renderTable = () => {
      if (csvData.length > 0) {
        const header = Object.keys(csvData[0]);
        const rows = csvData.slice(0, 5);
  
        return (
          <div className="table-container">
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
                          value={columnManipulations[column]?.value || ''}
                          onChange={(e) =>
                            handleColumnManipulation(column, 'fake', e.target.value)
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
                          value={columnManipulations[column]?.value || ''}
                          onChange={(e) =>
                            handleColumnManipulation(column, 'userInput', e.target.value)
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
    </div>
  );
};

export default AnonymizationPage;
