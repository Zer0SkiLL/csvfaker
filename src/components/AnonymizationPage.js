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

    const fakerOptions = [
      { label: 'Firstname', value: 'person.firstName' },
      { label: 'Lastname', value: 'person.lastName' },
      { label: 'Fullname', value: 'person.fullName' },
      { label: 'Address', value: 'location.streetAddress' },
      { label: 'City', value: 'location.city' },
      { label: 'Zip', value: 'location.zipCode' },
      { label: 'email', value: 'email' },
      { label: 'phone', value: 'phone.number' },
      { label: 'Finance Account', value: 'finance.accountNumber', option: 8 },
      { label: 'Finance Account Name', value: 'finance.accountName' },
      { label: 'Finance Amount', value: 'finance.amount' },
      { label: 'IBAN', value: 'finance.iban' },
      { label: 'Credit Card CVV', value: 'finance.creditCardCVV' },
      { label: 'Credit Card Issuer', value: 'finance.creditCardIssuer' },
      { label: 'Credit Card Number', value: 'finance.creditCardNumber' },
      { label: 'Transaction Description', value: 'finance.transactionDescription' },
    ]
  
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
          const sanitizedDate = result.data.filter(f => !hastEmptyValues(f));
          setCsvData(sanitizedDate);
          clearColumnManipulations();
          clearColumnManipulationsCollection();
        },
      });
    };

    const hastEmptyValues = (obj) => {
      for (const key in obj) {
        if (obj[key] !== null && obj[key] !== undefined) {
          return false;
        }
      }
      return true;
    }
  
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
      console.log(csvData);

      let csvOutput = [];
      csvData.forEach(element => {
        columnManupulationsCollection && Object.keys(columnManupulationsCollection).forEach((col) => {
          console.log(columnManupulationsCollection[col]) 
          if (columnManupulationsCollection[col].type === 'fake') {
            // element = modifyObject(element, col, faker.person.fullName());

            const fakerMethods = {
              'person.firstName': faker.person.firstName,
              'person.lastName': faker.person.lastName,
              'person.fullName': faker.person.fullName,
              'location.streetAddress': faker.location.streetAddress,
              'location.city': faker.location.city,
              'location.zipCode': faker.location.zipCode,
              'email': faker.internet.email,
              'phone.number': faker.phone.number,
              'finance.accountNumber': faker.finance.accountNumber,
              'finance.accountName': faker.finance.accountName,
              'finance.amount': faker.finance.amount,
              'finance.iban': faker.finance.iban,
              'finance.creditCardCVV': faker.finance.creditCardCVV,
              'finance.creditCardIssuer': faker.finance.creditCardIssuer,
              'finance.creditCardNumber': faker.finance.creditCardNumber,
              'finance.transactionDescription': faker.finance.transactionDescription,
            };
            
            console.log(typeof fakerMethods[columnManupulationsCollection[col].value])
            console.log(fakerMethods[columnManupulationsCollection[col].value]())
            // try to generate the data
            try {
              if (typeof fakerMethods[columnManupulationsCollection[col].value] === 'function') {
                var newVal = fakerMethods[columnManupulationsCollection[col].value](columnManupulationsCollection[col].option);
                element = modifyObject(element, col, newVal);
              }
            } catch (error) {
              element = 'error while generating';
              console.log(error);
            }
      
            // switch (columnManupulationsCollection[col].value) {
            //   case 'person.firstName':
            //     element = modifyObject(element, col, faker.person.firstName());
            //   break;
            //   case 'person.lastName':
            //     element = modifyObject(element, col, faker.person.lastName());
            //   break;
            //   case 'person.fullName':
            //     element = modifyObject(element, col, faker.person.fullName());
            //   break;
            //   case 'location.streetAddress':
            //     element = modifyObject(element, col, faker.location.streetAddress());
            //   break;
            //   case 'location.city':
            //     element = modifyObject(element, col, faker.location.city());
            //   break;
            //   case 'location.zipCode':
            //     element = modifyObject(element, col, faker.location.zipCode());
            //   break;
            //   case 'email':
            //     element = modifyObject(element, col, faker.internet.email());
            //   break;
            //   case 'phone':
            //     element = modifyObject(element, col, faker.phone.phoneNumber());
            //   break;
            //   default:
            //     break;
            // }                  
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
                          {fakerOptions.map((option, index) => (
                            <option key={index} value={option.value}>{option.label}</option>
                          ))}
                          {/* <option value="fullName">Name</option>
                          <option value="address">Address</option>
                          <option value="financeAccount">Account</option> */}
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
    <div className="Content-AnonymizationPage">
      <h2>Csv</h2>
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
            <textarea className="csv-textarea" value={exportData} readOnly rows="5" cols="50" />
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
